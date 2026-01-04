import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type PredictionMode = 'auto' | 'manual';

interface AppState {
  hasCompletedOnboarding: boolean;
  ayurvedaEnabled: boolean;
  notificationsEnabled: boolean;
  reminderTime: string;
  predictionMode: PredictionMode;
  manualCycleLength: number;
  manualPeriodLength: number;

  completeOnboarding: () => void;
  toggleAyurveda: () => void;
  setNotifications: (enabled: boolean) => void;
  setReminderTime: (time: string) => void;
  setPredictionMode: (mode: PredictionMode) => void;
  setManualCycleLength: (length: number) => void;
  setManualPeriodLength: (length: number) => void;
  resetAll: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      ayurvedaEnabled: false,
      notificationsEnabled: true,
      reminderTime: '21:00',
      predictionMode: 'auto',
      manualCycleLength: 28,
      manualPeriodLength: 5,

      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      toggleAyurveda: () =>
        set((s) => ({ ayurvedaEnabled: !s.ayurvedaEnabled })),
      setNotifications: (enabled) =>
        set({ notificationsEnabled: enabled }),
      setReminderTime: (time) => set({ reminderTime: time }),
      setPredictionMode: (mode) => set({ predictionMode: mode }),
      setManualCycleLength: (length) => set({ manualCycleLength: length }),
      setManualPeriodLength: (length) => set({ manualPeriodLength: length }),
      resetAll: () =>
        set({
          hasCompletedOnboarding: false,
          ayurvedaEnabled: false,
          notificationsEnabled: true,
          reminderTime: '21:00',
          predictionMode: 'auto',
          manualCycleLength: 28,
          manualPeriodLength: 5,
        }),
    }),
    {
      name: 'rituchakra-app-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
