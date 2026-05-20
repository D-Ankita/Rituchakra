export type ScreeningSignal = 'none' | 'gentle' | 'notable';
export type ScreeningConfidence = 'low' | 'medium' | 'high';

export interface ScreeningResult {
  signal: ScreeningSignal;
  reasons: string[];
  suggestSeeingDoctor: boolean;
  confidence: ScreeningConfidence;
  disclaimerRequired: true;
}
