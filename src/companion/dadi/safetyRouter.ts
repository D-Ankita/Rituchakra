import { SafetyFlag } from '../cloud/CloudBoundary.types';

/**
 * Lightweight, deterministic safety pre-check that runs BEFORE any
 * LLM call. Mirrors §5 Layer 1 of the AI Coach design — keyword +
 * regex pass for the highest-stakes signals. The LLM-based fuzzy
 * classifier from that spec is a future addition; this is the
 * non-negotiable baseline.
 */

export type SafetyDecision =
  | { kind: 'allow' }
  | { kind: 'red_flag'; reply: string; flag: SafetyFlag }
  | { kind: 'injection'; reply: string; flag: SafetyFlag }
  | { kind: 'out_of_scope'; reply: string; flag: SafetyFlag };

const RED_FLAG_PATTERNS: ReadonlyArray<RegExp> = [
  /\b(suicid|kill myself|want to die|end (my|it) (life|all)|don'?t want to be alive|not want to (live|be alive))\b/i,
  /\bcan'?t stop bleeding\b/i,
  /\bsoak(ing|ed)? through (a )?pad.{0,30}(hour|every|each)\b/i,
  /\bsevere\s+(pain|bleeding|cramps)\b/i,
  /\bchest\s+pain\b/i,
  /\b(can'?t|cannot)\s+breathe\b/i,
  /\bectopic\b/i,
  /\bbleeding\b.{0,40}\b(pregnant|pregnancy)\b/i,
];

const INJECTION_PATTERNS: ReadonlyArray<RegExp> = [
  /\bignore (all )?(previous|prior|above) (instructions|prompts|rules)\b/i,
  /\b(you are|act as|pretend to be) (a |an )?(doctor|gynecologist|physician)\b/i,
  /\bsystem prompt\b/i,
  /\breveal your (instructions|system prompt|rules)\b/i,
  /\bjailbreak\b/i,
];

// Crude scope check — anything totally unrelated to cycle/wellness/feelings
// gets a polite redirect. The persona prompt also handles this, but a
// pre-check shortcut keeps us from paying for clearly off-topic LLM calls.
const OUT_OF_SCOPE_PATTERNS: ReadonlyArray<RegExp> = [
  /\b(write|generate|fix|debug)\s+(code|javascript|python|sql)\b/i,
  /\bstock (price|market|tip)\b/i,
  /\bpolitic(s|al)\b/i,
];

const RED_FLAG_REPLY = `What you're describing sounds serious — please don't wait on me. Call a doctor now, or 102 if it's urgent. If you're feeling unsafe, iCall is at 9152987821 and they will listen. I'm here when you're back.`;

const INJECTION_REPLY = `I can only talk about your cycle, your body, and how you're feeling. Let's stay with that — tell me what's actually going on for you?`;

const OUT_OF_SCOPE_REPLY = `That's a bit outside what I'm here for, beta. I can talk about your cycle, how you're feeling, food, rest, rituals — anything in that world.`;

export function classifyInput(text: string): SafetyDecision {
  for (const re of RED_FLAG_PATTERNS) {
    if (re.test(text)) {
      return { kind: 'red_flag', reply: RED_FLAG_REPLY, flag: 'red_flag_routed' };
    }
  }
  for (const re of INJECTION_PATTERNS) {
    if (re.test(text)) {
      return { kind: 'injection', reply: INJECTION_REPLY, flag: 'injection_blocked' };
    }
  }
  for (const re of OUT_OF_SCOPE_PATTERNS) {
    if (re.test(text)) {
      return { kind: 'out_of_scope', reply: OUT_OF_SCOPE_REPLY, flag: 'out_of_scope' };
    }
  }
  return { kind: 'allow' };
}

/**
 * Output-side sweep. The LLM may slip — strip diagnosis / prescription
 * language post-hoc as a backstop. Uses the same denylist surface as
 * the screener.
 */
const OUTPUT_STRIP_PATTERNS: ReadonlyArray<RegExp> = [
  /\bI diagnose you\b/gi,
  /\byou definitely have\b/gi,
  /\btake \d+\s*(mg|g|tablets?|capsules?)\b/gi,
];

export function sweepOutput(text: string): { text: string; flags: SafetyFlag[] } {
  let out = text;
  const flags: SafetyFlag[] = [];
  for (const re of OUTPUT_STRIP_PATTERNS) {
    if (re.test(out)) {
      out = out.replace(re, '');
      if (re.source.includes('diagnose') || re.source.includes('definitely have')) {
        flags.push('diagnosis_stripped');
      } else {
        flags.push('prescription_stripped');
      }
    }
    re.lastIndex = 0;
  }
  return { text: out.replace(/\s{2,}/g, ' ').trim(), flags };
}
