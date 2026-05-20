import { CloudBoundary } from '../CloudBoundary';
import { NullLLMProvider, NullTTSProvider, NullSTTProvider, NullAvatarProvider } from '../providers/nullProviders';
import { LLMProvider, LLMRequest, LLMResponse } from '../CloudBoundary.types';
import { ContextPacket } from '../../context/ContextPacket';

function packet(over: Partial<ContextPacket> = {}): ContextPacket {
  return {
    cycleDay: 10,
    cycleLength: 28,
    phase: 'follicular',
    predictionConfidence: 'moderate',
    patterns: [],
    screening: null,
    cultural: null,
    behavior: null,
    language: 'en',
    personaName: 'Dadi',
    addressAs: 'beta',
    memorySnippets: [],
    ...over,
  };
}

class SpyLLM implements LLMProvider {
  readonly name = 'spy-llm';
  public lastReq: LLMRequest | null = null;
  public calls = 0;
  async generate(req: LLMRequest): Promise<LLMResponse> {
    this.calls++;
    this.lastReq = req;
    return {
      text: 'hello',
      citations: [],
      safetyFlags: [],
      providerUsed: this.name,
      isFallback: false,
    };
  }
}

class FailingLLM implements LLMProvider {
  readonly name = 'failing-llm';
  async generate(): Promise<LLMResponse> {
    throw new Error('network down');
  }
}

describe('CloudBoundary', () => {
  it('routes to fallback when opt-in is off and never calls the real provider', async () => {
    const spy = new SpyLLM();
    const fallback = new NullLLMProvider();
    const boundary = new CloudBoundary({
      llm: spy,
      fallbackLlm: fallback,
      tts: new NullTTSProvider(),
      stt: new NullSTTProvider(),
      avatar: new NullAvatarProvider(),
      optIn: () => false,
      isDev: true,
    });

    const res = await boundary.ask({ systemPrompt: 'p', packet: packet() });
    expect(spy.calls).toBe(0);
    expect(res.isFallback).toBe(true);
    expect(res.providerUsed).toBe('null-llm');
  });

  it('routes to real provider when opt-in is on, passing a redacted packet', async () => {
    const spy = new SpyLLM();
    const boundary = new CloudBoundary({
      llm: spy,
      fallbackLlm: new NullLLMProvider(),
      tts: new NullTTSProvider(),
      stt: new NullSTTProvider(),
      avatar: new NullAvatarProvider(),
      optIn: () => true,
      isDev: true,
    });

    const res = await boundary.ask({
      systemPrompt: 'p',
      packet: packet({ addressAs: 'me@example.com' }),
    });

    expect(spy.calls).toBe(1);
    expect(spy.lastReq!.packet.addressAs).toContain('{email}');
    expect(res.providerUsed).toBe('spy-llm');
  });

  it('falls back gracefully when the real provider throws', async () => {
    const boundary = new CloudBoundary({
      llm: new FailingLLM(),
      fallbackLlm: new NullLLMProvider(),
      tts: new NullTTSProvider(),
      stt: new NullSTTProvider(),
      avatar: new NullAvatarProvider(),
      optIn: () => true,
      isDev: false,
    });

    const res = await boundary.ask({ systemPrompt: 'p', packet: packet() });
    expect(res.isFallback).toBe(true);
    expect(res.providerUsed).toBe('null-llm');
  });
});
