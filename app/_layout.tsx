import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import { initializeDatabase } from '../src/db/database';
import { useAppStore } from '../src/stores/useAppStore';
import { useCycleStore } from '../src/stores/useCycleStore';
import { getCurrentCycle, getCycleCount } from '../src/db/helpers/cycleHelpers';
import { getCycleDay, calculatePhase } from '../src/engine/phaseCalculator';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);
  const hasCompletedOnboarding = useAppStore((s) => s.hasCompletedOnboarding);
  const setCurrentCycle = useCycleStore((s) => s.setCurrentCycle);
  const setCompletedCycleCount = useCycleStore((s) => s.setCompletedCycleCount);
  const cycleLength = useCycleStore((s) => s.cycleLength);

  useEffect(() => {
    initializeDatabase();
    setDbReady(true);
    SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (!dbReady || !hasCompletedOnboarding) return;

    (async () => {
      const current = await getCurrentCycle();
      const count = await getCycleCount();
      setCompletedCycleCount(count);

      if (current) {
        const day = getCycleDay(new Date(current.startDate));
        const { phase } = calculatePhase(day, cycleLength);
        setCurrentCycle(current.id, day, phase);
      }
    })();
  }, [dbReady, hasCompletedOnboarding]);

  if (!dbReady) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        {!hasCompletedOnboarding ? (
          <Stack.Screen name="onboarding" />
        ) : (
          <Stack.Screen name="(tabs)" />
        )}
      </Stack>
    </>
  );
}
