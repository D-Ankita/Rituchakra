import { ContextPacket } from '../context/ContextPacket';

/**
 * Template-driven offline brief. Used when:
 *   - User has not opted in to cloud features.
 *   - LLM call fails.
 *   - Tests.
 *
 * Reads only what's in the packet. No external calls. Output is
 * intentionally short and a little plain — the LLM brief is the
 * delightful version; this is the "still better than silence" one.
 */
export function buildOfflineBrief(packet: ContextPacket): string {
  const lines: string[] = [];
  const greet = greeting(packet);
  lines.push(greet);

  if (packet.phase && packet.cycleDay !== null) {
    lines.push(phaseSentence(packet));
  }

  if (packet.patterns.length > 0) {
    lines.push(packet.patterns[0].finding);
  }

  if (packet.cultural) {
    lines.push(`Today is ${packet.cultural.name}.`);
  }

  if (packet.screening && packet.screening.suggestSeeingDoctor) {
    lines.push(
      `Something to mention if you see your doctor soon: ${packet.screening.reasons[0] ?? 'your recent cycle pattern.'}`
    );
  }

  return lines.join(' ');
}

function greeting(packet: ContextPacket): string {
  switch (packet.language) {
    case 'hi':
    case 'hi-en':
      return `Namaste, ${packet.addressAs}.`;
    case 'mr':
    case 'mr-en':
      return `Namaskar, ${packet.addressAs}.`;
    default:
      return `Hello, ${packet.addressAs}.`;
  }
}

function phaseSentence(packet: ContextPacket): string {
  const day = packet.cycleDay;
  switch (packet.phase) {
    case 'menstrual':
      return `Day ${day} — your inner winter. Rest is the work today.`;
    case 'follicular':
      return `Day ${day} — energy is rising. A good day for the work that asks for focus.`;
    case 'ovulation':
      return `Day ${day} — you're at your most expressive. Use the warmth.`;
    case 'luteal':
      return `Day ${day} — softening into the back half. Slow things that drain you.`;
    default:
      return `Day ${day} of your cycle.`;
  }
}
