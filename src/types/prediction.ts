export type ConfidenceLevel = 'low' | 'moderate' | 'high';

export interface PredictionResult {
  predictedStart: Date;
  predictedEnd: Date;
  predictedLength: number;
  confidence: ConfidenceLevel;
  factors: string[];
}

export interface PredictionData {
  id: number;
  cycleId: number | null;
  predictedStart: number; // timestamp ms
  predictedEnd: number;
  confidence: ConfidenceLevel;
  factors: string; // JSON array
  createdAt: number;
}
