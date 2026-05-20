import { ContextPacket, PatternSummary, ScreeningHint, CulturalFlag, BehaviorHint, MemorySnippet } from './ContextPacket';
import { Phase } from '../../types/phase';
import { CycleHistory } from '../../types/cycle';
import { DailyLogData } from '../../types/log';
import { CompanionLanguage } from '../../stores/useCompanionStore';
import { Pattern, generateInsightPatterns } from '../../engine/PatternCorrelation';
import { screenForIrregularity } from '../../engine/screening';
import { findCulturalFlag } from '../culture/festivalCalendar';
import { retrieveRelevantMemories } from '../dadi/Memory';
import { truncateToBudget } from './tokenBudget';

export interface BuildContextInput {
  // Current state
  cycleDay: number | null;
  cycleLength: number;
  phase: Phase | null;
  predictionConfidence?: 'low' | 'moderate' | 'high' | null;

  // History
  cycles: CycleHistory[];
  logs: DailyLogData[];
  completedCycleCount: number;

  // Cultural / personal
  language: CompanionLanguage;
  personaName: string;
  addressAs: string;
  region: string | null;
  today: Date;

  // Rate limit for screening surfacing
  allowScreeningSurface: boolean;

  // Hint topics for memory retrieval (e.g. from the user turn)
  memoryTopics?: string[];
}

export async function buildContextPacket(input: BuildContextInput): Promise<ContextPacket> {
  const patterns = pickTopPatterns(
    generateInsightPatterns(input.logs, input.completedCycleCount)
  );

  let screening: ScreeningHint | null = null;
  if (input.allowScreeningSurface) {
    const result = screenForIrregularity({
      cycles: input.cycles,
      logs: input.logs,
    });
    if (result.signal !== 'none') {
      screening = {
        signal: result.signal,
        reasons: result.reasons,
        suggestSeeingDoctor: result.suggestSeeingDoctor,
      };
    }
  }

  const cultural: CulturalFlag | null = findCulturalFlag({
    date: input.today,
    region: input.region ?? undefined,
  });

  const behavior = inferBehaviorHint(input.logs);
  const memorySnippets: MemorySnippet[] = await retrieveRelevantMemories(
    input.memoryTopics ?? [],
    5
  );

  const packet: ContextPacket = {
    cycleDay: input.cycleDay,
    cycleLength: input.cycleLength,
    phase: input.phase,
    predictionConfidence: input.predictionConfidence ?? null,
    patterns,
    screening,
    cultural,
    behavior,
    language: input.language,
    personaName: input.personaName,
    addressAs: input.addressAs,
    memorySnippets,
  };

  return truncateToBudget(packet);
}

function pickTopPatterns(patterns: Pattern[]): PatternSummary[] {
  return patterns
    .filter((p) => p.confidence !== 'low')
    .slice(0, 2)
    .map((p) => ({
      type: p.type,
      finding: p.finding,
      confidence: p.confidence,
    }));
}

function inferBehaviorHint(logs: DailyLogData[]): BehaviorHint | null {
  if (logs.length < 3) return null;
  const recent = logs.slice(-7);

  const lowSleep = recent.filter((l) => (l.sleepQuality ?? 5) <= 2).length;
  if (lowSleep >= 3) {
    return { kind: 'poor_sleep', note: `Sleep quality has been low on ${lowSleep} of the last ${recent.length} days.` };
  }

  const lowEnergy = recent.filter((l) => (l.energy ?? 5) <= 2).length;
  if (lowEnergy >= 3) {
    return { kind: 'low_energy', note: `Energy has been low on ${lowEnergy} of the last ${recent.length} days.` };
  }

  return null;
}
