import { createContext, useContext } from 'react';

// Lets Settings replay the introduction owned by App.tsx
export const OnboardingContext = createContext<{ replay: () => void }>({ replay: () => undefined });
export const useOnboarding = () => useContext(OnboardingContext);
