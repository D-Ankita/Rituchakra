import { ContextPacket } from '../context/ContextPacket';
import { LLMRequest, Turn } from './CloudBoundary.types';

/**
 * Strips identifiers and free-text contamination from anything that
 * leaves the device. Pure function. Tested aggressively in
 * __tests__/redactor.test.ts — adding a field to ContextPacket
 * without updating the redactor will fail the "no raw text leaks"
 * test.
 *
 * The screener's outputValidator handles the medical-language side;
 * this handles the PII side.
 */

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
const PHONE_RE = /(?:\+?\d[\d\s\-().]{7,}\d)/g;
const URL_RE = /https?:\/\/\S+/gi;
const LONG_DIGIT_RE = /\b\d{6,}\b/g;
const ADDRESS_HINT_RE = /\b\d{1,5}\s+[A-Z][a-zA-Z]{2,}\s+(road|rd|street|st|lane|ln|avenue|ave|nagar|colony|society|apt|apartment|building|bldg)\b/gi;

export interface RedactionReport {
  removed: string[];          // categories removed (for tests)
  truncated: boolean;
}

function applyAndRecord(
  text: string,
  re: RegExp,
  token: string,
  label: string,
  removed: string[]
): string {
  re.lastIndex = 0;
  const next = text.replace(re, token);
  if (next !== text) removed.push(label);
  return next;
}

export function redactString(input: string): { text: string; removed: string[] } {
  const removed: string[] = [];
  let text = input;
  text = applyAndRecord(text, EMAIL_RE, '{email}', 'email', removed);
  text = applyAndRecord(text, URL_RE, '{url}', 'url', removed);
  text = applyAndRecord(text, ADDRESS_HINT_RE, '{address}', 'address', removed);
  text = applyAndRecord(text, LONG_DIGIT_RE, '{number}', 'long_number', removed);
  text = applyAndRecord(text, PHONE_RE, '{phone}', 'phone', removed);
  return { text, removed };
}

export function redactPacket(packet: ContextPacket): {
  packet: ContextPacket;
  report: RedactionReport;
} {
  const removed = new Set<string>();
  const apply = (s: string) => {
    const r = redactString(s);
    for (const x of r.removed) removed.add(x);
    return r.text;
  };

  const redacted: ContextPacket = {
    ...packet,
    addressAs: apply(packet.addressAs),
    patterns: packet.patterns.map((p) => ({
      ...p,
      finding: apply(p.finding),
    })),
    screening: packet.screening
      ? {
          ...packet.screening,
          reasons: packet.screening.reasons.map(apply),
        }
      : null,
    cultural: packet.cultural
      ? {
          ...packet.cultural,
          name: apply(packet.cultural.name),
        }
      : null,
    behavior: packet.behavior
      ? {
          ...packet.behavior,
          note: apply(packet.behavior.note),
        }
      : null,
    memorySnippets: packet.memorySnippets.map((m) => ({
      ...m,
      summary: apply(m.summary),
      topics: m.topics.map(apply),
    })),
    // personaName is user-chosen but constrained to short labels;
    // still redact for safety.
    personaName: apply(packet.personaName),
  };

  return {
    packet: redacted,
    report: { removed: [...removed], truncated: false },
  };
}

export function redactRequest(req: LLMRequest): {
  request: LLMRequest;
  report: RedactionReport;
} {
  const packetResult = redactPacket(req.packet);
  const userTurnResult = req.userTurn
    ? redactString(req.userTurn)
    : { text: undefined, removed: [] };
  const history: Turn[] | undefined = req.history?.map((t) => ({
    role: t.role,
    text: redactString(t.text).text,
  }));

  const removed = new Set([
    ...packetResult.report.removed,
    ...userTurnResult.removed,
  ]);

  return {
    request: {
      systemPrompt: req.systemPrompt,
      packet: packetResult.packet,
      userTurn: userTurnResult.text,
      history,
    },
    report: { removed: [...removed], truncated: false },
  };
}

/**
 * Hard assertion used in dev/test to prove no obvious identifier
 * pattern survived redaction. Throws on first match.
 */
export function assertNoIdentifiers(req: LLMRequest): void {
  const json = JSON.stringify({
    packet: req.packet,
    userTurn: req.userTurn,
    history: req.history,
  });
  EMAIL_RE.lastIndex = 0;
  if (EMAIL_RE.test(json)) throw new Error('redactor: email survived');
  EMAIL_RE.lastIndex = 0;
  URL_RE.lastIndex = 0;
  if (URL_RE.test(json)) throw new Error('redactor: url survived');
  URL_RE.lastIndex = 0;
  LONG_DIGIT_RE.lastIndex = 0;
  if (LONG_DIGIT_RE.test(json)) throw new Error('redactor: long number survived');
  LONG_DIGIT_RE.lastIndex = 0;
}
