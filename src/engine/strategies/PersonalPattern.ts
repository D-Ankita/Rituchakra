import { addDays } from 'date-fns';
import { IPredictionStrategy } from './IPredictionStrategy';
import { CycleHistory } from '../../types/cycle';
import { PredictionResult } from '../../types/prediction';

const DEFAULT_PERIOD_LENGTH = 5;
const DECAY_FACTOR = 0.85;

export class PersonalPatternStrategy implements IPredictionStrategy {
  readonly name = 'personal_pattern';
  readonly minimumCycles = 6;

  canPredict(cycleHistory: CycleHistory[]): boolean {
    return cycleHistory.length >= this.minimumCycles;
  }

  predict(cycleHistory: CycleHistory[]): PredictionResult {
    const sorted = [...cycleHistory].sort(
      (a, b) => b.startDate.getTime() - a.startDate.getTime()
    );

    // Exponential decay weighting: recent cycles matter more
    let totalWeight = 0;
    let weightedSum = 0;

    sorted.forEach((cycle, index) => {
      const weight = Math.pow(DECAY_FACTOR, index);
      weightedSum += cycle.length * weight;
      totalWeight += weight;
    });

    const predictedLength = Math.round(weightedSum / totalWeight);

    // Weighted standard deviation
    const mean = weightedSum / totalWeight;
    let weightedVariance = 0;
    sorted.forEach((c, i) => {
      const w = Math.pow(DECAY_FACTOR, i);
      weightedVariance += w * Math.pow(c.length - mean, 2);
    });
    const stdDev = Math.sqrt(weightedVariance / totalWeight);

    // Detect trend (shortening or lengthening)
    const recentAvg =
      sorted.slice(0, 3).reduce((s, c) => s + c.length, 0) / 3;
    const olderAvg =
      sorted.slice(3).reduce((s, c) => s + c.length, 0) /
      (sorted.length - 3);
    const trend = recentAvg - olderAvg;

    const factors: string[] = [
      `Personal pattern from ${sorted.length} cycles`,
      `Predicted length: ${predictedLength} days`,
    ];

    if (Math.abs(trend) > 1) {
      factors.push(
        trend > 0
          ? `Trend: cycles lengthening (~${Math.round(trend)} days)`
          : `Trend: cycles shortening (~${Math.round(Math.abs(trend))} days)`
      );
    }

    const lastCycle = sorted[0];
    const predictedStart = addDays(lastCycle.startDate, predictedLength);
    const predictedEnd = addDays(predictedStart, DEFAULT_PERIOD_LENGTH);

    let confidence: 'low' | 'moderate' | 'high';
    if (stdDev <= 2) {
      confidence = 'high';
    } else if (stdDev <= 4) {
      confidence = 'moderate';
    } else {
      confidence = 'low';
    }

    return {
      predictedStart,
      predictedEnd,
      predictedLength,
      confidence,
      factors,
    };
  }
}
