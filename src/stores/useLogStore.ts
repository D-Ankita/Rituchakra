import { create } from 'zustand';
import { FlowLevel, Mood, Symptom } from '../types/log';

interface LogState {
  flowLevel: FlowLevel;
  symptoms: Symptom[];
  mood: Mood | null;
  energy: number | null;
  sleepQuality: number | null;
  sleepHours: number | null;
  notes: string;
  medications: string[];

  setFlowLevel: (level: FlowLevel) => void;
  toggleSymptom: (symptom: Symptom) => void;
  setMood: (mood: Mood | null) => void;
  setEnergy: (energy: number | null) => void;
  setSleepQuality: (quality: number | null) => void;
  setSleepHours: (hours: number | null) => void;
  setNotes: (notes: string) => void;
  toggleMedication: (med: string) => void;
  resetLog: () => void;
  loadFromExisting: (data: {
    flowLevel: FlowLevel;
    symptoms: Symptom[];
    mood: Mood | null;
    energy: number | null;
    sleepQuality: number | null;
    sleepHours: number | null;
    notes: string;
    medications: string[];
  }) => void;
}

export const useLogStore = create<LogState>((set) => ({
  flowLevel: 'none',
  symptoms: [],
  mood: null,
  energy: null,
  sleepQuality: null,
  sleepHours: null,
  notes: '',
  medications: [],

  setFlowLevel: (level) => set({ flowLevel: level }),
  toggleSymptom: (symptom) =>
    set((s) => ({
      symptoms: s.symptoms.includes(symptom)
        ? s.symptoms.filter((sym) => sym !== symptom)
        : [...s.symptoms, symptom],
    })),
  setMood: (mood) => set({ mood }),
  setEnergy: (energy) => set({ energy }),
  setSleepQuality: (quality) => set({ sleepQuality: quality }),
  setSleepHours: (hours) => set({ sleepHours: hours }),
  setNotes: (notes) => set({ notes }),
  toggleMedication: (med) =>
    set((s) => ({
      medications: s.medications.includes(med)
        ? s.medications.filter((m) => m !== med)
        : [...s.medications, med],
    })),
  resetLog: () =>
    set({
      flowLevel: 'none',
      symptoms: [],
      mood: null,
      energy: null,
      sleepQuality: null,
      sleepHours: null,
      notes: '',
      medications: [],
    }),
  loadFromExisting: (data) => set(data),
}));
