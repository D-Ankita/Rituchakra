/**
 * Compile-time denylist of phrases that the screener must NEVER emit.
 *
 * The screener does not have access to a list of condition names by
 * design — it computes numeric features and emits template strings
 * parameterized only by numbers. This list is the runtime backstop:
 * outputValidator.ts runs every emitted string through these patterns
 * and rejects on match.
 *
 * Allowed elsewhere (in Dadi conversations grounded in reviewed
 * articles): phrases like "this pattern is sometimes associated with
 * PCOS — worth asking a doctor." Those originate from the LLM layer
 * with citations, never from the deterministic screener.
 */
export const BANNED_PHRASES: ReadonlyArray<RegExp> = [
  /\bPCOS\b/i,
  /\bPCOD\b/i,
  /\bendometriosis\b/i,
  /\bdiagnos(?:is|ed|tic|e|ing)\b/i,
  /\byou\s+have\b/i,
  /\bdisease\b/i,
  /\bdisorder\b/i,
  /\bsyndrome\b/i,
  /\binfertil/i,
  /\bcancer\b/i,
  /\bhormonal\s+imbalance\b/i,
  /\bthyroid\b/i,
];

export class ScreeningGuardrailViolation extends Error {
  constructor(public readonly pattern: string, public readonly offending: string) {
    super(
      `Screening output violated guardrail (${pattern}): "${offending}"`
    );
    this.name = 'ScreeningGuardrailViolation';
  }
}
