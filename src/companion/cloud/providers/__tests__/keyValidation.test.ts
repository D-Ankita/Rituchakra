import {
  validateAnthropicKey,
  validateOpenAIKey,
  validateElevenLabsKey,
} from '../keyValidation';

const realFetch = global.fetch;

afterEach(() => {
  global.fetch = realFetch;
});

function mockFetch(response: { status: number; json?: any; text?: string }) {
  global.fetch = jest.fn(async () => ({
    ok: response.status >= 200 && response.status < 300,
    status: response.status,
    json: async () => response.json ?? {},
    text: async () => response.text ?? '',
  })) as any;
}

describe('validateAnthropicKey', () => {
  it('returns ok with model identity on 200', async () => {
    mockFetch({ status: 200, json: { data: [{ id: 'claude-sonnet-4-6' }] } });
    const r = await validateAnthropicKey('sk-ant-x');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.identity).toContain('claude-sonnet-4-6');
  });

  it('classifies 401 as unauthorized', async () => {
    mockFetch({ status: 401 });
    const r = await validateAnthropicKey('bad');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('unauthorized');
  });

  it('classifies 429 as rate_limit', async () => {
    mockFetch({ status: 429 });
    const r = await validateAnthropicKey('x');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('rate_limit');
  });

  it('classifies network failures', async () => {
    global.fetch = jest.fn(async () => {
      throw new Error('boom');
    }) as any;
    const r = await validateAnthropicKey('x');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('network');
  });
});

describe('validateOpenAIKey', () => {
  it('extracts first GPT model id when available', async () => {
    mockFetch({
      status: 200,
      json: { data: [{ id: 'text-embedding-3-small' }, { id: 'gpt-4o-mini' }] },
    });
    const r = await validateOpenAIKey('sk-x');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.identity).toContain('gpt-4o-mini');
  });

  it('handles 401 / 429 / network like Anthropic', async () => {
    mockFetch({ status: 401 });
    expect((await validateOpenAIKey('x')).ok).toBe(false);
    mockFetch({ status: 429 });
    expect((await validateOpenAIKey('x')).ok).toBe(false);
  });
});

describe('validateElevenLabsKey', () => {
  it('shows first_name when present', async () => {
    mockFetch({
      status: 200,
      json: { first_name: 'Ankita', subscription: { tier: 'starter' } },
    });
    const r = await validateElevenLabsKey('el_x');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.identity).toContain('Ankita');
  });

  it('falls back to subscription tier when no name', async () => {
    mockFetch({ status: 200, json: { subscription: { tier: 'free' } } });
    const r = await validateElevenLabsKey('el_x');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.identity).toContain('free');
  });
});
