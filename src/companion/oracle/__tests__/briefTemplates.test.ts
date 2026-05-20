import { buildOfflineBrief } from '../briefTemplates';
import { ContextPacket } from '../../context/ContextPacket';

function basePacket(over: Partial<ContextPacket> = {}): ContextPacket {
  return {
    cycleDay: 3,
    cycleLength: 28,
    phase: 'menstrual',
    predictionConfidence: 'high',
    patterns: [],
    screening: null,
    cultural: null,
    behavior: null,
    language: 'en',
    personaName: 'Dadi',
    addressAs: 'beta',
    memorySnippets: [],
    ...over,
  };
}

describe('buildOfflineBrief', () => {
  it('produces a non-empty greeting + phase sentence', () => {
    const text = buildOfflineBrief(basePacket());
    expect(text).toContain('beta');
    expect(text).toMatch(/Day 3/);
    expect(text).toMatch(/winter|menstrual/i);
  });

  it('uses Hindi/Marathi greetings for those languages', () => {
    expect(buildOfflineBrief(basePacket({ language: 'hi-en' }))).toMatch(/Namaste/);
    expect(buildOfflineBrief(basePacket({ language: 'mr-en' }))).toMatch(/Namaskar/);
  });

  it('surfaces top pattern when present', () => {
    const text = buildOfflineBrief(
      basePacket({
        patterns: [{ type: 'mood', finding: 'You report calm on day 4 most cycles.', confidence: 'high' }],
      })
    );
    expect(text).toContain('calm on day 4');
  });

  it('mentions cultural flag when set', () => {
    const text = buildOfflineBrief(
      basePacket({ cultural: { kind: 'festival', name: 'Diwali', contentSlug: null } })
    );
    expect(text).toContain('Diwali');
  });

  it('surfaces screening only when suggestSeeingDoctor is true', () => {
    const withDoc = buildOfflineBrief(
      basePacket({
        screening: { signal: 'notable', reasons: ['varied 12 days'], suggestSeeingDoctor: true },
      })
    );
    expect(withDoc).toMatch(/doctor/i);

    const withoutDoc = buildOfflineBrief(
      basePacket({
        screening: { signal: 'gentle', reasons: ['varied 6 days'], suggestSeeingDoctor: false },
      })
    );
    expect(withoutDoc).not.toMatch(/doctor/i);
  });
});
