import { CloudBoundary } from '../cloud/CloudBoundary';
import { AudioStream } from '../cloud/CloudBoundary.types';

/**
 * Wraps audio-to-text transcription. v1 prefers device-native STT
 * (Expo APIs once added); this is the cloud-provider path used as
 * fallback or for languages the device doesn't support well.
 */
export class SpeechInput {
  constructor(private boundary: CloudBoundary) {}

  async transcribe(audio: AudioStream): Promise<string> {
    return this.boundary.listen(audio);
  }
}
