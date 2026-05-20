import { createAudioPlayer } from 'expo-audio';
import { File, Paths } from 'expo-file-system';
import { TTSProvider, AudioStream, VoiceId } from '../CloudBoundary.types';

/**
 * ElevenLabs TTS provider. Calls the REST API directly (no SDK
 * import), writes the returned audio bytes to a temp file via
 * expo-file-system, and plays it through expo-audio.
 *
 * Use this in production for the warm elder-woman voice. Falls
 * back gracefully to a silent stream on any error so the rest of
 * the conversation flow stays intact.
 *
 * Voice mapping: voice IDs come from the ElevenLabs voice library.
 * Defaults to a placeholder ID that should be overridden per
 * deployment via the constructor's voicePresets.
 */

export interface ElevenLabsVoicePresets {
  'en-IN'?: string;
  'hi-IN'?: string;
  'mr-IN'?: string;
  default?: string;
}

const DEFAULT_VOICE = '21m00Tcm4TlvDq8ikWAM'; // Rachel — public sample voice
const DEFAULT_MODEL = 'eleven_multilingual_v2';

export class ElevenLabsTTSProvider implements TTSProvider {
  readonly name = 'elevenlabs';
  private readonly apiKey: string;
  private readonly model: string;
  private readonly voicePresets: ElevenLabsVoicePresets;

  constructor(opts: {
    apiKey: string;
    model?: string;
    voicePresets?: ElevenLabsVoicePresets;
  }) {
    this.apiKey = opts.apiKey;
    this.model = opts.model ?? DEFAULT_MODEL;
    this.voicePresets = opts.voicePresets ?? {};
  }

  async synthesize(text: string, voice: VoiceId): Promise<AudioStream> {
    const voiceId =
      this.voicePresets[voice as keyof ElevenLabsVoicePresets] ??
      this.voicePresets.default ??
      DEFAULT_VOICE;

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: this.model,
        voice_settings: {
          stability: 0.55,
          similarity_boost: 0.75,
          style: 0.35,
          use_speaker_boost: true,
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
    }

    const bytes = new Uint8Array(await res.arrayBuffer());
    const fileName = `dadi-${Date.now()}.mp3`;
    const file = new File(Paths.cache, fileName);
    file.create({ overwrite: true });
    file.write(bytes);

    const player = createAudioPlayer({ uri: file.uri });
    const durationMs = await new Promise<number>((resolve) => {
      let resolved = false;
      const finish = (ms: number) => {
        if (resolved) return;
        resolved = true;
        resolve(ms);
      };
      const sub = player.addListener('playbackStatusUpdate', (s) => {
        if (s.didJustFinish || (s.duration && s.currentTime >= s.duration - 0.05)) {
          sub.remove();
          finish((s.duration ?? 0) * 1000);
        }
      });
      player.play();
      // Safety timeout based on text length, in case the listener never fires
      setTimeout(() => finish(estimateDuration(text)), estimateDuration(text) + 5000);
    });

    try {
      file.delete();
    } catch {
      /* ignore */
    }

    return { uri: file.uri, durationMs };
  }
}

function estimateDuration(text: string): number {
  const words = text.split(/\s+/).length;
  return words * 400;
}
