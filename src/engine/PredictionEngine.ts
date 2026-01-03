import { IPredictionStrategy } from './strategies/IPredictionStrategy';
import { DefaultStrategy } from './strategies/DefaultStrategy';
import { WeightedMovingAverageStrategy } from './strategies/WeightedMovingAverage';
import { PersonalPatternStrategy } from './strategies/PersonalPattern';
import { ManualStrategy } from './strategies/ManualStrategy';
import { CycleHistory } from '../types/cycle';
import { PredictionResult } from '../types/prediction';
import { PredictionMode } from '../stores/useAppStore';

interface PredictOptions {
  mode?: PredictionMode;
  manualCycleLength?: number;
  manualPeriodLength?: number;
}

export class PredictionEngine {
  private strategies: IPredictionStrategy[];

  constructor(customStrategies?: IPredictionStrategy[]) {
    this.strategies = customStrategies ?? [
      new PersonalPatternStrategy(),
      new WeightedMovingAverageStrategy(),
      new DefaultStrategy(),
    ];
  }

  predict(cycleHistory: CycleHistory[], options?: PredictOptions): PredictionResult {
    if (options?.mode === 'manual') {
      const manual = new ManualStrategy(
        options.manualCycleLength ?? 28,
        options.manualPeriodLength ?? 5
      );
      return manual.predict(cycleHistory);
    }

    for (const strategy of this.strategies) {
      if (strategy.canPredict(cycleHistory)) {
        return strategy.predict(cycleHistory);
      }
    }
    return new DefaultStrategy().predict(cycleHistory);
  }

  getActiveStrategyName(cycleCount: number, mode?: PredictionMode): string {
    if (mode === 'manual') return 'manual';
    if (cycleCount >= 6) return 'personal_pattern';
    if (cycleCount >= 3) return 'weighted_moving_average';
    return 'default';
  }
}
