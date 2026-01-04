import { addDays } from 'date-fns';
import { IPredictionStrategy } from './IPredictionStrategy';
import { CycleHistory } from '../../types/cycle';
import { PredictionResult } from '../../types/prediction';

const DEFAULT_PERIOD_LENGTH = 5;

export class WeightedMovingAverageStrategy implements IPredictionStrategy {
  readonly name = 'weighted_moving_average';
  readonly minimumCycles = 3;

  canPredict(cycleHistory: CycleHistory[]): boolean {
    return cycleHistory.length >= this.minimumCycles;
  }

  predict(cycleHistory: CycleHistory[]): PredictionResult {
    const sorted = [...cycleHistory].sort(
      (a, b) => b.startDate.getTime() - a.startDate.getTime()
    );

    // Recent cycles weighted more heavily: 3x, 2x, 1x
    let totalWeight = 0;
    let weightedSum = 0;

    sorted.forEach((cycle, index) => {
      const weight = index === 0 ? 3 : index === 1 ? 2 : 1;
      weightedSum += cycle.length * weight;
      totalWeight += weight;
    });

    const predictedLength = Math.round(weightedSum / totalWeight);

    // Calculate variance for confidence
    const variance =
      sorted.reduce((sum, c) => sum + Math.pow(c.length - predictedLength, 2), 0) /
      sorted.length;
    const stdDev = Math.sqrt(variance);

    const lastCycle = sorted[0];
    const predictedStart = addDays(lastCycle.startDate, predictedLength);
    const predictedEnd = addDays(predictedStart, DEFAULT_PERIOD_LENGTH);

    const factors: string[] = [
      `Based on ${sorted.length} cycles`,
      `Weighted average: ${predictedLength} days`,
      `Variation: \u00b1${Math.round(stdDev)} days`,
    ];

    return {
      predictedStart,
      predictedEnd,
      predictedLength,
      confidence: stdDev <= 2 ? 'moderate' : 'low',
      factors,
    };
  }
}
