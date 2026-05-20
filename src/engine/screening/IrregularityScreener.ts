import { CycleHistory } from '../../types/cycle';
import { DailyLogData, Symptom } from '../../types/log';
import { ScreeningResult, ScreeningSignal, ScreeningConfidence } from './ScreeningResult';
import { mean, stdDev, countOutOfRange, rateOf } from './stats';
import { tryValidateScreeningText } from './outputValidator';

const NORMAL_MIN = 21;
const NORMAL_MAX = 35;
const MIN_CYCLES_FOR_SIGNAL = 3;

interface ScreeningInput {
  cycles: CycleHistory[];
  logs?: DailyLogData[];
}

/**
 * Screens cycle history for irregularity patterns that may warrant
 * seeing a doctor. Numeric-only; the screener has no vocabulary for
 * condition names. Every emitted reason passes through
 * outputValidator before leaving the function.
 *
 * Hard rules:
 *   - Below MIN_CYCLES_FOR_SIGNAL completed cycles, always returns
 *     signal 'none' with a "still learning" reason.
 *   - suggestSeeingDoctor requires signal === 'notable' AND
 *     confidence !== 'low'.
 *   - reasons[] never contains a condition name (validator enforces).
 */
export function screenForIrregularity(input: ScreeningInput): ScreeningResult {
  const { cycles, logs = [] } = input;

  if (cycles.length < MIN_CYCLES_FOR_SIGNAL) {
    return {
      signal: 'none',
      reasons: [
        `Still learning your rhythm — track ${MIN_CYCLES_FOR_SIGNAL - cycles.length} more cycle${
          MIN_CYCLES_FOR_SIGNAL - cycles.length === 1 ? '' : 's'
        } to see patterns.`,
      ],
      suggestSeeingDoctor: false,
      confidence: 'low',
      disclaimerRequired: true,
    };
  }

  const lengths = cycles.map((c) => c.length);
  const sd = stdDev(lengths);
  const outOfRange = countOutOfRange(lengths, NORMAL_MIN, NORMAL_MAX);
  const veryLong = lengths.filter((l) => l > NORMAL_MAX).length;
  const veryShort = lengths.filter((l) => l < NORMAL_MIN).length;

  const candidates: string[] = [];
  let score = 0;

  if (sd >= 7) {
    candidates.push(
      `Cycle length has varied by about ${Math.round(sd)} days over your last ${cycles.length} cycles.`
    );
    score += 2;
  } else if (sd >= 4) {
    candidates.push(
      `Cycle length has varied by about ${Math.round(sd)} days recently.`
    );
    score += 1;
  }

  if (outOfRange >= Math.ceil(cycles.length / 2)) {
    candidates.push(
      `${outOfRange} of your last ${cycles.length} cycles fell outside the typical ${NORMAL_MIN}–${NORMAL_MAX} day range.`
    );
    score += 2;
  } else if (outOfRange >= 2) {
    candidates.push(
      `${outOfRange} of your last ${cycles.length} cycles fell outside the typical ${NORMAL_MIN}–${NORMAL_MAX} day range.`
    );
    score += 1;
  }

  if (veryLong >= 3) {
    candidates.push(
      `${veryLong} of your last ${cycles.length} cycles were longer than ${NORMAL_MAX} days.`
    );
    score += 2;
  }

  if (veryShort >= 3) {
    candidates.push(
      `${veryShort} of your last ${cycles.length} cycles were shorter than ${NORMAL_MIN} days.`
    );
    score += 2;
  }

  if (logs.length >= 14) {
    const hasAcne = (l: DailyLogData) => parseSymptoms(l.symptoms).includes('acne');
    const hasCramps = (l: DailyLogData) => parseSymptoms(l.symptoms).includes('cramps');
    const acneRate = rateOf(logs, hasAcne);
    const crampsRate = rateOf(logs, hasCramps);

    if (acneRate >= 0.3 && (sd >= 5 || outOfRange >= 2)) {
      candidates.push(
        `Persistent acne (${Math.round(acneRate * 100)}% of tracked days) has appeared alongside variable cycle lengths.`
      );
      score += 1;
    }

    if (crampsRate >= 0.5) {
      candidates.push(
        `Cramps were logged on ${Math.round(crampsRate * 100)}% of your tracked days.`
      );
      score += 1;
    }
  }

  const reasons = candidates
    .map(tryValidateScreeningText)
    .filter((r): r is string => r !== null);

  const signal: ScreeningSignal =
    score >= 4 ? 'notable' : score >= 2 ? 'gentle' : 'none';

  const confidence: ScreeningConfidence =
    cycles.length >= 6 ? 'high' : cycles.length >= 4 ? 'medium' : 'low';

  const suggestSeeingDoctor = signal === 'notable' && confidence !== 'low';

  if (signal === 'none' && reasons.length === 0) {
    reasons.push(
      `Your cycle has been within typical ranges across your last ${cycles.length} cycles.`
    );
  }

  return {
    signal,
    reasons,
    suggestSeeingDoctor,
    confidence,
    disclaimerRequired: true,
  };
}

function parseSymptoms(raw: string): Symptom[] {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as Symptom[];
  } catch {
    // fall through
  }
  return [];
}
