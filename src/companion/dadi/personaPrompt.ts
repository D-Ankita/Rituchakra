import { renderPersonaPrompt, PERSONA_PROMPT_VERSION } from './personaPrompt.versions';
import { LanguageProfile, describeLanguageForPrompt } from '../culture/languageProfile';

export interface BuildPersonaInput {
  personaName: string;
  addressAs: string;
  language: LanguageProfile;
}

export function buildPersonaPrompt(input: BuildPersonaInput): {
  prompt: string;
  version: number;
} {
  return {
    prompt: renderPersonaPrompt({
      personaName: input.personaName,
      addressAs: input.addressAs,
      languageInstruction: describeLanguageForPrompt(input.language),
    }),
    version: PERSONA_PROMPT_VERSION,
  };
}
