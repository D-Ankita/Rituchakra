import {
  ExpoSpeechRecognitionModule,
  ExpoSpeechRecognitionResultEvent,
} from 'expo-speech-recognition';
import { STTProvider, AudioStream } from '../CloudBoundary.types';

/**
 * On-device STT via expo-speech-recognition. Uses native iOS Speech
 * framework and Android SpeechRecognizer — no cloud round-trip,
 * no API key.
 *
 * The STTProvider interface expects an AudioStream input, but
 * native speech recognition runs against the mic directly. We
 * expose a separate listen() method that the DadiScreen calls; the
 * transcribe() implementation is a no-op so the cloud boundary
 * interface stays satisfied.
 */
export class ExpoSpeechSTTProvider implements STTProvider {
  readonly name = 'expo-speech-recognition';

  async transcribe(_audio: AudioStream): Promise<string> {
    // Not used: we don't accept a pre-recorded stream. The
    // DadiScreen calls startListening / stopListening directly.
    return '';
  }

  async requestPermissions(): Promise<boolean> {
    const res = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    return res.granted;
  }

  async startListening(opts: {
    language?: string;
    onPartial?: (text: string) => void;
    onFinal: (text: string) => void;
    onError?: (err: string) => void;
  }): Promise<() => void> {
    let cancelled = false;

    const resultListener = ExpoSpeechRecognitionModule.addListener(
      'result',
      (event: ExpoSpeechRecognitionResultEvent) => {
        if (cancelled) return;
        const text = event.results?.[0]?.transcript ?? '';
        if (!text) return;
        if (event.isFinal) {
          opts.onFinal(text);
        } else {
          opts.onPartial?.(text);
        }
      }
    );

    const errorListener = ExpoSpeechRecognitionModule.addListener(
      'error',
      (event: { error: string; message: string }) => {
        if (cancelled) return;
        opts.onError?.(event.message || event.error);
      }
    );

    ExpoSpeechRecognitionModule.start({
      lang: opts.language ?? 'en-IN',
      interimResults: true,
      continuous: false,
      maxAlternatives: 1,
    });

    return () => {
      cancelled = true;
      try {
        ExpoSpeechRecognitionModule.stop();
      } catch {
        /* ignore */
      }
      resultListener.remove();
      errorListener.remove();
    };
  }

  async stop(): Promise<void> {
    try {
      ExpoSpeechRecognitionModule.stop();
    } catch {
      /* ignore */
    }
  }
}
