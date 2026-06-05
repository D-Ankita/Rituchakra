import {
  LLMProvider,
  LLMRequest,
  LLMResponse,
  SafetyFlag,
} from '../CloudBoundary.types';

/**
 * OpenAI (ChatGPT) provider. Lazy-loads the `openai` SDK so it's
 * only pulled into the bundle when the user has opted in. Drop-in
 * alternative to AnthropicLLMProvider.
 */
export class OpenAILLMProvider implements LLMProvider {
  readonly name = 'openai-gpt';
  private readonly model: string;
  private readonly apiKey: string;
  private readonly maxTokens: number;

  constructor(opts: { apiKey: string; model?: string; maxTokens?: number }) {
    this.apiKey = opts.apiKey;
    this.model = opts.model ?? 'gpt-4o-mini';
    this.maxTokens = opts.maxTokens ?? 600;
  }

  async generate(req: LLMRequest): Promise<LLMResponse> {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const OpenAI = require('openai').default;
    const client = new OpenAI({ apiKey: this.apiKey });

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: req.systemPrompt },
    ];
    for (const turn of req.history ?? []) {
      messages.push({ role: turn.role, content: turn.text });
    }
    const userText = [
      `Context packet (derived summaries — no raw history):\n${JSON.stringify(
        req.packet,
        null,
        2
      )}`,
      req.userTurn ? `User: ${req.userTurn}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');
    messages.push({ role: 'user', content: userText });

    const res = await client.chat.completions.create({
      model: this.model,
      max_tokens: this.maxTokens,
      messages,
    });

    const text = res.choices?.[0]?.message?.content?.trim() ?? '';
    const safetyFlags: SafetyFlag[] = [];
    if (res.choices?.[0]?.finish_reason === 'content_filter') {
      safetyFlags.push('low_confidence_refused');
    }

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
  const re = /\[slug:([a-z0-9-]+)\]/gi;
  const slugs: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) slugs.push(m[1]);
  return slugs;
}
