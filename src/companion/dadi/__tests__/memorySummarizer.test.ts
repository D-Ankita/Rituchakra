import { extractSalientTopics } from '../topics';

describe('extractSalientTopics', () => {
  it('returns up to 5 topics, longest words first when tied', () => {
    const topics = extractSalientTopics(
      'I was very tired after the workshop and my cramps were heavy and bloating was bad too'
    );
    expect(topics.length).toBeLessThanOrEqual(5);
    expect(topics).toContain('tired');
    expect(topics).toContain('cramps');
  });

  it('drops stop words and short tokens', () => {
    const topics = extractSalientTopics('I am the one you you you i i i');
    expect(topics.length).toBe(0);
  });

  it('strips punctuation', () => {
    const topics = extractSalientTopics('Cramps! cramps; cramps...');
    expect(topics).toContain('cramps');
  });
});
