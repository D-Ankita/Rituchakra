import { eq, desc } from 'drizzle-orm';
import { db } from '../database';
import { predictions } from '../schema';
import { PredictionResult } from '../../types/prediction';

export async function savePrediction(cycleId: number | null, result: PredictionResult) {
  const now = Date.now();
  return db
    .insert(predictions)
    .values({
      cycleId,
      predictedStart: result.predictedStart.getTime(),
      predictedEnd: result.predictedEnd.getTime(),
      confidence: result.confidence,
      factors: JSON.stringify(result.factors),
      createdAt: now,
    })
    .returning()
    .get();
}

export async function getLatestPrediction() {
  return db
    .select()
    .from(predictions)
    .orderBy(desc(predictions.createdAt))
    .limit(1)
    .get() ?? null;
}

export async function getPredictionForCycle(cycleId: number) {
  return db
    .select()
    .from(predictions)
    .where(eq(predictions.cycleId, cycleId))
    .orderBy(desc(predictions.createdAt))
    .limit(1)
    .get() ?? null;
}
