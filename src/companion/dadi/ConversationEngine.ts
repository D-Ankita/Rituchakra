import { CloudBoundary } from '../cloud/CloudBoundary';
import { ContextPacket } from '../context/ContextPacket';
import { LLMResponse, Turn } from '../cloud/CloudBoundary.types';
import { buildPersonaPrompt } from './personaPrompt';
import { buildLanguageProfile } from '../culture/languageProfile';
import { classifyInput, sweepOutput } from './safetyRouter';
import { summarizeAndPersistTurn, extractSalientTopics, turnsToHistory } from './memorySummarizer';

export interface ConversationOptions {
  cloudBoundary: CloudBoundary;
  buildPacket: (memoryTopics: string[]) => Promise<ContextPacket>;
}

export interface ConversationReply {
  text: string;
  isFallback: boolean;
  safetyFlags: string[];
  providerUsed: string;
  citations: string[];
  blocked: boolean;
}

export class ConversationEngine {
  private history: Turn[] = [];

  constructor(private opts: ConversationOptions) {}

  resetHistory(): void {
    this.history = [];
  }

  loadHistory(turns: Turn[]): void {
    this.history = [...turns];
  }

  async send(userTurn: string): Promise<ConversationReply> {
    const decision = classifyInput(userTurn);
    if (decision.kind !== 'allow') {
      this.history.push({ role: 'user', text: userTurn });
      this.history.push({ role: 'assistant', text: decision.reply });
      return {
        text: decision.reply,
        isFallback: true,
        safetyFlags: [decision.flag],
        providerUsed: 'safety-router',
        citations: [],
        blocked: true,
      };
    }

    const topics = extractSalientTopics(userTurn);
    const packet = await this.opts.buildPacket(topics);

    const persona = buildPersonaPrompt({
      personaName: packet.personaName,
      addressAs: packet.addressAs,
      language: buildLanguageProfile(packet.language, null),
    });

    const llmResponse: LLMResponse = await this.opts.cloudBoundary.ask({
      systemPrompt: persona.prompt,
      packet,
      userTurn,
      history: turnsToHistory(this.history),
    });

    const swept = sweepOutput(llmResponse.text);
    const finalText = swept.text;

    this.history.push({ role: 'user', text: userTurn });
    this.history.push({ role: 'assistant', text: finalText });

    await summarizeAndPersistTurn({
      userTurn,
      llmResponse: { ...llmResponse, text: finalText },
      cycleId: null,
      cycleDay: packet.cycleDay,
      phase: packet.phase,
    });

    return {
      text: finalText,
      isFallback: llmResponse.isFallback,
      safetyFlags: [...llmResponse.safetyFlags, ...swept.flags],
      providerUsed: llmResponse.providerUsed,
      citations: llmResponse.citations,
      blocked: false,
    };
  }
}
