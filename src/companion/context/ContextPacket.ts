import { Phase } from '../../types/phase';
import { ScreeningSignal } from '../../engine/screening/ScreeningResult';
import { CompanionLanguage } from '../../stores/useCompanionStore';

/**
 * The ONLY shape that ever leaves the device for the companion.
 * Everything in here is a derived summary — no raw notes, no PII,
 * no medication strings, no full log rows. Redactor enforces.
 */
export interface ContextPacket {
  cycleDay: number | null;
  cycleLength: number;
  phase: Phase | null;
  predictionConfidence: 'low' | 'moderate' | 'high' | null;

  patterns: PatternSummary[];        // 0-2 patterns from PatternCorrelation
  screening: ScreeningHint | null;   // null unless gentle/notable AND rate-limit allows
  cultural: CulturalFlag | null;     // festival/fasting flag if today matches
  behavior: BehaviorHint | null;     // optional, derived

  language: CompanionLanguage;
  personaName: string;
  addressAs: string;                 // user's preferred address — never their full name
  memorySnippets: MemorySnippet[];   // 0-5 derived summaries from companion_memory
}

export interface PatternSummary {
  type: 'symptom' | 'mood' | 'energy' | 'sleep';
  finding: string;                   // already a derived sentence
  confidence: 'low' | 'medium' | 'high';
}

export interface ScreeningHint {
  signal: Exclude<ScreeningSignal, 'none'>;
  reasons: string[];                 // already validator-passed
  suggestSeeingDoctor: boolean;
}

export interface CulturalFlag {
  kind: 'festival' | 'fasting' | 'observance';
  name: string;
  contentSlug: string | null;        // link to reviewed article, if any
}

export interface BehaviorHint {
  kind: 'poor_sleep' | 'low_energy' | 'frequent_cramps';
  note: string;
}

export interface MemorySnippet {
  ageDays: number;
  summary: string;
  topics: string[];
}
