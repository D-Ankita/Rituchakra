import { LLMResponse, Turn } from '../cloud/CloudBoundary.types';
import { recordMemory } from './Memory';
import { extractSalientTopics, inferSentiment, compactText } from './topics';

export { extractSalientTopics } from './topics';

/**
 * Post-conversation summarizer. Picks up to a few salient topics
 * from the turn pair and records a short summary. Pure local for
 * v1 — no LLM call. Keeps memory cheap and predictable; we can
 * upgrade to an LLM summarizer later if Dadi's memory needs nuance.
 */
export async function summarizeAndPersistTurn(opts: {
  userTurn: string;
  llmResponse: LLMResponse;
  cycleId: number | null;
  cycleDay: number | null;
  phase: string | null;
}): Promise<number> {
  const topics = extractSalientTopics(opts.userTurn);
  const summary = buildSummary(opts.userTurn, opts.llmResponse.text);
  const sentiment = inferSentiment(opts.userTurn);

  return recordMemory({
    cycleId: opts.cycleId,
    cycleDay: opts.cycleDay,
    phase: opts.phase,
    summary,
    salientTopics: topics,
    sentiment,
    source: 'conversation',
  });
}

function buildSummary(userTurn: string, reply: string): string {
  return `User: ${compactText(userTurn, 80)}\nDadi: ${compactText(reply, 80)}`;
}

export function turnsToHistory(turns: Turn[], maxTurns = 6): Turn[] {
  return turns.slice(-maxTurns);
}
