import { BANNED_PHRASES, ScreeningGuardrailViolation } from './bannedPhrases';

/**
 * Runtime gate. Every string the screener emits passes through here
 * before leaving the module.
 *
 * Throws ScreeningGuardrailViolation on match. Callers in the
 * screener wrap their emissions and drop offending reasons rather
 * than ship them — fail-closed.
 */
export function validateScreeningText(text: string): void {
  for (const re of BANNED_PHRASES) {
    const match = text.match(re);
    if (match) {
      throw new ScreeningGuardrailViolation(re.source, match[0]);
    }
  }
}

/**
 * Convenience helper for the screener: validate, return text on
 * pass, return null on fail. Used to drop a single reason without
 * killing the whole result.
 */
export function tryValidateScreeningText(text: string): string | null {
  try {
    validateScreeningText(text);
    return text;
  } catch {
    return null;
  }
}
