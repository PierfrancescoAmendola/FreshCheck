import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Modal, Platform, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { getLocales } from 'expo-localization';
import { Flashlight, FlashlightOff, X, ZoomIn, ZoomOut } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button, T, haptic } from './ui';
import { DateCandidate, mergeDateReadings, parseExpiryDates } from '../utils/ocrDate';
import { deleteFile, enhancedVariants } from '../utils/ocrImage';
import { RADIUS, SPACE } from '../theme/tokens';

export type ScanMode = 'barcode' | 'date';

interface Props {
    mode: ScanMode | null;
    onClose: () => void;
    onBarcode: (code: string) => void;
    onDates: (dates: DateCandidate[]) => void;
    footnote?: string;
}

// ML Kit is a native module; it is missing in Expo Go, so load it lazily
const recognizeText = async (uri: string): Promise<string> => {
    const mod = require('@react-native-ml-kit/text-recognition');
    const result = await mod.default.recognize(uri);
    return result.text as string;
};

// A reading this good (expiry label next to a full date) needs no extra passes
const CONFIDENT_SCORE = 8;

// expo-camera zoom is a fraction of the device range: iOS maps it exponentially, Android linearly.
// Both values land near 2x on common phones, enough to make small print readable while in focus.
const CLOSE_UP_ZOOM = Platform.OS === 'ios' ? 0.12 : 0.25;

const DATE_FRAME_HEIGHT = 120;

// Single focus scan, then back to continuous autofocus so moving the phone still refocuses
const FOCUS_HOLD_MS = 2500;
const FOCUS_SETTLE_MS = 450;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const ScannerModal = ({ mode, onClose, onBarcode, onDates, footnote }: Props) => {
    const { colors } = useTheme();
    const { t } = useLanguage();
    const insets = useSafeAreaInsets();
    const [permission, requestPermission] = useCameraPermissions();
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [torch, setTorch] = useState(false);
    const [closeUp, setCloseUp] = useState(false);
    const [focusing, setFocusing] = useState(false);
    const focusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();
    const camera = useRef<CameraView>(null);
    const handled = useRef(false);

    useEffect(() => {
        if (mode) {
            handled.current = false;
            setBusy(false);
            setMessage(null);
            setTorch(false);
            setCloseUp(false);
            setFocusing(false);
        }
    }, [mode]);

    useEffect(() => () => {
        if (focusTimer.current) clearTimeout(focusTimer.current);
    }, []);

    // Forces a fresh focus scan on the center of the frame
    const refocus = () => {
        if (focusTimer.current) clearTimeout(focusTimer.current);
        // The native side only rescans when the prop changes, so drop it for a frame first
        setFocusing(false);
        requestAnimationFrame(() => setFocusing(true));
        focusTimer.current = setTimeout(() => setFocusing(false), FOCUS_HOLD_MS);
    };

    useEffect(() => {
        if (mode && permission && !permission.granted && permission.canAskAgain) requestPermission();
    }, [mode, permission?.granted, permission?.canAskAgain]);

    const capture = async () => {
        if (!camera.current || busy) return;
        setBusy(true);
        setMessage(null);
        try {
            // Make sure the label is sharp before shooting
            refocus();
            await wait(FOCUS_SETTLE_MS);
            if (!camera.current) return;
            const photo = await camera.current.takePictureAsync({ quality: 1, skipProcessing: false });
            if (!photo?.uri) throw new Error('no photo');
            const monthFirst = getLocales()[0]?.regionCode === 'US';
            const readings = [parseExpiryDates(await recognizeText(photo.uri), monthFirst)];
            // Small, faint, embossed or light-on-grey print: retry on cropped, enlarged, high-contrast variants
            if ((readings[0][0]?.score ?? 0) < CONFIDENT_SCORE) {
                try {
                    // Generous band around the viewfinder, people rarely frame the date exactly
                    const bandHeight = DATE_FRAME_HEIGHT * 2.4;
                    const region = {
                        screenWidth,
                        screenHeight,
                        rect: { x: 0, y: (screenHeight - bandHeight) / 2, width: screenWidth, height: bandHeight },
                    };
                    for await (const uri of enhancedVariants(photo.uri, region)) {
                        try {
                            readings.push(parseExpiryDates(await recognizeText(uri), monthFirst));
                        } finally {
                            deleteFile(uri);
                        }
                        if ((mergeDateReadings(readings)[0]?.score ?? 0) >= CONFIDENT_SCORE) break;
                    }
                } catch (e) {
                    console.warn('ocr enhance', e);
                }
            }
            const dates = mergeDateReadings(readings);
            if (dates.length === 0) {
                haptic('warning');
                setMessage(torch ? t('noDateFoundBody') : `${t('noDateFoundBody')} ${t('tryTorch')}`);
                setBusy(false);
                return;
            }
            haptic('success');
            onDates(dates);
        } catch (e: any) {
            console.warn('ocr', e);
            setMessage(String(e?.message ?? '').includes('linked') ? t('ocrUnavailable') : t('noDateFoundBody'));
            setBusy(false);
        }
    };

    const denied = permission && !permission.granted && !permission.canAskAgain;

    return (
        <Modal visible={!!mode} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
            <View style={styles.root}>
                {permission?.granted && mode && (
                    <CameraView
                        ref={camera}
                        style={StyleSheet.absoluteFill}
                        facing="back"
                        enableTorch={torch}
                        zoom={closeUp ? CLOSE_UP_ZOOM : 0}
                        autofocus={focusing ? 'on' : 'off'}
                        barcodeScannerSettings={mode === 'barcode' ? { barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'] } : undefined}
                        onBarcodeScanned={
                            mode === 'barcode'
                                ? ({ data }) => {
                                    if (handled.current) return;
                                    handled.current = true;
                                    haptic('success');
                                    onBarcode(data);
                                }
                                : undefined
                        }
                    />
                )}

                {/* Tap anywhere on the preview to refocus */}
                {permission?.granted && (
                    <Pressable
                        style={StyleSheet.absoluteFill}
                        accessibilityLabel={t('tapToFocus')}
                        onPress={() => {
                            haptic('light');
                            refocus();
                        }}
                    />
                )}

                {/* Viewfinder */}
                <View style={styles.overlay} pointerEvents="none">
                    <View style={[styles.frame, mode === 'date' ? styles.frameDate : styles.frameBarcode, { borderColor: colors.soon, opacity: focusing ? 0.55 : 1 }]} />
                </View>

                <View style={[styles.top, { paddingTop: insets.top + SPACE.md }]}>
                    <Pressable onPress={onClose} accessibilityLabel={t('close')} style={styles.close} hitSlop={10}>
                        <X size={22} color="#FFFFFF" />
                    </Pressable>
                    <View style={{ flex: 1 }}>
                        <T v="h3" color="#FFFFFF">
                            {mode === 'date' ? t('scanDateTitle') : t('scanBarcodeTitle')}
                        </T>
                        {mode === 'date' && (
                            <T v="small" color="#FFFFFF" style={{ opacity: 0.75 }}>
                                {t('scanDateHint')}
                            </T>
                        )}
                        <T v="small" color="#FFFFFF" style={{ opacity: 0.75 }}>
                            {t('tapToFocus')}
                        </T>
                    </View>
                    {permission?.granted && (
                        <Pressable
                            onPress={() => setCloseUp((v) => !v)}
                            accessibilityLabel={closeUp ? t('zoomOut') : t('zoomIn')}
                            accessibilityState={{ selected: closeUp }}
                            style={[styles.close, closeUp && styles.toggleOn]}
                            hitSlop={10}
                        >
                            {closeUp ? <ZoomOut size={20} color="#111827" /> : <ZoomIn size={20} color="#FFFFFF" />}
                        </Pressable>
                    )}
                    {permission?.granted && (
                        <Pressable
                            onPress={() => {
                                haptic('light');
                                setTorch((v) => !v);
                            }}
                            accessibilityLabel={torch ? t('torchOff') : t('torchOn')}
                            accessibilityState={{ selected: torch }}
                            style={[styles.close, torch && styles.toggleOn]}
                            hitSlop={10}
                        >
                            {torch ? <FlashlightOff size={20} color="#111827" /> : <Flashlight size={20} color="#FFFFFF" />}
                        </Pressable>
                    )}
                </View>

                <View style={[styles.bottom, { paddingBottom: insets.bottom + SPACE.xl }]}>
                    {denied && (
                        <View style={[styles.note, { backgroundColor: colors.surface }]}>
                            <T v="bodyStrong">{t('cameraDenied')}</T>
                            <T v="small" muted style={{ marginBottom: SPACE.md }}>
                                {t('cameraDeniedBody')}
                            </T>
                            <Button small label={t('openSettings')} onPress={() => Linking.openSettings()} />
                        </View>
                    )}
                    {message && (
                        <View style={[styles.note, { backgroundColor: colors.surface }]}>
                            <T v="small">{message}</T>
                        </View>
                    )}
                    {footnote && !message && (
                        <T v="small" color="#FFFFFF" center style={{ opacity: 0.8, marginBottom: SPACE.md }}>
                            {footnote}
                        </T>
                    )}
                    {mode === 'date' && permission?.granted && (
                        <Pressable onPress={capture} accessibilityLabel={t('capture')} style={styles.shutter} disabled={busy}>
                            {busy ? <ActivityIndicator color="#111827" /> : <View style={styles.shutterInner} />}
                        </Pressable>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#000' },
    overlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
    frame: { borderWidth: 2, borderRadius: RADIUS.lg },
    frameBarcode: { width: '78%', height: 170 },
    frameDate: { width: '84%', height: DATE_FRAME_HEIGHT },
    top: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: SPACE.md,
        paddingHorizontal: SPACE.lg,
        paddingBottom: SPACE.lg,
        backgroundColor: 'rgba(0,0,0,0.45)',
    },
    close: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    toggleOn: { backgroundColor: '#FFFFFF' },
    bottom: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: SPACE.lg,
    },
    note: {
        alignSelf: 'stretch',
        padding: SPACE.lg,
        borderRadius: RADIUS.md,
        marginBottom: SPACE.lg,
    },
    shutter: {
        width: 76,
        height: 76,
        borderRadius: 38,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    shutterInner: {
        width: 62,
        height: 62,
        borderRadius: 31,
        borderWidth: 2,
        borderColor: '#111827',
    },
});
