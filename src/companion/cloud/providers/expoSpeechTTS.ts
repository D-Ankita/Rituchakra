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
 * expo-speech emits onBoundary callbacks at word transitions on
 * iOS — we expose those to the caller so the avatar can pulse on
 * word boundaries instead of a fixed sine wave. Android fakes it
 * by emitting a single onStart and onDone, so the amplitude hook's
 * sinusoid stays the fallback there.
 */

export interface SpeakWithCallbacksOpts {
  onWord?: (word: string) => void;
  onStart?: () => void;
  onDone?: () => void;
}

export class ExpoSpeechTTSProvider implements TTSProvider {
  readonly name = 'expo-speech';
  private active = false;

  async synthesize(text: string, voice: VoiceId): Promise<AudioStream> {
    return this.speakWithCallbacks(text, voice, {});
  }

  async speakWithCallbacks(
    text: string,
    voice: VoiceId,
    cb: SpeakWithCallbacksOpts
  ): Promise<AudioStream> {
    return new Promise<AudioStream>((resolve) => {
      const language = voiceToLanguage(voice);
      const started = Date.now();
      this.active = true;

      Speech.speak(text, {
        language,
        rate: 0.92,
        pitch: 1.02,
        onStart: () => cb.onStart?.(),
        onBoundary: ((e: { charIndex: number; charLength: number }) => {
          // Slice the spoken word from the input text using the
          // event's charIndex + charLength fields (iOS / Android).
          if (typeof e.charIndex === 'number') {
            const word = text.slice(
              e.charIndex,
              e.charIndex + (e.charLength ?? 1)
            );
            if (word.trim()) cb.onWord?.(word);
          }
        }) as Speech.SpeechOptions['onBoundary'],
        onDone: () => {
          this.active = false;
          cb.onDone?.();
          resolve({ uri: '', durationMs: Date.now() - started });
        },
        onError: () => {
          this.active = false;
          resolve({ uri: '', durationMs: 0 });
        },
        onStopped: () => {
          this.active = false;
          resolve({ uri: '', durationMs: Date.now() - started });
        },
      });
    });
  }

  async stop(): Promise<void> {
    await Speech.stop();
    this.active = false;
  }

  isActive(): boolean {
    return this.active;
  }
}

function voiceToLanguage(voice: VoiceId): string {
  if (voice.startsWith('hi')) return 'hi-IN';
  if (voice.startsWith('mr')) return 'mr-IN';
  return 'en-IN';
}
