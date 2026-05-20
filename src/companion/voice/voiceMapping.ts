import { CompanionLanguage } from '../../stores/useCompanionStore';
import { VoiceId } from '../cloud/CloudBoundary.types';

/**
 * Map the user's selected language to a voice id. The TTS provider
 * interprets the voice id — for expo-speech, the id is treated as a
 * BCP-47 language tag prefix; for ElevenLabs, this maps to a curated
 * voice library (future).
 */
export function voiceIdForLanguage(language: CompanionLanguage): VoiceId {
  switch (language) {
    case 'hi':
    case 'hi-en':
      return 'hi-IN';
    case 'mr':
    case 'mr-en':
      return 'mr-IN';
    default:
      return 'en-IN';
  }
}
