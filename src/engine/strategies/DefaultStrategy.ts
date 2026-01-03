import { addDays } from 'date-fns';
import { IPredictionStrategy } from './IPredictionStrategy';
import { CycleHistory } from '../../types/cycle';
import { PredictionResult } from '../../types/prediction';

const DEFAULT_CYCLE_LENGTH = 28;
const DEFAULT_PERIOD_LENGTH = 5;

export class DefaultStrategy implements IPredictionStrategy {
  readonly name = 'default';
  readonly minimumCycles = 0;

  canPredict(_cycleHistory: CycleHistory[]): boolean {
    return true;
  }

  predict(cycleHistory: CycleHistory[]): PredictionResult {
    const lastCycle = cycleHistory[0];
    const baseDate = lastCycle ? lastCycle.startDate : new Date();
    const cycleLength = lastCycle?.length ?? DEFAULT_CYCLE_LENGTH;

    const predictedStart = addDays(baseDate, cycleLength);
    const predictedEnd = addDays(predictedStart, DEFAULT_PERIOD_LENGTH);

    return {
      predictedStart,
      predictedEnd,
      predictedLength: cycleLength,
      confidence: 'low',
      factors: ['Insufficient data \u2013 using standard estimate'],
    };
  }
}
