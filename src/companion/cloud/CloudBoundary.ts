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
} from './CloudBoundary.types';
import { redactRequest, assertNoIdentifiers } from './redactor';
import { truncateToBudget } from '../context/tokenBudget';

interface BoundaryDeps {
  llm: LLMProvider;
  fallbackLlm: LLMProvider;       // always the Null provider in practice
  tts: TTSProvider;
  stt: STTProvider;
  avatar: AvatarProvider;
  optIn: () => boolean;
  isDev: boolean;
}

/**
 * The ONLY file in the codebase that talks to external AI services.
 *
 * Privacy enforcement (defense in depth):
 *   1. optIn() check — if false, fallback provider only, no
 *      network call ever happens.
 *   2. redactRequest() strips identifiers and caps history.
 *   3. truncateToBudget() caps total packet size.
 *   4. assertNoIdentifiers() throws in dev if anything leaked
 *      (belt-and-suspenders).
 *   5. On any provider error, falls back to the Null provider so
 *      the user never sees a broken Dadi.
 *
 * Static enforcement: importGraph.test.ts asserts no file outside
 * src/companion/cloud/providers/** imports an LLM SDK directly.
 */
export class CloudBoundary {
  constructor(private deps: BoundaryDeps) {}

  async ask(req: LLMRequest): Promise<LLMResponse> {
    if (!this.deps.optIn()) {
      return this.deps.fallbackLlm.generate(req);
    }

    const { request } = redactRequest(req);
    const trimmedPacket = truncateToBudget(request.packet);
    const safeReq: LLMRequest = { ...request, packet: trimmedPacket };

    if (this.deps.isDev) assertNoIdentifiers(safeReq);

    try {
      return await this.deps.llm.generate(safeReq);
    } catch (err) {
      return this.deps.fallbackLlm.generate(safeReq);
    }
  }

  async speak(text: string, voice: VoiceId): Promise<AudioStream> {
    if (!this.deps.optIn()) return { uri: '', durationMs: 0 };
    try {
      return await this.deps.tts.synthesize(text, voice);
    } catch {
      return { uri: '', durationMs: 0 };
    }
  }

  async listen(audio: AudioStream): Promise<string> {
    if (!this.deps.optIn()) return '';
    try {
      return await this.deps.stt.transcribe(audio);
    } catch {
      return '';
    }
  }

  async animate(text: string, audio: AudioStream): Promise<AvatarStream> {
    if (!this.deps.optIn()) {
      return { uri: audio.uri, durationMs: audio.durationMs };
    }
    try {
      return await this.deps.avatar.speak(text, audio);
    } catch {
      return { uri: audio.uri, durationMs: audio.durationMs };
    }
  }
}
