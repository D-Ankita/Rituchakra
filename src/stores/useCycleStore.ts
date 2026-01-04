import { create } from 'zustand';
import { Phase } from '../types/phase';

interface CycleState {
  currentCycleId: number | null;
  currentCycleDay: number;
  currentPhase: Phase;
  cycleLength: number;
  periodLength: number;
  lastPeriodStart: Date | null;
  completedCycleCount: number;

  setCurrentCycle: (id: number, day: number, phase: Phase) => void;
  setCycleLength: (length: number) => void;
  setPeriodLength: (length: number) => void;
  setLastPeriodStart: (date: Date) => void;
  setCompletedCycleCount: (count: number) => void;
  reset: () => void;
}

export const useCycleStore = create<CycleState>((set) => ({
  currentCycleId: null,
  currentCycleDay: 1,
  currentPhase: 'menstrual',
  cycleLength: 28,
  periodLength: 5,
  lastPeriodStart: null,
  completedCycleCount: 0,

  setCurrentCycle: (id, day, phase) =>
    set({ currentCycleId: id, currentCycleDay: day, currentPhase: phase }),
  setCycleLength: (length) => set({ cycleLength: length }),
  setPeriodLength: (length) => set({ periodLength: length }),
  setLastPeriodStart: (date) => set({ lastPeriodStart: date }),
  setCompletedCycleCount: (count) =>
    set({ completedCycleCount: count }),
  reset: () =>
    set({
      currentCycleId: null,
      currentCycleDay: 1,
      currentPhase: 'menstrual',
      cycleLength: 28,
      periodLength: 5,
      lastPeriodStart: null,
      completedCycleCount: 0,
    }),
}));
