import {
  LLMProvider,
  LLMRequest,
  LLMResponse,
  TTSProvider,
  STTProvider,
  AvatarProvider,
  AudioStream,
  AvatarStream,
  VoiceId,
} from '../CloudBoundary.types';

/**
 * Default providers wired in at app boot. These never make a
 * network call. They are used:
 *   - when cloudOptIn is false (default for every user at install)
 *   - when the real provider fails (graceful degradation)
 *   - in tests
 *
 * The LLM null provider produces a deterministic template response
 * built from the packet alone — same fallback the Oracle's
 * briefTemplates uses.
 */

export class NullLLMProvider implements LLMProvider {
  readonly name = 'null-llm';

  async generate(req: LLMRequest): Promise<LLMResponse> {
    const { packet } = req;
    const phase = packet.phase ?? 'this';
    const day = packet.cycleDay ?? null;
    const dayPart = day ? ` (day ${day})` : '';
    const text =
      `I'm here, ${packet.addressAs}. You're in your ${phase} phase${dayPart}. ` +
      `I can't reach the cloud right now, so I'll keep this short — turn me on in settings once you have a moment, ` +
      `or just tell me how you're feeling and I'll listen.`;
    return {
      text,
      citations: [],
      safetyFlags: [],
      providerUsed: this.name,
      isFallback: true,
    };
  }
}

export class NullTTSProvider implements TTSProvider {
  readonly name = 'null-tts';
  async synthesize(_text: string, _voice: VoiceId): Promise<AudioStream> {
    return { uri: '', durationMs: 0 };
  }
}

export class NullSTTProvider implements STTProvider {
  readonly name = 'null-stt';
  async transcribe(_audio: AudioStream): Promise<string> {
    return '';
  }
}

export class NullAvatarProvider implements AvatarProvider {
  readonly name = 'null-avatar';
  async speak(_text: string, audio: AudioStream): Promise<AvatarStream> {
    return { uri: audio.uri, durationMs: audio.durationMs };
  }
}
