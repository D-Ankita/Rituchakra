import {
  LLMProvider,
  LLMRequest,
  LLMResponse,
  SafetyFlag,
} from '../CloudBoundary.types';

/**
 * Claude provider. Lazy-loads @anthropic-ai/sdk so the SDK is only
 * pulled into the bundle if the user has opted in to cloud features.
 *
 * Model ID and API key are injected at construction time — neither
 * is hardcoded here. The provider does NOT redact; redaction is the
 * caller's responsibility (CloudBoundary always redacts before
 * calling this).
 */
export class AnthropicLLMProvider implements LLMProvider {
  readonly name = 'anthropic-claude';
  private readonly model: string;
  private readonly apiKey: string;
  private readonly maxTokens: number;

  constructor(opts: { apiKey: string; model?: string; maxTokens?: number }) {
    this.apiKey = opts.apiKey;
    this.model = opts.model ?? 'claude-sonnet-4-6';
    this.maxTokens = opts.maxTokens ?? 600;
  }

  async generate(req: LLMRequest): Promise<LLMResponse> {
    // Lazy import — keeps SDK out of bundles where opt-in is off.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Anthropic = require('@anthropic-ai/sdk').default;
    const client = new Anthropic({ apiKey: this.apiKey });

    const userParts: Array<{ type: 'text'; text: string }> = [];
    userParts.push({
      type: 'text',
      text: `Context packet (derived summaries — no raw history):\n${JSON.stringify(
        req.packet,
        null,
        2
      )}`,
    });
    if (req.userTurn) {
      userParts.push({ type: 'text', text: `User: ${req.userTurn}` });
    }

    const messages: Array<{ role: 'user' | 'assistant'; content: any }> = [];
    for (const turn of req.history ?? []) {
      messages.push({ role: turn.role, content: turn.text });
    }
    messages.push({ role: 'user', content: userParts });

    const res = await client.messages.create({
      model: this.model,
      max_tokens: this.maxTokens,
      system: req.systemPrompt,
      messages,
    });

    const text =
      res.content
        .filter((c: any) => c.type === 'text')
        .map((c: any) => c.text)
        .join('\n')
        .trim() || '';

    const safetyFlags: SafetyFlag[] = [];
    if (res.stop_reason === 'refusal') safetyFlags.push('low_confidence_refused');

    return {
      text,
      citations: extractCitationSlugs(text),
      safetyFlags,
      providerUsed: this.name,
      isFallback: false,
    };
  }
}

function extractCitationSlugs(text: string): string[] {
  // Citations are emitted as [slug:foo-bar] by the persona prompt.
  const re = /\[slug:([a-z0-9-]+)\]/gi;
  const slugs: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) slugs.push(m[1]);
  return slugs;
}
