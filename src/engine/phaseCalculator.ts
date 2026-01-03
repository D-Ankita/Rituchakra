import { Phase, PhaseInfo } from '../types/phase';

const LUTEAL_LENGTH = 14;
const MENSTRUAL_LENGTH = 5;
const OVULATION_LENGTH = 3;

/**
 * Calculate the current phase based on cycle day and cycle length.
 *
 * Standard model (adjusts proportionally to cycle length):
 *   Menstrual:   Day 1-5  (fixed ~5 days)
 *   Follicular:  Day 6 to ovulation-1
 *   Ovulation:   ~3 days centered around day cycleLength-14
 *   Luteal:      Ovulation end to cycle end (~14 days, most consistent)
 */
export function calculatePhase(
  cycleDay: number,
  cycleLength: number = 28
): PhaseInfo {
  const ovulationDay = cycleLength - LUTEAL_LENGTH;
  const follicularEnd = ovulationDay - 1;
  const ovulationEnd = ovulationDay + OVULATION_LENGTH - 1;

  if (cycleDay <= MENSTRUAL_LENGTH) {
    return {
      phase: 'menstrual',
      dayInPhase: cycleDay,
      phaseDuration: MENSTRUAL_LENGTH,
      phaseProgress: cycleDay / MENSTRUAL_LENGTH,
    };
  }

  if (cycleDay <= follicularEnd) {
    const follicularDuration = follicularEnd - MENSTRUAL_LENGTH;
    return {
      phase: 'follicular',
      dayInPhase: cycleDay - MENSTRUAL_LENGTH,
      phaseDuration: follicularDuration,
      phaseProgress: (cycleDay - MENSTRUAL_LENGTH) / follicularDuration,
    };
  }

  if (cycleDay <= ovulationEnd) {
    return {
      phase: 'ovulation',
      dayInPhase: cycleDay - follicularEnd,
      phaseDuration: OVULATION_LENGTH,
      phaseProgress: (cycleDay - follicularEnd) / OVULATION_LENGTH,
    };
  }

  const lutealDuration = cycleLength - ovulationEnd;
  return {
    phase: 'luteal',
    dayInPhase: cycleDay - ovulationEnd,
    phaseDuration: lutealDuration,
    phaseProgress: (cycleDay - ovulationEnd) / lutealDuration,
  };
}

/**
 * Get cycle day from a start date and current date.
 */
export function getCycleDay(startDate: Date, currentDate: Date = new Date()): number {
  const diffMs = currentDate.getTime() - startDate.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
}
