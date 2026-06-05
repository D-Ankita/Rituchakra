/**
 * Cheap connection tests that prove an API key is valid without
 * spending real tokens. Each provider has a free or near-free
 * endpoint we can ping:
 *
 *   - Anthropic: /v1/models (no token cost)
 *   - OpenAI: /v1/models (no token cost)
 *   - ElevenLabs: /v1/user (no token cost)
 *
 * Returns a tagged result so the UI can show either "Connected as
 * <account>" or the specific error.
 */

export type ValidationResult =
  | { ok: true; identity?: string }
  | { ok: false; reason: 'unauthorized' | 'network' | 'rate_limit' | 'unknown'; message: string };

export async function validateAnthropicKey(apiKey: string): Promise<ValidationResult> {
  try {
    const res = await fetch('https://api.anthropic.com/v1/models', {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
    });
    if (res.status === 401 || res.status === 403) {
      return { ok: false, reason: 'unauthorized', message: 'Invalid Anthropic API key.' };
    }
    if (res.status === 429) {
      return { ok: false, reason: 'rate_limit', message: 'Rate limited. Try again in a minute.' };
    }
    if (!res.ok) {
      return { ok: false, reason: 'unknown', message: `Anthropic ${res.status}` };
    }
    const data: any = await res.json();
    const firstModel = data?.data?.[0]?.id;
    return { ok: true, identity: firstModel ? `Anthropic · ${firstModel}` : 'Anthropic' };
  } catch (err) {
    return { ok: false, reason: 'network', message: 'Could not reach Anthropic.' };
  }
}

export async function validateOpenAIKey(apiKey: string): Promise<ValidationResult> {
  try {
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (res.status === 401 || res.status === 403) {
      return { ok: false, reason: 'unauthorized', message: 'Invalid OpenAI API key.' };
    }
    if (res.status === 429) {
      return { ok: false, reason: 'rate_limit', message: 'Rate limited. Try again in a minute.' };
    }
    if (!res.ok) {
      return { ok: false, reason: 'unknown', message: `OpenAI ${res.status}` };
    }
    const data: any = await res.json();
    const firstGpt = data?.data?.find((m: any) => /gpt/i.test(m.id))?.id;
    return { ok: true, identity: firstGpt ? `OpenAI · ${firstGpt}` : 'OpenAI' };
  } catch {
    return { ok: false, reason: 'network', message: 'Could not reach OpenAI.' };
  }
}

export async function validateElevenLabsKey(apiKey: string): Promise<ValidationResult> {
  try {
    const res = await fetch('https://api.elevenlabs.io/v1/user', {
      headers: { 'xi-api-key': apiKey },
    });
    if (res.status === 401 || res.status === 403) {
      return { ok: false, reason: 'unauthorized', message: 'Invalid ElevenLabs API key.' };
    }
    if (!res.ok) {
      return { ok: false, reason: 'unknown', message: `ElevenLabs ${res.status}` };
    }
    const data: any = await res.json();
    const tier = data?.subscription?.tier ?? 'free';
    const name = data?.first_name ? `ElevenLabs · ${data.first_name}` : `ElevenLabs · ${tier}`;
    return { ok: true, identity: name };
  } catch {
    return { ok: false, reason: 'network', message: 'Could not reach ElevenLabs.' };
  }
}
