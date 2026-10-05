import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { DarkTheme, DefaultTheme, NavigationContainer, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart3, ChefHat, ListChecks, Plus, Refrigerator } from 'lucide-react-native';
import { RootStackParamList, TabParamList } from './types';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { usePantry } from '../contexts/PantryContext';
import { FONTS, RADIUS, shadow, SPACE } from '../theme/tokens';
import { T, haptic } from '../components/ui';
import { PantryScreen } from '../screens/PantryScreen';
import { RecipesScreen } from '../screens/RecipesScreen';
import { RecipeDetailScreen } from '../screens/RecipeDetailScreen';
import { ShoppingScreen } from '../screens/ShoppingScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { ItemEditorScreen } from '../screens/ItemEditorScreen';
import { PaywallScreen } from '../screens/PaywallScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { RemindersScreen } from '../screens/RemindersScreen';
import { LocationsScreen } from '../screens/LocationsScreen';
import { PrivacyScreen } from '../screens/PrivacyScreen';
import { navigationRef } from '../components/DevShotHook';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TAB_ICONS = {
    Pantry: Refrigerator,
    Recipes: ChefHat,
    Shopping: ListChecks,
    Stats: BarChart3,
} as const;

const TabBar = ({ state, navigation }: BottomTabBarProps) => {
    const { colors, isDark } = useTheme();
    const { t } = useLanguage();
    const { canAddItem } = usePantry();
    const insets = useSafeAreaInsets();
    const labels: Record<keyof TabParamList, string> = {
        Pantry: t('tabPantry'),
        Recipes: t('tabRecipes'),
        Shopping: t('tabShopping'),
        Stats: t('tabStats'),
    };

    const renderTab = (index: number) => {
        const route = state.routes[index];
        const focused = state.index === index;
        const Icon = TAB_ICONS[route.name as keyof TabParamList];
        return (
            <Pressable
                key={route.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: focused }}
                onPress={() => {
                    haptic();
                    navigation.navigate(route.name);
                }}
                style={styles.tab}
            >
                <View style={[styles.tabIcon, focused && { backgroundColor: colors.accentTint }]}>
                    <Icon size={21} color={focused ? colors.accent : colors.muted} strokeWidth={focused ? 2.4 : 1.9} />
                </View>
                <T
                    v="tiny"
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.75}
                    color={focused ? colors.accent : colors.muted}
                    style={{ fontFamily: focused ? FONTS.bodyHeavy : FONTS.bodySemi }}
                >
                    {labels[route.name as keyof TabParamList]}
                </T>
            </Pressable>
        );
    };

    return (
        <View style={[styles.barWrap, { paddingBottom: Math.max(insets.bottom, SPACE.md) }]} pointerEvents="box-none">
            <View style={[styles.bar, { backgroundColor: colors.surface }, shadow(isDark)]}>
                {renderTab(0)}
                {renderTab(1)}
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('newItem')}
                    onPress={() => {
                        haptic();
                        navigation.navigate(canAddItem ? 'ItemEditor' : 'Paywall', canAddItem ? undefined : { reason: 'items' });
                    }}
                    style={({ pressed }) => [styles.add, shadow(isDark, colors.accent), { transform: [{ scale: pressed ? 0.9 : 1 }] }]}
                >
                    <LinearGradient colors={[colors.accent, colors.accentGrad]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.addInner}>
                        <Plus size={28} color={colors.onAccent} strokeWidth={2.8} />
                    </LinearGradient>
                </Pressable>
                {renderTab(2)}
                {renderTab(3)}
            </View>
        </View>
    );
};

const Tabs = () => (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(p) => <TabBar {...p} />}>
        <Tab.Screen name="Pantry" component={PantryScreen} />
        <Tab.Screen name="Recipes" component={RecipesScreen} />
        <Tab.Screen name="Shopping" component={ShoppingScreen} />
        <Tab.Screen name="Stats" component={StatsScreen} />
    </Tab.Navigator>
);

export const RootNavigator = () => {
    const { colors, isDark } = useTheme();
    const base = isDark ? DarkTheme : DefaultTheme;
    const navTheme: Theme = {
        ...base,
        colors: { ...base.colors, background: colors.background, card: colors.surface, text: colors.ink, border: colors.line, primary: colors.accent },
    };

    return (
        <NavigationContainer theme={navTheme} ref={navigationRef}>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: colors.background },
                }}
            >
                <Stack.Screen name="Tabs" component={Tabs} />
                <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
                <Stack.Screen name="Settings" component={SettingsScreen} />
                <Stack.Screen name="Reminders" component={RemindersScreen} />
                <Stack.Screen name="Locations" component={LocationsScreen} />
                <Stack.Screen name="Privacy" component={PrivacyScreen} />
                <Stack.Group screenOptions={{ presentation: 'modal' }}>
                    <Stack.Screen name="ItemEditor" component={ItemEditorScreen} />
                    <Stack.Screen name="Paywall" component={PaywallScreen} />
                </Stack.Group>
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    barWrap: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: SPACE.lg,
    },
    bar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: RADIUS.xl,
        paddingVertical: SPACE.sm,
        paddingHorizontal: SPACE.xs,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        gap: 2,
        paddingVertical: 2,
    },
    tabIcon: {
        width: 46,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    add: {
        width: 58,
        height: 58,
        borderRadius: 21,
        marginHorizontal: SPACE.xs,
        marginTop: -26,
    },
    addInner: {
        flex: 1,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
