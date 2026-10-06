import React from 'react';
import { Alert } from 'react-native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { ThemeProvider } from '../contexts/ThemeContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { PantryProvider, usePantry } from '../contexts/PantryContext';
import { ItemEditorScreen } from '../screens/ItemEditorScreen';
import { RemindersScreen } from '../screens/RemindersScreen';
import { PantryScreen } from '../screens/PantryScreen';
import { RecipesScreen } from '../screens/RecipesScreen';
import { RecipeDetailScreen } from '../screens/RecipeDetailScreen';
import { ShoppingScreen } from '../screens/ShoppingScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { PaywallScreen } from '../screens/PaywallScreen';
import { LocationsScreen } from '../screens/LocationsScreen';
import { PrivacyScreen } from '../screens/PrivacyScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { RECIPES } from '../data/recipes';
import { addDays, startOfDay, toExpiryISO } from '../utils/dateUtils';
import { NOW } from './helpers';

const N = Notifications as any;

let mockPro = false;
jest.mock('../contexts/PremiumContext', () => ({
    usePremium: () => ({
        isPro: mockPro,
        plans: [
            { kind: 'annual', price: '19,99 €', productId: 'y', available: true },
            { kind: 'monthly', price: '2,99 €', productId: 'm', available: true },
            { kind: 'lifetime', price: '49,99 €', productId: 'l', available: true },
        ],
        storeReady: true,
        purchase: jest.fn(async () => 'cancelled'),
        restore: jest.fn(async () => 'none'),
        debugPro: false,
        setDebugPro: jest.fn(),
    }),
}));

const mockNavigation = { navigate: jest.fn(), goBack: jest.fn(), setOptions: jest.fn(), addListener: jest.fn(() => jest.fn()), dispatch: jest.fn() };
jest.mock('@react-navigation/native', () => {
    const actual = jest.requireActual('@react-navigation/native');
    const React = require('react');
    return {
        ...actual,
        useNavigation: () => mockNavigation,
        useIsFocused: () => true,
        useFocusEffect: (fn: () => void | (() => void)) => React.useEffect(fn, []),
    };
});
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
jest.mock('@react-native-community/datetimepicker', () => () => null);
jest.mock('expo-camera', () => ({ CameraView: () => null, useCameraPermissions: () => [{ granted: true }, jest.fn()] }));
jest.mock('@react-native-ml-kit/text-recognition', () => ({ recognize: jest.fn(async () => ({ text: '' })) }));
jest.mock('@shopify/react-native-skia', () => ({}));

// Seeds the pantry through the real context before the screen under test mounts
const Seed = ({ items, children }: { items: [string, number][]; children: React.ReactNode }) => {
    const { loaded, addItem, items: current } = usePantry();
    const [done, setDone] = React.useState(items.length === 0);
    React.useEffect(() => {
        if (!loaded || done) return;
        (async () => {
            for (const [name, days] of items) await addItem({ name, category: 'dairy', locationId: 'fridge', expirationDate: addDays(startOfDay(), days) });
            setDone(true);
        })();
    }, [loaded]);
    return loaded && done && current.length >= items.length ? <>{children}</> : null;
};

const renderScreen = async (ui: React.ReactElement, items: [string, number][] = [], allowEmpty = false) => {
    const out = await render(
        <ThemeProvider>
            <LanguageProvider>
                <PantryProvider>
                    <Seed items={items}>{ui}</Seed>
                </PantryProvider>
            </LanguageProvider>
        </ThemeProvider>,
    );
    if (!allowEmpty) await waitFor(() => expect(screen.toJSON()).not.toBeNull());
    return out;
};

const nav = mockNavigation as any;
const route = (params?: object) => ({ key: 'k', name: 'x', params }) as any;

beforeEach(async () => {
    jest.useFakeTimers({ now: NOW, advanceTimers: true });
    mockPro = false;
    N.__reset();
    jest.clearAllMocks();
    await AsyncStorage.clear();
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
});
afterEach(() => jest.useRealTimers());

describe('every screen renders, free and Pro', () => {
    const screens: [string, () => React.ReactElement][] = [
        ['Pantry', () => <PantryScreen navigation={nav} route={route()} />],
        ['Recipes', () => <RecipesScreen navigation={nav} route={route()} />],
        ['RecipeDetail', () => <RecipeDetailScreen navigation={nav} route={route({ recipeId: RECIPES[0].id })} />],
        ['Shopping', () => <ShoppingScreen navigation={nav} route={route()} />],
        ['Stats', () => <StatsScreen navigation={nav} route={route()} />],
        ['Settings', () => <SettingsScreen navigation={nav} route={route()} />],
        ['Reminders', () => <RemindersScreen navigation={nav} route={route()} />],
        ['Paywall', () => <PaywallScreen navigation={nav} route={route({ reason: 'items' })} />],
        ['Locations', () => <LocationsScreen navigation={nav} route={route()} />],
        ['Privacy', () => <PrivacyScreen navigation={nav} route={route()} />],
        ['ItemEditor new', () => <ItemEditorScreen navigation={nav} route={route()} />],
        ['Onboarding', () => <OnboardingScreen onDone={jest.fn()} />],
    ];
    for (const pro of [false, true]) {
        it.each(screens)(`%s (${pro ? 'Pro' : 'free'})`, async (_, make) => {
            mockPro = pro;
            const error = jest.spyOn(console, 'error');
            await renderScreen(make(), [
                ['Latte', 0],
                ['Uova', 2],
                ['Pane', -1],
                ['Riso', 40],
            ]);
            expect(screen.toJSON()).toBeTruthy();
            expect(error).not.toHaveBeenCalled();
            error.mockRestore();
        });
    }

    it('an unknown recipe id shows nothing instead of crashing', async () => {
        await renderScreen(<RecipeDetailScreen navigation={nav} route={route({ recipeId: 'nope' })} />, [], true);
        expect(screen.toJSON()).toBeNull();
    });
});

describe('item editor', () => {
    const Probe = ({ onItems }: { onItems: (n: number, names: string[], prices: (number | undefined)[]) => void }) => {
        const { items } = usePantry();
        onItems(items.length, items.map((i) => i.name), items.map((i) => i.price));
        return null;
    };

    const setup = async (params?: object) => {
        const seen = { count: 0, names: [] as string[], prices: [] as (number | undefined)[] };
        await renderScreen(
            <>
                <ItemEditorScreen navigation={nav} route={route(params)} />
                <Probe onItems={(n, names, prices) => Object.assign(seen, { count: n, names, prices })} />
            </>,
        );
        return seen;
    };

    it('saves a new item and goes back', async () => {
        const seen = await setup();
        await fireEvent.changeText(screen.getByPlaceholderText('es. Yogurt greco'), 'Mozzarella');
        await fireEvent.press(screen.getByLabelText('Salva'));
        await waitFor(() => expect(seen.names).toEqual(['Mozzarella']));
        expect(nav.goBack).toHaveBeenCalledTimes(1);
    });

    it('a double tap on save adds the item once', async () => {
        const seen = await setup();
        await fireEvent.changeText(screen.getByPlaceholderText('es. Yogurt greco'), 'Burro');
        // Two presses before the first save completes
        const button = screen.getByLabelText('Salva') as any;
        const tap = () => button.props.onClick({ nativeEvent: {}, persist() {}, isDefaultPrevented: () => false, preventDefault() {} });
        await act(async () => {
            tap();
            tap();
        });
        await waitFor(() => expect(seen.count).toBe(1));
    });

    it('refuses an empty name', async () => {
        const seen = await setup();
        await fireEvent.changeText(screen.getByPlaceholderText('es. Yogurt greco'), '   ');
        await fireEvent.press(screen.getByLabelText('Salva'));
        expect(Alert.alert).toHaveBeenCalled();
        expect(seen.count).toBe(0);
        expect(nav.goBack).not.toHaveBeenCalled();
    });

    it('price field accepts a comma decimal and drops a minus sign', async () => {
        const seen = await setup();
        await fireEvent.changeText(screen.getByPlaceholderText('es. Yogurt greco'), 'Latte');
        await fireEvent.changeText(screen.getByPlaceholderText('0,00'), '-2,5');
        await fireEvent.press(screen.getByLabelText('Salva'));
        await waitFor(() => expect(seen.prices).toEqual([2.5]));
    });

    it('free users who used their 3 date reads are sent to the paywall', async () => {
        await AsyncStorage.setItem('@fc_ocr_used', '3');
        await setup();
        await waitFor(() => expect(screen.getByText('0 letture data gratuite rimaste')).toBeTruthy());
        await fireEvent.press(screen.getByText('Leggi data'));
        expect(nav.navigate).toHaveBeenCalledWith('Paywall', { reason: 'ocr' });
    });
});

describe('reminders screen', () => {
    it('warns when notifications are blocked in the phone settings', async () => {
        N.__setPermission('denied');
        await renderScreen(<RemindersScreen navigation={nav} route={route()} />);
        await waitFor(() => expect(screen.getByText(/disattivate nelle impostazioni/)).toBeTruthy());
        expect(screen.getByText('Apri Impostazioni')).toBeTruthy();
    });

    it('no warning when notifications are allowed', async () => {
        await renderScreen(<RemindersScreen navigation={nav} route={route()} />);
        await act(async () => undefined);
        expect(screen.queryByText(/disattivate nelle impostazioni/)).toBeNull();
    });

    it('free users are sent to the paywall when they try custom options', async () => {
        await renderScreen(<RemindersScreen navigation={nav} route={route()} />);
        await fireEvent.press(screen.getByText('1 settimana prima'));
        expect(nav.navigate).toHaveBeenCalledWith('Paywall', { reason: 'notifications' });
    });
});

describe('shopping list screen', () => {
    it('adds what you type', async () => {
        await renderScreen(<ShoppingScreen navigation={nav} route={route()} />);
        const input = screen.getByPlaceholderText(/aggiungi|add/i);
        await fireEvent.changeText(input, 'Pane');
        await fireEvent(input, 'submitEditing');
        expect(await screen.findByText('Pane')).toBeTruthy();
    });
});

describe('recipes screen', () => {
    it('free users see 3 recipes and are asked to upgrade for the rest', async () => {
        await renderScreen(<RecipesScreen navigation={nav} route={route()} />, [['Uova', 1]]);
        await fireEvent.press(screen.getByText('Sotto 20 min'));
        expect(nav.navigate).toHaveBeenCalledWith('Paywall', { reason: 'recipes' });
    });
});
