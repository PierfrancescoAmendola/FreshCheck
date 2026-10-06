import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarDays, Check, PackageOpen, ScanLine, Snowflake, Sparkles, Trash2, X } from 'lucide-react-native';
import { RootScreen } from '../navigation/types';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ItemDraft, usePantry } from '../contexts/PantryContext';
import { usePremium } from '../contexts/PremiumContext';
import { Button, Chip, IconButton, ProBadge, SectionLabel, T, haptic } from '../components/ui';
import { CategoryIcon } from '../components/icons';
import { ScanMode, ScannerModal } from '../components/ScannerModal';
import { CATEGORY_IDS, CategoryId } from '../types';
import { suggestedShelfLife } from '../data/ingredients';
import { addDays, daysUntil, startOfDay } from '../utils/dateUtils';
import { DateCandidate } from '../utils/ocrDate';
import { lookupBarcode } from '../utils/openFoodFacts';
import { locationName } from '../utils/labels';
import { getOcrUsed, setOcrUsed } from '../utils/storage';
import { FREE_LIMITS } from '../config';
import { FONTS, RADIUS, SPACE, shadow } from '../theme/tokens';
import { TKey } from '../i18n';

export const ItemEditorScreen = ({ navigation, route }: RootScreen<'ItemEditor'>) => {
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const { t, date, language } = useLanguage();
    const { isPro } = usePremium();
    const { items, locations, addItem, updateItem, finishItem, deleteItem, markOpened, moveToFreezer, addShopping } = usePantry();

    const editing = useMemo(() => items.find((i) => i.id === route.params?.itemId), [items, route.params?.itemId]);

    const [name, setName] = useState(editing?.name ?? '');
    const [category, setCategory] = useState<CategoryId>(editing?.category ?? 'other');
    const [locationId, setLocationId] = useState(editing?.locationId ?? 'fridge');
    const [expiry, setExpiry] = useState<Date>(editing ? new Date(editing.expirationDate) : addDays(startOfDay(), 7));
    const [priceText, setPriceText] = useState(editing?.price !== undefined ? String(editing.price) : '');
    const [barcode, setBarcode] = useState(editing?.barcode);
    const [showPicker, setShowPicker] = useState(false);
    const [scanMode, setScanMode] = useState<ScanMode | null>(null);
    const [lookingUp, setLookingUp] = useState(false);
    const [candidates, setCandidates] = useState<DateCandidate[]>([]);
    const [ocrUsed, setOcrUsedState] = useState(0);
    const [dateTouched, setDateTouched] = useState(!!editing);

    useEffect(() => {
        getOcrUsed().then(setOcrUsedState);
        if (route.params?.startScan) openScanner(route.params.startScan);
    }, []);

    const ocrLeft = Math.max(0, FREE_LIMITS.ocrScans - ocrUsed);
    const suggestion = name.trim().length > 1 ? suggestedShelfLife(name, category) : null;

    const openScanner = (mode: ScanMode) => {
        if (mode === 'date' && !isPro && ocrLeft === 0) {
            navigation.navigate('Paywall', { reason: 'ocr' });
            return;
        }
        setScanMode(mode);
    };

    const onBarcode = async (code: string) => {
        setScanMode(null);
        setBarcode(code);
        setLookingUp(true);
        try {
            const product = await lookupBarcode(code, language);
            if (product) {
                setName(product.name);
                if (product.category) setCategory(product.category);
                if (!dateTouched) setExpiry(addDays(startOfDay(), suggestedShelfLife(product.name, product.category ?? category)));
            } else {
                Alert.alert(t('productNotFound'), t('productNotFoundBody'));
            }
        } catch {
            Alert.alert(t('error'), t('lookupFailed'));
        } finally {
            setLookingUp(false);
        }
    };

    const onDates = async (dates: DateCandidate[]) => {
        setScanMode(null);
        if (dates.length === 0) return;
        if (!isPro) {
            const used = ocrUsed + 1;
            setOcrUsedState(used);
            await setOcrUsed(used);
        }
        setDateTouched(true);
        setExpiry(dates[0].date);
        setCandidates(dates.length > 1 ? dates.slice(0, 4) : []);
    };

    const onPickDate = (e: DateTimePickerEvent, d?: Date) => {
        if (Platform.OS === 'android') setShowPicker(false);
        if (e.type === 'set' && d) {
            setExpiry(d);
            setDateTouched(true);
        }
    };

    const quick = (n: number) => {
        haptic();
        setExpiry(addDays(startOfDay(), n));
        setDateTouched(true);
    };

    // A quick double tap on save must not add the item twice
    const saving = useRef(false);
    const save = async () => {
        if (saving.current) return;
        if (!name.trim()) {
            Alert.alert(t('nameRequired'));
            return;
        }
        saving.current = true;
        const price = parseFloat(priceText.replace(',', '.'));
        const draft: ItemDraft = {
            name,
            category,
            locationId: isPro ? locationId : editing?.locationId ?? 'fridge',
            expirationDate: expiry,
            price: Number.isFinite(price) && price >= 0 ? price : undefined,
            barcode,
        };
        haptic('success');
        try {
            if (editing) await updateItem(editing.id, draft);
            else await addItem(draft);
            navigation.goBack();
        } finally {
            saving.current = false;
        }
    };

    const finish = async (outcome: 'consumed' | 'wasted') => {
        if (!editing) return;
        const done = await finishItem(editing.id, outcome);
        navigation.goBack();
        if (done)
            Alert.alert(t('addToList'), t('addToListBody', { name: done.name }), [
                { text: t('no'), style: 'cancel' },
                { text: t('yes'), onPress: () => addShopping([done.name]) },
            ]);
    };

    const freeze = async () => {
        if (!editing) return;
        if (!isPro) return navigation.navigate('Paywall', { reason: 'freezer' });
        const next = await moveToFreezer(editing.id);
        if (next) {
            setExpiry(new Date(next.expirationDate));
            setLocationId('freezer');
            Alert.alert(t('moveToFreezer'), t('freezerExtended', { date: date(next.expirationDate) }));
        }
    };

    const opened = async () => {
        if (!editing) return;
        await markOpened(editing.id);
        navigation.goBack();
    };

    const remove = () => {
        if (!editing) return;
        Alert.alert(t('delete'), editing.name, [
            { text: t('cancel'), style: 'cancel' },
            {
                text: t('delete'),
                style: 'destructive',
                onPress: async () => {
                    await deleteItem(editing.id);
                    navigation.goBack();
                },
            },
        ]);
    };

    const days = daysUntil(expiry);

    return (
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? insets.top + SPACE.md : SPACE.lg }]}>
                <IconButton label={t('close')} onPress={() => navigation.goBack()}>
                    <X size={18} color={colors.ink} />
                </IconButton>
                <T v="h3" style={{ flex: 1, textAlign: 'center' }}>
                    {editing ? t('editItem') : t('newItem')}
                </T>
                <IconButton label={t('save')} onPress={save} tint={colors.accent}>
                    <Check size={20} color={colors.onAccent} strokeWidth={2.6} />
                </IconButton>
            </View>

            <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SPACE.xxxl }]} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
                {/* Capture tiles */}
                <View style={styles.tiles}>
                    <Pressable
                        onPress={() => openScanner('barcode')}
                        style={({ pressed }) => [styles.tile, { backgroundColor: colors.card, borderColor: 'transparent', ...shadow(isDark), transform: [{ scale: pressed ? 0.97 : 1 }] }]}
                    >
                        {lookingUp ? <ActivityIndicator color={colors.accent} /> : <ScanLine size={22} color={colors.accent} />}
                        <T v="bodyStrong">{lookingUp ? t('lookingUp') : t('scanBarcode')}</T>
                    </Pressable>
                    <Pressable
                        onPress={() => openScanner('date')}
                        style={({ pressed }) => [styles.tile, { backgroundColor: colors.card, borderColor: 'transparent', ...shadow(isDark), transform: [{ scale: pressed ? 0.97 : 1 }] }]}
                    >
                        <View style={styles.tileTop}>
                            <Sparkles size={22} color={colors.accent} />
                            {!isPro && <ProBadge />}
                        </View>
                        <T v="bodyStrong">{t('scanDate')}</T>
                        {!isPro && (
                            <T v="tiny" muted>
                                {t('ocrTrialsLeft', { n: ocrLeft })}
                            </T>
                        )}
                    </Pressable>
                </View>

                {/* Name */}
                <SectionLabel>{t('name')}</SectionLabel>
                <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder={t('namePlaceholder')}
                    placeholderTextColor={colors.muted}
                    style={[styles.nameInput, { color: colors.ink, borderColor: colors.line }]}
                    returnKeyType="done"
                    autoFocus={!editing && !route.params?.startScan}
                />

                {/* Expiry */}
                <View style={{ marginTop: SPACE.xl }}>
                    <SectionLabel>{t('expiry')}</SectionLabel>
                    <Pressable
                        onPress={() => setShowPicker((s) => !s)}
                        style={[styles.dateBox, { backgroundColor: colors.card, borderColor: 'transparent', ...shadow(isDark) }]}
                    >
                        <CalendarDays size={20} color={colors.inkSoft} />
                        <T v="h2" style={{ flex: 1 }}>
                            {date(expiry)}
                        </T>
                        <T v="small" color={days < 0 ? colors.expired : days <= 3 ? colors.today : colors.muted} style={{ fontFamily: FONTS.bodyBold }}>
                            {days < 0 ? t('expiredAgo', { n: -days }) : days === 0 ? t('todayShort') : `${days} ${days === 1 ? t('dayLeft') : t('daysLeft')}`}
                        </T>
                    </Pressable>

                    {candidates.length > 0 && (
                        <View style={{ marginTop: SPACE.md }}>
                            <T v="small" muted style={{ marginBottom: SPACE.sm }}>
                                {t('pickDate')}
                            </T>
                            <View style={styles.wrap}>
                                {candidates.map((c) => (
                                    <Chip
                                        key={c.date.toISOString()}
                                        label={date(c.date)}
                                        selected={c.date.toDateString() === expiry.toDateString()}
                                        onPress={() => setExpiry(c.date)}
                                    />
                                ))}
                            </View>
                        </View>
                    )}

                    {showPicker && (
                        <DateTimePicker
                            value={expiry}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'inline' : 'default'}
                            onChange={onPickDate}
                            accentColor={colors.accent}
                            themeVariant={undefined}
                            style={{ marginTop: SPACE.sm }}
                        />
                    )}

                    <View style={[styles.wrap, { marginTop: SPACE.md }]}>
                        <Chip label={t('plus3')} onPress={() => quick(3)} />
                        <Chip label={t('plus7')} onPress={() => quick(7)} />
                        <Chip label={t('plus30')} onPress={() => quick(30)} />
                        {suggestion !== null && (
                            <Chip
                                label={`${t('suggested', { n: suggestion })} · ${t('useSuggestion')}`}
                                icon={<Sparkles size={12} color={colors.ink} />}
                                onPress={() => quick(suggestion)}
                            />
                        )}
                    </View>
                </View>

                {/* Category */}
                <View style={{ marginTop: SPACE.xl }}>
                    <SectionLabel>{t('category')}</SectionLabel>
                    <View style={styles.wrap}>
                        {CATEGORY_IDS.map((c) => (
                            <Chip
                                key={c}
                                label={t(`cat_${c}` as TKey)}
                                selected={category === c}
                                onPress={() => setCategory(c)}
                                icon={<CategoryIcon category={c} size={14} color={category === c ? colors.background : colors.inkSoft} />}
                            />
                        ))}
                    </View>
                </View>

                {/* Location */}
                <View style={{ marginTop: SPACE.xl }}>
                    <SectionLabel right={!isPro ? <ProBadge /> : undefined}>{t('location')}</SectionLabel>
                    <View style={styles.wrap}>
                        {locations.map((l) => (
                            <Chip
                                key={l.id}
                                label={locationName(l, t)}
                                selected={(isPro ? locationId : 'fridge') === l.id}
                                locked={!isPro && l.id !== 'fridge'}
                                onPress={() => (isPro ? setLocationId(l.id) : navigation.navigate('Paywall', { reason: 'locations' }))}
                            />
                        ))}
                    </View>
                </View>

                {/* Price */}
                <View style={{ marginTop: SPACE.xl }}>
                    <SectionLabel>{t('price')}</SectionLabel>
                    <TextInput
                        value={priceText}
                        onChangeText={(v) => setPriceText(v.replace(/[^0-9.,]/g, ''))}
                        placeholder={t('pricePlaceholder')}
                        placeholderTextColor={colors.muted}
                        keyboardType="decimal-pad"
                        style={[styles.priceInput, { color: colors.ink, backgroundColor: colors.card, borderColor: 'transparent', ...shadow(isDark) }]}
                    />
                </View>

                {editing && (
                    <View style={{ marginTop: SPACE.xxl, gap: SPACE.sm }}>
                        <View style={styles.row2}>
                            <Button label={t('markConsumed')} kind="secondary" style={{ flex: 1 }} icon={<Check size={18} color={colors.accent} />} onPress={() => finish('consumed')} />
                            <Button label={t('markWasted')} kind="ghost" style={{ flex: 1 }} icon={<Trash2 size={16} color={colors.ink} />} onPress={() => finish('wasted')} />
                        </View>
                        <View style={styles.row2}>
                            <Button label={t('markOpened')} kind="ghost" small style={{ flex: 1 }} icon={<PackageOpen size={16} color={colors.ink} />} onPress={opened} />
                            <Button label={t('moveToFreezer')} kind="ghost" small style={{ flex: 1 }} icon={<Snowflake size={16} color={colors.ink} />} onPress={freeze} />
                        </View>
                        <Pressable onPress={remove} style={{ alignSelf: 'center', padding: SPACE.md }}>
                            <T v="small" color={colors.expired}>
                                {t('delete')}
                            </T>
                        </Pressable>
                    </View>
                )}

                {!editing && <Button label={t('add')} onPress={save} style={{ marginTop: SPACE.xxl }} />}
            </ScrollView>

            <ScannerModal
                mode={scanMode}
                onClose={() => setScanMode(null)}
                onBarcode={onBarcode}
                onDates={onDates}
                footnote={scanMode === 'date' && !isPro ? t('ocrTrialsLeft', { n: ocrLeft }) : undefined}
            />
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACE.lg,
        paddingBottom: SPACE.md,
    },
    content: {
        paddingHorizontal: SPACE.lg,
        paddingTop: SPACE.md,
    },
    tiles: {
        flexDirection: 'row',
        gap: SPACE.md,
        marginBottom: SPACE.xl,
    },
    tile: {
        flex: 1,
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: RADIUS.lg,
        padding: SPACE.lg,
        gap: SPACE.sm,
        minHeight: 104,
    },
    tileTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    nameInput: {
        fontFamily: FONTS.display,
        fontSize: 26,
        paddingVertical: SPACE.sm,
        borderBottomWidth: 1.5,
    },
    dateBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACE.md,
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: RADIUS.lg,
        padding: SPACE.lg,
    },
    wrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACE.sm,
    },
    priceInput: {
        fontFamily: FONTS.bodySemi,
        fontSize: 17,
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: RADIUS.md,
        paddingHorizontal: SPACE.lg,
        paddingVertical: SPACE.md,
    },
    row2: {
        flexDirection: 'row',
        gap: SPACE.sm,
    },
});
