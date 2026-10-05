import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Modal, Pressable, StyleSheet, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { getLocales } from 'expo-localization';
import { X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button, T, haptic } from './ui';
import { DateCandidate, parseExpiryDates } from '../utils/ocrDate';
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

export const ScannerModal = ({ mode, onClose, onBarcode, onDates, footnote }: Props) => {
    const { colors } = useTheme();
    const { t } = useLanguage();
    const insets = useSafeAreaInsets();
    const [permission, requestPermission] = useCameraPermissions();
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const camera = useRef<CameraView>(null);
    const handled = useRef(false);

    useEffect(() => {
        if (mode) {
            handled.current = false;
            setBusy(false);
            setMessage(null);
        }
    }, [mode]);

    useEffect(() => {
        if (mode && permission && !permission.granted && permission.canAskAgain) requestPermission();
    }, [mode, permission?.granted, permission?.canAskAgain]);

    const capture = async () => {
        if (!camera.current || busy) return;
        setBusy(true);
        setMessage(null);
        try {
            const photo = await camera.current.takePictureAsync({ quality: 0.7, skipProcessing: false });
            if (!photo?.uri) throw new Error('no photo');
            const text = await recognizeText(photo.uri);
            const monthFirst = getLocales()[0]?.regionCode === 'US';
            const dates = parseExpiryDates(text, monthFirst);
            if (dates.length === 0) {
                haptic('warning');
                setMessage(t('noDateFoundBody'));
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

                {/* Viewfinder */}
                <View style={styles.overlay} pointerEvents="none">
                    <View style={[styles.frame, mode === 'date' ? styles.frameDate : styles.frameBarcode, { borderColor: colors.soon }]} />
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
                    </View>
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
    frameDate: { width: '84%', height: 120 },
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
