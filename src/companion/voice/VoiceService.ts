import { CloudBoundary } from '../cloud/CloudBoundary';
import { AudioStream, VoiceId } from '../cloud/CloudBoundary.types';
import { isVoiceEnabled } from '../featureFlag';

/**
 * Facade over the TTS provider. Delegates entirely to the
 * CloudBoundary so the only file with TTS SDK imports remains
 * cloud/providers/.
 */
export class VoiceService {
  constructor(private boundary: CloudBoundary) {}

  async speak(text: string, voice: VoiceId = 'dadi-default'): Promise<AudioStream> {
    if (!isVoiceEnabled()) return { uri: '', durationMs: 0 };
    return this.boundary.speak(text, voice);
  }
}
