import { CloudBoundary } from './cloud/CloudBoundary';
import {
  NullLLMProvider,
  NullTTSProvider,
  NullSTTProvider,
  NullAvatarProvider,
} from './cloud/providers/nullProviders';
import { AnthropicLLMProvider } from './cloud/providers/anthropicLLM';
import { OpenAILLMProvider } from './cloud/providers/openAILLM';
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

export type LLMChoice = 'auto' | 'anthropic' | 'openai' | 'none';

export interface CompanionRuntime {
  cloudBoundary: CloudBoundary;
  stt: ExpoSpeechSTTProvider | null;
  ttsProvider: TTSProvider;
  llmName: string;
}

interface BootstrapOpts {
  anthropicApiKey?: string | null;
  openAIApiKey?: string | null;
  elevenLabsApiKey?: string | null;
  elevenLabsVoicePresets?: {
    'en-IN'?: string;
    'hi-IN'?: string;
    'mr-IN'?: string;
    default?: string;
  };
  llmChoice?: LLMChoice;
  dailyLLMCap?: number;
  isDev?: boolean;
}

/**
 * Wire up providers and the boundary.
 *
 * Provider selection priority:
 *   - LLM: explicit llmChoice wins; otherwise Anthropic if its key
 *     is present, else OpenAI, else Null.
 *   - TTS: ElevenLabs if its key is present AND voice enabled;
 *     else expo-speech if voice enabled; else Null.
 *   - STT: expo-speech-recognition if voice enabled; else Null.
 *   - Avatar: Null (in-app AvatarView handles its own animation).
 */
export function bootstrapCompanion(opts: BootstrapOpts = {}): CompanionRuntime {
  const nullLlm = new NullLLMProvider();

  const choice = opts.llmChoice ?? 'auto';
  let activeLlm: LLMProvider = nullLlm;
  let llmName = nullLlm.name;
  if (choice !== 'none') {
    const useAnthropic =
      (choice === 'anthropic' || choice === 'auto') && !!opts.anthropicApiKey;
    const useOpenAI =
      (choice === 'openai' || (choice === 'auto' && !useAnthropic)) && !!opts.openAIApiKey;
    if (useAnthropic) {
      activeLlm = new AnthropicLLMProvider({ apiKey: opts.anthropicApiKey! });
      llmName = activeLlm.name;
    } else if (useOpenAI) {
      activeLlm = new OpenAILLMProvider({ apiKey: opts.openAIApiKey! });
      llmName = activeLlm.name;
    }
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
    usageLimits: opts.dailyLLMCap ? { perProviderPerDay: opts.dailyLLMCap } : undefined,
    isDev: opts.isDev ?? false,
  });

  return { cloudBoundary, stt: sttProvider, ttsProvider: tts, llmName };
}
