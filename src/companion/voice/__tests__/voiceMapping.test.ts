import { voiceIdForLanguage } from '../voiceMapping';

describe('voiceIdForLanguage', () => {
  it('maps English to en-IN', () => {
    expect(voiceIdForLanguage('en')).toBe('en-IN');
  });
  it('maps Hindi variants to hi-IN', () => {
    expect(voiceIdForLanguage('hi')).toBe('hi-IN');
    expect(voiceIdForLanguage('hi-en')).toBe('hi-IN');
  });
  it('maps Marathi variants to mr-IN', () => {
    expect(voiceIdForLanguage('mr')).toBe('mr-IN');
    expect(voiceIdForLanguage('mr-en')).toBe('mr-IN');
  });
});
