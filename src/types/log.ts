import { Phase } from './phase';

export type FlowLevel = 'none' | 'light' | 'medium' | 'heavy';

export type Symptom =
  | 'cramps'
  | 'headache'
  | 'bloating'
  | 'acne'
  | 'fatigue'
  | 'backPain'
  | 'breastTenderness'
  | 'nausea'
  | 'dizziness'
  | 'moodSwings'
  | 'cravings'
  | 'insomnia';

export type Mood =
  | 'calm'
  | 'happy'
  | 'anxious'
  | 'irritable'
  | 'sad'
  | 'energetic'
  | 'sensitive'
  | 'focused';

export const SYMPTOM_LABELS: Record<Symptom, string> = {
  cramps: 'Cramps',
  headache: 'Headache',
  bloating: 'Bloating',
  acne: 'Acne',
  fatigue: 'Fatigue',
  backPain: 'Back Pain',
  breastTenderness: 'Breast Tenderness',
  nausea: 'Nausea',
  dizziness: 'Dizziness',
  moodSwings: 'Mood Swings',
  cravings: 'Cravings',
  insomnia: 'Insomnia',
};

export const MOOD_LABELS: Record<Mood, string> = {
  calm: 'Calm',
  happy: 'Happy',
  anxious: 'Anxious',
  irritable: 'Irritable',
  sad: 'Sad',
  energetic: 'Energetic',
  sensitive: 'Sensitive',
  focused: 'Focused',
};

export const FLOW_LABELS: Record<FlowLevel, string> = {
  none: 'None',
  light: 'Light',
  medium: 'Medium',
  heavy: 'Heavy',
};

export interface DailyLogData {
  id: number;
  date: number; // timestamp ms (midnight)
  cycleId: number;
  cycleDay: number;
  phase: Phase;
  flowLevel: FlowLevel;
  symptoms: string; // JSON array
  mood: string | null;
  energy: number | null; // 1-5
  sleepQuality: number | null; // 1-5
  sleepHours: number | null;
  notes: string | null;
  medications: string | null; // JSON array
  createdAt: number;
  updatedAt: number;
}
