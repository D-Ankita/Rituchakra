import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CompanionLanguage = 'en' | 'hi' | 'mr' | 'hi-en' | 'mr-en';

interface CompanionState {
  personaName: string;
  language: CompanionLanguage;
  region: string | null;
  proactiveMinutes: number; // minutes from midnight, default 6:30 AM = 390
  voiceEnabled: boolean;
  cloudOptIn: boolean;
  lastBriefAt: number | null;
  lastScreeningCycleId: number | null;

  setPersonaName: (name: string) => void;
  setLanguage: (lang: CompanionLanguage) => void;
  setRegion: (region: string | null) => void;
  setProactiveMinutes: (minutes: number) => void;
  setVoiceEnabled: (enabled: boolean) => void;
  setCloudOptIn: (enabled: boolean) => void;
  setLastBriefAt: (ts: number) => void;
  setLastScreeningCycleId: (id: number | null) => void;
  reset: () => void;
}

const DEFAULTS = {
  personaName: 'Dadi',
  language: 'en' as CompanionLanguage,
  region: null,
  proactiveMinutes: 390,
  voiceEnabled: false,
  cloudOptIn: false,
  lastBriefAt: null,
  lastScreeningCycleId: null,
};

export const useCompanionStore = create<CompanionState>()(
  persist(
    (set) => ({
      ...DEFAULTS,

      setPersonaName: (name) => set({ personaName: name }),
      setLanguage: (lang) => set({ language: lang }),
      setRegion: (region) => set({ region }),
      setProactiveMinutes: (minutes) => set({ proactiveMinutes: minutes }),
      setVoiceEnabled: (enabled) => set({ voiceEnabled: enabled }),
      setCloudOptIn: (enabled) => set({ cloudOptIn: enabled }),
      setLastBriefAt: (ts) => set({ lastBriefAt: ts }),
      setLastScreeningCycleId: (id) => set({ lastScreeningCycleId: id }),
      reset: () => set(DEFAULTS),
    }),
    {
      name: 'rituchakra-companion-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
