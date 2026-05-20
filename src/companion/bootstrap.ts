import { CloudBoundary } from './cloud/CloudBoundary';
import {
  NullLLMProvider,
  NullTTSProvider,
  NullSTTProvider,
  NullAvatarProvider,
} from './cloud/providers/nullProviders';
import { AnthropicLLMProvider } from './cloud/providers/anthropicLLM';
import { ExpoSpeechTTSProvider } from './cloud/providers/expoSpeechTTS';
import { LLMProvider, TTSProvider, STTProvider, AvatarProvider } from './cloud/CloudBoundary.types';
import { isCloudOptIn, isVoiceEnabled } from './featureFlag';

export interface CompanionRuntime {
  cloudBoundary: CloudBoundary;
}

interface BootstrapOpts {
  anthropicApiKey?: string;
  isDev?: boolean;
}

/**
 * Wire up providers and the boundary. Called once at app boot from
 * app/_layout.tsx. The defaults are the Null providers — only when
 * an API key is present AND opt-in is true does the boundary route
 * to a real LLM.
 *
 * Voice TTS uses expo-speech (on-device, no key) when voiceEnabled
 * is true. STT/Avatar remain null providers until a real impl ships.
 */
export function bootstrapCompanion(opts: BootstrapOpts = {}): CompanionRuntime {
  const nullLlm = new NullLLMProvider();

  let activeLlm: LLMProvider = nullLlm;
  if (opts.anthropicApiKey) {
    activeLlm = new AnthropicLLMProvider({ apiKey: opts.anthropicApiKey });
  }

  const tts: TTSProvider = isVoiceEnabled()
    ? new ExpoSpeechTTSProvider()
    : new NullTTSProvider();
  const stt: STTProvider = new NullSTTProvider();
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

  return { cloudBoundary };
}
