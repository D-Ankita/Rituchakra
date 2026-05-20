import { CloudBoundary } from './cloud/CloudBoundary';
import {
  NullLLMProvider,
  NullTTSProvider,
  NullSTTProvider,
  NullAvatarProvider,
} from './cloud/providers/nullProviders';
import { AnthropicLLMProvider } from './cloud/providers/anthropicLLM';
import { LLMProvider, TTSProvider, STTProvider, AvatarProvider } from './cloud/CloudBoundary.types';
import { isCloudOptIn } from './featureFlag';

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
 */
export function bootstrapCompanion(opts: BootstrapOpts = {}): CompanionRuntime {
  const nullLlm = new NullLLMProvider();

  let activeLlm: LLMProvider = nullLlm;
  if (opts.anthropicApiKey) {
    activeLlm = new AnthropicLLMProvider({ apiKey: opts.anthropicApiKey });
  }

  const tts: TTSProvider = new NullTTSProvider();
  const stt: STTProvider = new NullSTTProvider();
  const avatar: AvatarProvider = new NullAvatarProvider();

  const cloudBoundary = new CloudBoundary({
    llm: activeLlm,
    fallbackLlm: nullLlm,
    tts,
    stt,
    avatar,
    optIn: isCloudOptIn,
    isDev: opts.isDev ?? false,
  });

  return { cloudBoundary };
}
