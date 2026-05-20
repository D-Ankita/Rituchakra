/**
 * End-to-end test: user mentions a topic in turn 1, asks about it
 * later, and the next context packet built for the conversation
 * contains a memory snippet referencing that topic.
 *
 * We mock the SQLite-backed Memory module so this runs under Jest
 * without a native module.
 */

jest.mock('../Memory', () => {
  const mockStore: any[] = [];
  let mockNextId = 1;
  return {
    recordMemory: async (entry: any) => {
      const row = { id: mockNextId++, createdAt: Date.now(), ...entry };
      mockStore.push(row);
      return row.id;
    },
    listRecentMemories: async () => [...mockStore].reverse(),
    retrieveRelevantMemories: async (topics: string[], limit = 5) => {
      const now = Date.now();
      const scored = mockStore.map((m) => {
        const overlap = m.salientTopics.filter((t: string) =>
          topics.some((q) => q.toLowerCase() === t.toLowerCase())
        ).length;
        const ageDays = (now - m.createdAt) / 86_400_000;
        const recency = Math.exp(-ageDays / 30);
        return {
          ageDays: Math.floor(ageDays),
          summary: m.summary,
          topics: m.salientTopics,
          score: overlap > 0 ? recency * (1 + overlap * 2) : 0,
        };
      });
      return scored
        .filter((s) => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(({ ageDays, summary, topics: t }) => ({ ageDays, summary, topics: t }));
    },
  };
});

import { ConversationEngine } from '../ConversationEngine';
import { CloudBoundary } from '../../cloud/CloudBoundary';
import {
  NullTTSProvider,
  NullSTTProvider,
  NullAvatarProvider,
  NullLLMProvider,
} from '../../cloud/providers/nullProviders';
import { LLMProvider, LLMRequest, LLMResponse } from '../../cloud/CloudBoundary.types';
import { ContextPacket } from '../../context/ContextPacket';
import { retrieveRelevantMemories } from '../Memory';

class ScriptedLLM implements LLMProvider {
  readonly name = 'scripted-llm';
  public lastReq: LLMRequest | null = null;
  constructor(private replies: string[]) {}
  async generate(req: LLMRequest): Promise<LLMResponse> {
    this.lastReq = req;
    const text = this.replies.shift() ?? 'okay.';
    return {
      text,
      citations: [],
      safetyFlags: [],
      providerUsed: this.name,
      isFallback: false,
    };
  }
}

function packetWith(memorySnippets: ContextPacket['memorySnippets']): ContextPacket {
  return {
    cycleDay: 14,
    cycleLength: 28,
    phase: 'ovulation',
    predictionConfidence: 'high',
    patterns: [],
    screening: null,
    cultural: null,
    behavior: null,
    language: 'en',
    personaName: 'Dadi',
    addressAs: 'beta',
    memorySnippets,
  };
}

describe('Memory recall — end to end', () => {
  it('topic from turn 1 surfaces in retrieval, and turn 3 packet contains it', async () => {
    const llm = new ScriptedLLM([
      "I hear you about the presentation. Take it slowly.",
      "Yes — last week you mentioned a presentation.",
    ]);

    const boundary = new CloudBoundary({
      llm,
      fallbackLlm: new NullLLMProvider(),
      tts: new NullTTSProvider(),
      stt: new NullSTTProvider(),
      avatar: new NullAvatarProvider(),
      optIn: () => true,
      voiceEnabled: () => false,
      isDev: false,
    });

    const engine = new ConversationEngine({
      cloudBoundary: boundary,
      buildPacket: async (topics) => {
        const snippets = await retrieveRelevantMemories(topics, 5);
        return packetWith(snippets);
      },
    });

    await engine.send('I am worried about a big presentation tomorrow.');
    const followUpReply = await engine.send(
      'do you remember what I was worried about?'
    );

    expect(followUpReply.text.toLowerCase()).toContain('presentation');

    expect(llm.lastReq).not.toBeNull();
    const snippetsSentToLLM = llm.lastReq!.packet.memorySnippets;
    const hasPresentation = snippetsSentToLLM.some((s) =>
      /presentation/i.test(s.summary) ||
      s.topics.some((t) => /presentation/i.test(t))
    );
    expect(hasPresentation).toBe(true);
  });
});
