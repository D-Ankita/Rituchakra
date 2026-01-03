import { addDays } from 'date-fns';
import { IPredictionStrategy } from './IPredictionStrategy';
import { CycleHistory } from '../../types/cycle';
import { PredictionResult } from '../../types/prediction';

export class ManualStrategy implements IPredictionStrategy {
  readonly name = 'manual';
  readonly minimumCycles = 0;

  constructor(
    private cycleLength: number,
    private periodLength: number
  ) {}

  canPredict(_cycleHistory: CycleHistory[]): boolean {
    return true;
  }

  predict(cycleHistory: CycleHistory[]): PredictionResult {
    const lastCycle = cycleHistory[0];
    const baseDate = lastCycle ? lastCycle.startDate : new Date();

    const predictedStart = addDays(baseDate, this.cycleLength);
    const predictedEnd = addDays(predictedStart, this.periodLength);

    return {
      predictedStart,
      predictedEnd,
      predictedLength: this.cycleLength,
      confidence: 'high',
      factors: [`Using your manually set ${this.cycleLength}-day cycle`],
    };
  }
}
