import { CycleHistory } from '../../types/cycle';
import { PredictionResult } from '../../types/prediction';

export interface IPredictionStrategy {
  readonly name: string;
  readonly minimumCycles: number;
  canPredict(cycleHistory: CycleHistory[]): boolean;
  predict(cycleHistory: CycleHistory[]): PredictionResult;
}
