import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
    Pantry: undefined;
    Recipes: undefined;
    Shopping: undefined;
    Stats: undefined;
};

export type PaywallReason = 'items' | 'ocr' | 'locations' | 'stats' | 'recipes' | 'notifications' | 'export' | 'themes' | 'freezer' | 'settings';

export type RootStackParamList = {
    Tabs: NavigatorScreenParams<TabParamList>;
    ItemEditor: { itemId?: string; startScan?: 'barcode' | 'date' } | undefined;
    RecipeDetail: { recipeId: string };
    Paywall: { reason?: PaywallReason } | undefined;
    Settings: undefined;
    Reminders: undefined;
    Locations: undefined;
    Privacy: undefined;
};

export type RootScreen<K extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, K>;

export type TabScreen<K extends keyof TabParamList> = CompositeScreenProps<
    BottomTabScreenProps<TabParamList, K>,
    NativeStackScreenProps<RootStackParamList>
>;

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList {}
    }
}
