/**
 * Pure topic extraction for memory snippets and retrieval. No DB
 * imports — safe to test under Jest without a SQLite native module.
 */

const STOP_WORDS = new Set([
  'the','a','an','and','or','but','if','then','of','to','for','in','on','at','by',
  'is','are','was','were','be','been','being','have','has','had','do','does','did',
  'i','me','my','you','your','we','our','they','their','it','its','this','that',
  'with','as','from','about','so','just','very','really','can','could','would',
  'should','will','shall','am','also','too','because','dadi','aaji','nani',
]);

export function extractSalientTopics(text: string): string[] {
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 4 && !STOP_WORDS.has(t));
  const freq = new Map<string, number>();
  for (const t of tokens) freq.set(t, (freq.get(t) ?? 0) + 1);
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([t]) => t);
}

export function inferSentiment(
  text: string
): 'positive' | 'neutral' | 'low' | 'distressed' {
  const t = text.toLowerCase();
  if (/(scared|terrified|panic|cant cope|can't cope|hopeless|want to die|kill myself)/.test(t))
    return 'distressed';
  if (/(sad|tired|exhausted|down|low|cried|anxious|worried|stressed)/.test(t)) return 'low';
  if (/(great|good|happy|excited|calm|peaceful|better|grateful)/.test(t)) return 'positive';
  return 'neutral';
}

export function compactText(text: string, max: number): string {
  const collapsed = text.replace(/\s+/g, ' ').trim();
  if (collapsed.length <= max) return collapsed;
  return collapsed.slice(0, max - 1) + '…';
}
