import * as Speech from 'expo-speech';
import {
  TTSProvider,
  AudioStream,
  VoiceId,
} from '../CloudBoundary.types';

/**
 * On-device TTS using expo-speech. No API key, no network call,
 * works offline. Lower fidelity than ElevenLabs but ships TODAY.
 *
 * "AudioStream" is conceptual here — expo-speech doesn't expose an
 * audio file, so we return an empty stream and rely on the speak()
 * side effect. The DadiScreen uses the speaking callbacks to drive
 * the avatar animation.
 */

export interface ExpoSpeechOptions {
  language?: string;
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onDone?: () => void;
  onError?: () => void;
}

export class ExpoSpeechTTSProvider implements TTSProvider {
  readonly name = 'expo-speech';
  private currentUtterance: string | null = null;

  async synthesize(text: string, voice: VoiceId): Promise<AudioStream> {
    return new Promise<AudioStream>((resolve) => {
      this.currentUtterance = text;
      const language = voiceToLanguage(voice);
      Speech.speak(text, {
        language,
        rate: 0.92,
        pitch: 1.02,
        onDone: () => {
          this.currentUtterance = null;
          resolve({ uri: '', durationMs: estimateDuration(text) });
        },
        onError: () => {
          this.currentUtterance = null;
          resolve({ uri: '', durationMs: 0 });
        },
        onStopped: () => {
          this.currentUtterance = null;
          resolve({ uri: '', durationMs: 0 });
        },
      });
    });
  }

  async stop(): Promise<void> {
    await Speech.stop();
    this.currentUtterance = null;
  }
}

function voiceToLanguage(voice: VoiceId): string {
  if (voice.startsWith('hi')) return 'hi-IN';
  if (voice.startsWith('mr')) return 'mr-IN';
  return 'en-IN';
}

function estimateDuration(text: string): number {
  // ~150 words per minute → 400ms per word
  const words = text.split(/\s+/).length;
  return words * 400;
}
