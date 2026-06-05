/**
 * Bootstrap provider-selection logic. We can't easily exercise the
 * Anthropic/OpenAI providers without a real key — but we can prove
 * the selection rules pick the right provider.name based on inputs.
 *
 * Mocks native modules that the providers transitively pull in.
 */

jest.mock('expo-speech-recognition', () => ({
  ExpoSpeechRecognitionModule: {
    requestPermissionsAsync: jest.fn(async () => ({ granted: false })),
    addListener: jest.fn(() => ({ remove: () => {} })),
    start: jest.fn(),
    stop: jest.fn(),
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map<string, string>();
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async (k: string) => store.get(k) ?? null),
      setItem: jest.fn(async (k: string, v: string) => {
        store.set(k, v);
      }),
      removeItem: jest.fn(async (k: string) => {
        store.delete(k);
      }),
      clear: jest.fn(async () => store.clear()),
    },
  };
});

import { bootstrapCompanion } from '../bootstrap';
import { useCompanionStore } from '../../stores/useCompanionStore';

beforeEach(() => {
  useCompanionStore.getState().reset();
});

describe('bootstrapCompanion', () => {
  it('falls back to null-llm when no keys are provided', () => {
    const rt = bootstrapCompanion();
    expect(rt.llmName).toBe('null-llm');
  });

  it('picks anthropic when only anthropic key is given', () => {
    const rt = bootstrapCompanion({ anthropicApiKey: 'k' });
    expect(rt.llmName).toBe('anthropic-claude');
  });

  it('picks openai when only openai key is given', () => {
    const rt = bootstrapCompanion({ openAIApiKey: 'k' });
    expect(rt.llmName).toBe('openai-gpt');
  });

  it('llmChoice=anthropic forces anthropic even if both keys are present', () => {
    const rt = bootstrapCompanion({
      anthropicApiKey: 'a',
      openAIApiKey: 'o',
      llmChoice: 'anthropic',
    });
    expect(rt.llmName).toBe('anthropic-claude');
  });

  it('llmChoice=openai forces openai even if both keys are present', () => {
    const rt = bootstrapCompanion({
      anthropicApiKey: 'a',
      openAIApiKey: 'o',
      llmChoice: 'openai',
    });
    expect(rt.llmName).toBe('openai-gpt');
  });

  it('llmChoice=none ignores all keys', () => {
    const rt = bootstrapCompanion({
      anthropicApiKey: 'a',
      openAIApiKey: 'o',
      llmChoice: 'none',
    });
    expect(rt.llmName).toBe('null-llm');
  });

  it('voiceEnabled false → null TTS even with elevenLabs key', () => {
    const rt = bootstrapCompanion({ elevenLabsApiKey: 'k' });
    expect(rt.ttsProvider.name).toBe('null-tts');
  });

  it('voiceEnabled true → expo-speech when no elevenlabs key', () => {
    useCompanionStore.getState().setVoiceEnabled(true);
    const rt = bootstrapCompanion();
    expect(rt.ttsProvider.name).toBe('expo-speech');
  });

  it('voiceEnabled true + elevenlabs key → elevenlabs', () => {
    useCompanionStore.getState().setVoiceEnabled(true);
    const rt = bootstrapCompanion({ elevenLabsApiKey: 'k' });
    expect(rt.ttsProvider.name).toBe('elevenlabs');
  });
});
