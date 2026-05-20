import { ContextPacket } from './ContextPacket';

export const MAX_PACKET_TOKENS = 1500;

/**
 * Cheap heuristic for context-packet size. ~4 chars per token,
 * good enough to keep us off the rails. Real budget enforced at
 * the provider call site against the actual tokenizer.
 */
export function estimateTokens(packet: ContextPacket): number {
  const json = JSON.stringify(packet);
  return Math.ceil(json.length / 4);
}

export function fitsBudget(packet: ContextPacket): boolean {
  return estimateTokens(packet) <= MAX_PACKET_TOKENS;
}

/**
 * Truncates the longest fields first: memory snippets, then pattern
 * findings, then reasons. Returns a new packet that fits or is as
 * close as possible.
 */
export function truncateToBudget(packet: ContextPacket): ContextPacket {
  let p: ContextPacket = { ...packet };

  while (!fitsBudget(p) && p.memorySnippets.length > 0) {
    p = { ...p, memorySnippets: p.memorySnippets.slice(0, -1) };
  }
  while (!fitsBudget(p) && p.patterns.length > 1) {
    p = { ...p, patterns: p.patterns.slice(0, -1) };
  }
  if (!fitsBudget(p) && p.screening && p.screening.reasons.length > 1) {
    p = {
      ...p,
      screening: { ...p.screening, reasons: p.screening.reasons.slice(0, 1) },
    };
  }
  return p;
}
