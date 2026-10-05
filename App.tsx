import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_600SemiBold_Italic,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { LanguageProvider, useLanguage } from './src/contexts/LanguageContext';
import { PremiumProvider } from './src/contexts/PremiumContext';
import { PantryProvider, usePantry } from './src/contexts/PantryContext';
import { OnboardingContext } from './src/contexts/OnboardingContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { LaunchAnimation } from './src/components/LaunchAnimation';
import { KeyboardDismissRoot } from './src/components/KeyboardDismissRoot';
import { DevShotHook } from './src/components/DevShotHook';
import { getHasSeenOnboarding, setHasSeenOnboarding } from './src/utils/storage';
import { detectLanguage, translate } from './src/i18n';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: string | null }> {
  state = { error: null as string | null };

  static getDerivedStateFromError(error: unknown) {
    return { error: String(error) };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error('Uncaught error', error, info);
  }

  render() {
    if (this.state.error) {
      const lang = detectLanguage();
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#F4F6FB' }}>
          <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 8, color: '#111827' }}>{translate(lang, 'error')}</Text>
          <Text style={{ textAlign: 'center', marginBottom: 20, color: '#3B4456' }}>{this.state.error}</Text>
          <Pressable style={{ padding: 14, backgroundColor: '#10B26C', borderRadius: 999, paddingHorizontal: 24 }} onPress={() => this.setState({ error: null })}>
            <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>{translate(lang, 'retry')}</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

function Shell({ fontsReady }: { fontsReady: boolean }) {
  const { isDark, colors } = useTheme();
  const { ready: languageReady } = useLanguage();
  const { loaded } = usePantry();
  const [onboarding, setOnboarding] = useState<boolean | null>(null);
  const [intro, setIntro] = useState(true);
  const endIntro = useCallback(() => setIntro(false), []);

  useEffect(() => {
    getHasSeenOnboarding().then((seen) => setOnboarding(!seen));
  }, []);

  const ready = fontsReady && languageReady && loaded && onboarding !== null;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);

  // Never leave users on the splash screen if something hangs
  useEffect(() => {
    const h = setTimeout(() => SplashScreen.hideAsync().catch(() => undefined), 5000);
    return () => clearTimeout(h);
  }, []);

  const finishOnboarding = useCallback(() => {
    setHasSeenOnboarding(true);
    setOnboarding(false);
  }, []);

  const onboardingCtx = useMemo(() => ({ replay: () => setOnboarding(true) }), []);

  if (!ready) return <View style={{ flex: 1, backgroundColor: colors.background }} />;

  return (
    <OnboardingContext.Provider value={onboardingCtx}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {onboarding ? <OnboardingScreen onDone={finishOnboarding} /> : <RootNavigator />}
      {intro && <LaunchAnimation onDone={endIntro} />}
      {__DEV__ && <DevShotHook skipOnboarding={finishOnboarding} />}
    </OnboardingContext.Provider>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_600SemiBold_Italic,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardDismissRoot>
          <SafeAreaProvider>
            <ThemeProvider>
              <LanguageProvider>
                <PremiumProvider>
                  <PantryProvider>
                    {/* If fonts fail, fall back to system fonts rather than blocking */}
                    <Shell fontsReady={fontsLoaded || !!fontError} />
                  </PantryProvider>
                </PremiumProvider>
              </LanguageProvider>
            </ThemeProvider>
          </SafeAreaProvider>
        </KeyboardDismissRoot>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
