// Development-only deep link used to stage App Store screenshots without tapping around.
// Example (Expo Go): exp://127.0.0.1:8081/--/shot?lang=it&theme=light&accent=forest&demo=1&pro=1&screen=Recipes
// remind=HH:MM asks for notification permission and moves the reminder time, to check real delivery.
// When Metro is started with EXPO_PUBLIC_SHOT_SERVER=http://127.0.0.1:8099 the app also polls
// <server>/cmd_<iphone|ipad>.json ({ "id": 1, "url": "shot?..." }), which avoids the
// "Open in Expo Go?" prompt that iPadOS shows for every deep link.
import { useEffect, useRef } from 'react';
import { Linking, LogBox, Platform } from 'react-native';
import { createNavigationContainerRef, StackActions } from '@react-navigation/native';
import { useLanguage } from '../contexts/LanguageContext';
import { usePantry } from '../contexts/PantryContext';
import { usePremium } from '../contexts/PremiumContext';
import { useTheme } from '../contexts/ThemeContext';
import { RootStackParamList } from '../navigation/types';
import { AccentId } from '../types';
import { ThemeMode } from '../theme/tokens';
import { Language } from '../i18n';
import { buildDemoBackup } from '../utils/demoData';
import { requestPermission } from '../utils/notifications';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

const go = (screen: string, arg?: string) => {
    if (!navigationRef.isReady()) return;
    const nav = navigationRef as any;
    if (screen === 'RecipeDetail') nav.navigate('RecipeDetail', { recipeId: arg });
    else if (screen === 'ItemEditor') nav.navigate('ItemEditor', arg ? { itemId: arg } : undefined);
    else if (['Pantry', 'Recipes', 'Shopping', 'Stats'].includes(screen)) nav.navigate('Tabs', { screen });
    else nav.navigate(screen);
};

export const DevShotHook = ({ skipOnboarding }: { skipOnboarding: () => void }) => {
    const { setLanguage, setCurrency } = useLanguage();
    const { restoreBackup, notifPrefs, setNotifPrefs } = usePantry();
    const prefsRef = useRef(notifPrefs);
    prefsRef.current = notifPrefs;
    const { setDebugPro } = usePremium();
    const { setMode, setAccent } = useTheme();

    useEffect(() => {
        if (!__DEV__) return;
        const handle = async (url: string | null) => {
            if (!url || !url.includes('/shot')) return;
            const q = new URLSearchParams(url.split('?')[1] ?? '');
            const lang = q.get('lang') as Language | null;
            if (lang) setLanguage(lang);
            const currency = q.get('currency');
            if (currency) setCurrency(currency);
            if (q.get('theme')) setMode(q.get('theme') as ThemeMode);
            if (q.get('accent')) setAccent(q.get('accent') as AccentId);
            if (q.get('pro') === '1') setDebugPro(true);
            if (q.get('pro') === '0') setDebugPro(false);
            skipOnboarding();
            if (q.get('demo') === '1') await restoreBackup(buildDemoBackup(lang ?? 'it', currency ?? 'EUR'));
            const remind = q.get('remind')?.match(/^(\d{1,2}):(\d{2})$/);
            if (remind) {
                await requestPermission();
                await setNotifPrefs({ ...prefsRef.current, enabled: true, hour: +remind[1], minute: +remind[2] });
            }
            const screen = q.get('screen');
            if (screen) {
                // Pop back to the tabs first so every shot starts from a clean stack
                setTimeout(() => {
                    if (navigationRef.isReady() && (navigationRef.getRootState()?.index ?? 0) > 0) navigationRef.dispatch(StackActions.popToTop());
                    go(screen, q.get('arg') ?? undefined);
                }, 400);
            }
        };
        Linking.getInitialURL().then(handle);
        const sub = Linking.addEventListener('url', (e) => handle(e.url));

        const server = process.env.EXPO_PUBLIC_SHOT_SERVER;
        // Keep dev warning toasts out of the screenshots
        if (server) LogBox.ignoreAllLogs(true);
        let lastId: unknown = null;
        const poll = server
            ? setInterval(async () => {
                  try {
                      const device = Platform.OS === 'ios' && Platform.isPad ? 'ipad' : 'iphone';
                      const res = await fetch(`${server}/cmd_${device}.json?t=${Date.now()}`);
                      const cmd = await res.json();
                      if (cmd.id !== lastId) {
                          const first = lastId === null;
                          lastId = cmd.id;
                          if (!first || cmd.fresh) handle(`/shot?${String(cmd.url).split('?')[1] ?? ''}`);
                      }
                  } catch {
                      // server not running: ignore
                  }
              }, 700)
            : undefined;
        return () => {
            sub.remove();
            if (poll) clearInterval(poll);
        };
    }, [setLanguage, setCurrency, restoreBackup, setNotifPrefs, setDebugPro, setMode, setAccent, skipOnboarding]);

    return null;
};
