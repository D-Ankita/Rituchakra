import { CompanionLanguage } from '../../stores/useCompanionStore';

export interface LanguageProfile {
  language: CompanionLanguage;
  region: string | null;
  codeSwitch: boolean;
  greeting: string;
}

const GREETINGS: Record<CompanionLanguage, string> = {
  en: 'Hello',
  hi: 'Namaste',
  mr: 'Namaskar',
  'hi-en': 'Namaste',
  'mr-en': 'Namaskar',
};

export function buildLanguageProfile(
  language: CompanionLanguage,
  region: string | null
): LanguageProfile {
  return {
    language,
    region,
    codeSwitch: language === 'hi-en' || language === 'mr-en',
    greeting: GREETINGS[language],
  };
}

export function describeLanguageForPrompt(p: LanguageProfile): string {
  if (p.codeSwitch) {
    return `Respond in natural ${p.language === 'hi-en' ? 'Hinglish' : 'Marathi-English'} code-switching, the way an Indian elder woman speaks to family. Keep English fragments for technical words and code-switch fluidly. Never write in pure Devanagari unless the user does first.`;
  }
  if (p.language === 'hi') return 'Respond in Hindi using Devanagari script.';
  if (p.language === 'mr') return 'Respond in Marathi using Devanagari script.';
  return 'Respond in warm, conversational English.';
}
