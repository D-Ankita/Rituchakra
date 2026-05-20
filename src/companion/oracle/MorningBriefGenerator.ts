import { CloudBoundary } from '../cloud/CloudBoundary';
import { ContextPacket } from '../context/ContextPacket';
import { buildOfflineBrief } from './briefTemplates';
import { buildPersonaPrompt } from '../dadi/personaPrompt';
import { buildLanguageProfile } from '../culture/languageProfile';
import { setCachedBrief } from './briefCache';
import { recordMemory } from '../dadi/Memory';
import { LLMResponse } from '../cloud/CloudBoundary.types';
import { shouldSurfaceScreening, ScreeningSurfaceState } from './rateLimit';

export interface BriefOptions {
  packet: ContextPacket;
  cloudBoundary: CloudBoundary;
  persist?: boolean;
  currentCycleId?: number | null;
  screeningState?: ScreeningSurfaceState;
  onScreeningSurfaced?: (cycleId: number) => void;
}

export interface GeneratedBrief {
  text: string;
  isFallback: boolean;
  citations: string[];
  providerUsed: string;
  screeningSurfaced: boolean;
}

export async function generateMorningBrief(opts: BriefOptions): Promise<GeneratedBrief> {
  const { cloudBoundary } = opts;

  let packet = opts.packet;
  let screeningSurfaced = false;
  if (packet.screening) {
    const allow =
      opts.screeningState && opts.currentCycleId !== undefined
        ? shouldSurfaceScreening(opts.screeningState, opts.currentCycleId ?? null)
        : true;
    if (allow) {
      screeningSurfaced = true;
      if (opts.currentCycleId != null && opts.onScreeningSurfaced) {
        opts.onScreeningSurfaced(opts.currentCycleId);
      }
    } else {
      packet = { ...packet, screening: null };
    }
  }

  const persona = buildPersonaPrompt({
    personaName: packet.personaName,
    addressAs: packet.addressAs,
    language: buildLanguageProfile(packet.language, null),
  });

  const systemPrompt =
    persona.prompt +
    `\n\n# Proactive morning brief\nGive a 2-4 sentence morning hello: phase awareness, one tailored note (a pattern, cultural flag, or behavior hint), and at most one gentle suggestion. No questions. No greetings beyond "${packet.addressAs}".`;

  let result: LLMResponse;
  try {
    result = await cloudBoundary.ask({
      systemPrompt,
      packet,
    });
  } catch {
    result = {
      text: buildOfflineBrief(packet),
      citations: [],
      safetyFlags: [],
      providerUsed: 'offline-template',
      isFallback: true,
    };
  }

  const text = result.text?.trim() || buildOfflineBrief(packet);
  const brief: GeneratedBrief = {
    text,
    isFallback: result.isFallback || result.providerUsed === 'offline-template',
    citations: result.citations,
    providerUsed: result.providerUsed,
    screeningSurfaced,
  };

  if (opts.persist !== false) {
    await setCachedBrief({
      text: brief.text,
      generatedAt: Date.now(),
      isFallback: brief.isFallback,
    });
    await recordMemory({
      cycleId: null,
      cycleDay: packet.cycleDay,
      phase: packet.phase,
      summary: `Morning brief: ${brief.text.slice(0, 120)}`,
      salientTopics: ['morning-brief'],
      sentiment: 'neutral',
      source: 'morning_brief',
    });
  }

  return brief;
}
