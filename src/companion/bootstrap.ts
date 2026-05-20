import { CloudBoundary } from './cloud/CloudBoundary';
import {
  NullLLMProvider,
  NullTTSProvider,
  NullSTTProvider,
  NullAvatarProvider,
} from './cloud/providers/nullProviders';
import { AnthropicLLMProvider } from './cloud/providers/anthropicLLM';
import { ExpoSpeechTTSProvider } from './cloud/providers/expoSpeechTTS';
import { ElevenLabsTTSProvider } from './cloud/providers/elevenLabsTTS';
import { ExpoSpeechSTTProvider } from './cloud/providers/expoSpeechSTT';
import {
  LLMProvider,
  TTSProvider,
  STTProvider,
  AvatarProvider,
} from './cloud/CloudBoundary.types';
import { isCloudOptIn, isVoiceEnabled } from './featureFlag';

export interface CompanionRuntime {
  cloudBoundary: CloudBoundary;
  // Concrete handles for features that don't fit the boundary
  // surface cleanly (STT runs against the mic, not a stream).
  stt: ExpoSpeechSTTProvider | null;
  ttsProvider: TTSProvider;
}

interface BootstrapOpts {
  anthropicApiKey?: string;
  elevenLabsApiKey?: string;
  elevenLabsVoicePresets?: {
    'en-IN'?: string;
    'hi-IN'?: string;
    'mr-IN'?: string;
    default?: string;
  };
  isDev?: boolean;
}

/**
 * Wire up providers and the boundary. Called once at app boot from
 * app/_layout.tsx — and once more when voice or cloud opt-in
 * changes (DadiScreen re-bootstraps in that case).
 *
 * Provider selection:
 *   - LLM: Anthropic if apiKey provided AND cloud opt-in; else Null.
 *   - TTS: ElevenLabs if apiKey + voice enabled; else expo-speech
 *          if voice enabled; else Null.
 *   - STT: expo-speech-recognition if voice enabled; else Null.
 *   - Avatar: Null (the in-app AvatarView handles its own animation).
 */
export function bootstrapCompanion(opts: BootstrapOpts = {}): CompanionRuntime {
  const nullLlm = new NullLLMProvider();

  let activeLlm: LLMProvider = nullLlm;
  if (opts.anthropicApiKey) {
    activeLlm = new AnthropicLLMProvider({ apiKey: opts.anthropicApiKey });
  }

  let tts: TTSProvider = new NullTTSProvider();
  if (isVoiceEnabled()) {
    if (opts.elevenLabsApiKey) {
      tts = new ElevenLabsTTSProvider({
        apiKey: opts.elevenLabsApiKey,
        voicePresets: opts.elevenLabsVoicePresets,
      });
    } else {
      tts = new ExpoSpeechTTSProvider();
    }
  }

  let sttProvider: ExpoSpeechSTTProvider | null = null;
  let stt: STTProvider = new NullSTTProvider();
  if (isVoiceEnabled()) {
    sttProvider = new ExpoSpeechSTTProvider();
    stt = sttProvider;
  }

  const avatar: AvatarProvider = new NullAvatarProvider();

  const cloudBoundary = new CloudBoundary({
    llm: activeLlm,
    fallbackLlm: nullLlm,
    tts,
    stt,
    avatar,
    optIn: isCloudOptIn,
    voiceEnabled: isVoiceEnabled,
    isDev: opts.isDev ?? false,
  });

  return { cloudBoundary, stt: sttProvider, ttsProvider: tts };
}
