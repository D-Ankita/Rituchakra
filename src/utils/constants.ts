export const DEFAULT_CYCLE_LENGTH = 28;
export const DEFAULT_PERIOD_LENGTH = 5;
export const MIN_CYCLE_LENGTH = 21;
export const MAX_CYCLE_LENGTH = 40;

export const CYCLE_LENGTHS = Array.from(
  { length: MAX_CYCLE_LENGTH - MIN_CYCLE_LENGTH + 1 },
  (_, i) => MIN_CYCLE_LENGTH + i
);

export const CONFIDENCE_LABELS = {
  low: 'Low confidence',
  moderate: 'Moderate confidence',
  high: 'High confidence',
} as const;
