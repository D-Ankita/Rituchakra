import { validateScreeningText, tryValidateScreeningText } from '../outputValidator';
import { ScreeningGuardrailViolation, BANNED_PHRASES } from '../bannedPhrases';

describe('outputValidator', () => {
  it('passes a numeric-only template string', () => {
    expect(() =>
      validateScreeningText('4 of your last 6 cycles were longer than 35 days.')
    ).not.toThrow();
  });

  it('passes a benign reassurance string', () => {
    expect(() =>
      validateScreeningText('Your cycle has been within typical ranges.')
    ).not.toThrow();
  });

  it('blocks the condition name PCOS in any casing', () => {
    expect(() => validateScreeningText('You may have PCOS.')).toThrow(
      ScreeningGuardrailViolation
    );
    expect(() => validateScreeningText('this looks like pcos')).toThrow();
    expect(() => validateScreeningText('PcOs pattern')).toThrow();
  });

  it('blocks PCOD, endometriosis, syndrome, disorder, disease', () => {
    expect(() => validateScreeningText('looks like PCOD')).toThrow();
    expect(() => validateScreeningText('signs of endometriosis')).toThrow();
    expect(() => validateScreeningText('this is a syndrome')).toThrow();
    expect(() => validateScreeningText('a hormonal disorder')).toThrow();
    expect(() => validateScreeningText('chronic disease')).toThrow();
  });

  it('blocks diagnostic language: diagnosis, diagnosed, you have', () => {
    expect(() => validateScreeningText('Your diagnosis is clear.')).toThrow();
    expect(() => validateScreeningText('You are diagnosed with X.')).toThrow();
    expect(() => validateScreeningText('You have a condition.')).toThrow();
  });

  it('blocks infertility, cancer, hormonal imbalance, thyroid mentions', () => {
    expect(() => validateScreeningText('possible infertility')).toThrow();
    expect(() => validateScreeningText('signs of cancer')).toThrow();
    expect(() => validateScreeningText('a hormonal imbalance')).toThrow();
    expect(() => validateScreeningText('thyroid issue')).toThrow();
  });

  it('tryValidateScreeningText returns null on violation, string on pass', () => {
    expect(tryValidateScreeningText('You have PCOS')).toBeNull();
    expect(tryValidateScreeningText('Your cycle has varied by 8 days.')).toBe(
      'Your cycle has varied by 8 days.'
    );
  });

  it('every banned pattern has a matching rejection (fuzz)', () => {
    // For every banned regex, build a sample string that should trip it.
    // This proves the denylist is wired into the validator end-to-end.
    const samples: Array<[RegExp, string]> = [
      [/\bPCOS\b/i, 'a PCOS pattern'],
      [/\bPCOD\b/i, 'a PCOD pattern'],
      [/\bendometriosis\b/i, 'endometriosis is possible'],
      [/\bdiagnos(?:is|ed|tic|e|ing)\b/i, 'a diagnosis is needed'],
      [/\byou\s+have\b/i, 'you have something'],
      [/\bdisease\b/i, 'a disease'],
      [/\bdisorder\b/i, 'a disorder'],
      [/\bsyndrome\b/i, 'a syndrome'],
      [/\binfertil/i, 'possible infertility'],
      [/\bcancer\b/i, 'risk of cancer'],
      [/\bhormonal\s+imbalance\b/i, 'a hormonal imbalance'],
      [/\bthyroid\b/i, 'thyroid concerns'],
    ];

    expect(samples.length).toBe(BANNED_PHRASES.length);
    for (const [, sample] of samples) {
      expect(() => validateScreeningText(sample)).toThrow();
    }
  });

  it('does not over-block: "associated" and "pattern" are allowed', () => {
    expect(() =>
      validateScreeningText(
        'This pattern is associated with hormonal shifts during luteal phase.'
      )
    ).not.toThrow();
  });
});
