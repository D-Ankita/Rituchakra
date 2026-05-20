import { ContextPacket } from '../context/ContextPacket';

export interface LLMRequest {
  systemPrompt: string;
  packet: ContextPacket;
  userTurn?: string;        // omitted for morning brief (proactive)
  history?: Turn[];          // prior turns in this conversation, capped
}

export interface Turn {
  role: 'user' | 'assistant';
  text: string;
}

export interface LLMResponse {
  text: string;
  citations: string[];       // article slugs referenced
  safetyFlags: SafetyFlag[];
  providerUsed: string;
  isFallback: boolean;       // true if produced by an offline template, not an LLM
}

export type SafetyFlag =
  | 'red_flag_routed'
  | 'low_confidence_refused'
  | 'out_of_scope'
  | 'injection_blocked'
  | 'diagnosis_stripped'
  | 'prescription_stripped';

export interface LLMProvider {
  readonly name: string;
  generate(req: LLMRequest): Promise<LLMResponse>;
}

export interface TTSProvider {
  readonly name: string;
  synthesize(text: string, voice: VoiceId): Promise<AudioStream>;
}

export interface STTProvider {
  readonly name: string;
  transcribe(audio: AudioStream): Promise<string>;
}

export interface AvatarProvider {
  readonly name: string;
  speak(text: string, audio: AudioStream): Promise<AvatarStream>;
}

export type VoiceId = string;

export interface AudioStream {
  uri: string;
  durationMs: number;
}

export interface AvatarStream {
  uri: string;
  durationMs: number;
}
