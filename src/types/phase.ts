export type Phase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

export interface PhaseInfo {
  phase: Phase;
  dayInPhase: number;
  phaseDuration: number;
  phaseProgress: number; // 0-1
}

export const PHASE_LABELS: Record<Phase, string> = {
  menstrual: 'Menstrual',
  follicular: 'Follicular',
  ovulation: 'Ovulation',
  luteal: 'Luteal',
};

export const PHASE_DESCRIPTIONS: Record<Phase, string> = {
  menstrual: 'Your body is shedding the uterine lining. Rest and gentle care are encouraged.',
  follicular: 'Estrogen is rising. Energy and focus tend to increase during this phase.',
  ovulation: 'Estrogen peaks and LH surges. Many feel most energetic and social now.',
  luteal: 'Progesterone rises. You may notice shifts in energy and mood as the phase progresses.',
};
