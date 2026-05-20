import { estimateTokens, fitsBudget, truncateToBudget, MAX_PACKET_TOKENS } from '../tokenBudget';
import { ContextPacket } from '../ContextPacket';

function packet(): ContextPacket {
  return {
    cycleDay: 10,
    cycleLength: 28,
    phase: 'follicular',
    predictionConfidence: 'high',
    patterns: [
      { type: 'mood', finding: 'a'.repeat(200), confidence: 'high' },
      { type: 'sleep', finding: 'b'.repeat(200), confidence: 'medium' },
    ],
    screening: {
      signal: 'gentle',
      reasons: ['x'.repeat(200), 'y'.repeat(200)],
      suggestSeeingDoctor: false,
    },
    cultural: null,
    behavior: null,
    language: 'en',
    personaName: 'Dadi',
    addressAs: 'beta',
    memorySnippets: Array.from({ length: 10 }, (_, i) => ({
      ageDays: i,
      summary: 'z'.repeat(500),
      topics: ['t'.repeat(20)],
    })),
  };
}

describe('tokenBudget', () => {
  it('estimateTokens is roughly char-length / 4', () => {
    const p = packet();
    const json = JSON.stringify(p);
    expect(estimateTokens(p)).toBeGreaterThan(json.length / 4 - 5);
    expect(estimateTokens(p)).toBeLessThan(json.length / 4 + 5);
  });

  it('truncates oversized packets to within budget', () => {
    const p = packet();
    expect(fitsBudget(p)).toBe(false);
    const trimmed = truncateToBudget(p);
    expect(estimateTokens(trimmed)).toBeLessThanOrEqual(MAX_PACKET_TOKENS);
  });

  it('truncates memory snippets first', () => {
    const p = packet();
    const trimmed = truncateToBudget(p);
    expect(trimmed.memorySnippets.length).toBeLessThanOrEqual(p.memorySnippets.length);
  });
});
