import { redactString, redactPacket, redactRequest, assertNoIdentifiers } from '../redactor';
import { ContextPacket } from '../../context/ContextPacket';
import { LLMRequest } from '../CloudBoundary.types';

function blankPacket(overrides: Partial<ContextPacket> = {}): ContextPacket {
  return {
    cycleDay: 14,
    cycleLength: 28,
    phase: 'ovulation',
    predictionConfidence: 'high',
    patterns: [],
    screening: null,
    cultural: null,
    behavior: null,
    language: 'en',
    personaName: 'Dadi',
    addressAs: 'beta',
    memorySnippets: [],
    ...overrides,
  };
}

describe('redactString', () => {
  it('redacts email addresses', () => {
    const out = redactString('contact me at ankita.dodamani@example.com please');
    expect(out.text).not.toMatch(/ankita\.dodamani@example\.com/);
    expect(out.text).toContain('{email}');
    expect(out.removed).toContain('email');
  });

  it('redacts phone-shaped sequences (any token, as long as digits are gone)', () => {
    const out1 = redactString('call +91 98765 43210').text;
    expect(out1).not.toMatch(/9876543210|98765 43210/);
    expect(out1).toMatch(/\{phone\}|\{number\}/);

    const out2 = redactString('call 9876543210').text;
    expect(out2).not.toMatch(/9876543210/);

    const out3 = redactString('+1-555-867-5309').text;
    expect(out3).not.toMatch(/555-867-5309/);
  });

  it('redacts URLs', () => {
    expect(redactString('see https://example.com/my-page now').text).toContain('{url}');
  });

  it('redacts long numeric sequences (Aadhaar-shaped IDs)', () => {
    const out = redactString('id 123456789012').text;
    expect(out).not.toMatch(/123456789012/);
    expect(out).toMatch(/\{number\}|\{phone\}/);
  });

  it('redacts likely Indian address fragments', () => {
    const out = redactString('I live at 42 Lakshmi Nagar near the market');
    expect(out.text).toContain('{address}');
  });

  it('leaves benign text alone', () => {
    const text = 'I feel tired today and slept badly last night';
    expect(redactString(text).text).toBe(text);
  });
});

describe('redactPacket', () => {
  it('redacts identifiers inside pattern findings', () => {
    const p = blankPacket({
      patterns: [{ type: 'mood', finding: 'reach me at me@x.io daily', confidence: 'medium' }],
    });
    const { packet, report } = redactPacket(p);
    expect(packet.patterns[0].finding).toContain('{email}');
    expect(report.removed).toContain('email');
  });

  it('redacts identifiers inside memory snippet summaries and topics', () => {
    const p = blankPacket({
      memorySnippets: [
        {
          ageDays: 3,
          summary: 'mentioned visiting Dr. Sharma at https://clinic.example/',
          topics: ['call 9876543210'],
        },
      ],
    });
    const { packet } = redactPacket(p);
    expect(packet.memorySnippets[0].summary).toContain('{url}');
    expect(packet.memorySnippets[0].topics[0]).toMatch(/\{phone\}|\{number\}/);
    expect(packet.memorySnippets[0].topics[0]).not.toMatch(/9876543210/);
  });

  it('redacts identifiers inside screening reasons', () => {
    const p = blankPacket({
      screening: {
        signal: 'gentle',
        reasons: ['see info at https://something.test/x'],
        suggestSeeingDoctor: false,
      },
    });
    const { packet } = redactPacket(p);
    expect(packet.screening!.reasons[0]).toContain('{url}');
  });

  it('redacts identifiers inside addressAs', () => {
    const p = blankPacket({ addressAs: 'me@x.com' });
    const { packet } = redactPacket(p);
    expect(packet.addressAs).toContain('{email}');
  });
});

describe('redactRequest', () => {
  it('redacts userTurn and history alongside the packet', () => {
    const req: LLMRequest = {
      systemPrompt: 'persona prompt',
      packet: blankPacket(),
      userTurn: 'reach me at user@dom.in',
      history: [
        { role: 'user', text: 'old text with 9876543210' },
        { role: 'assistant', text: 'reply with https://x.io' },
      ],
    };
    const { request } = redactRequest(req);
    expect(request.userTurn).toContain('{email}');
    expect(request.history![0].text).toMatch(/\{phone\}|\{number\}/);
    expect(request.history![0].text).not.toMatch(/9876543210/);
    expect(request.history![1].text).toContain('{url}');
  });
});

describe('assertNoIdentifiers', () => {
  it('throws when an email survives by mistake', () => {
    const req: LLMRequest = {
      systemPrompt: '',
      packet: blankPacket({ addressAs: 'leak@oops.com' }),
    };
    expect(() => assertNoIdentifiers(req)).toThrow(/email survived/);
  });

  it('passes after redaction', () => {
    const req: LLMRequest = {
      systemPrompt: '',
      packet: blankPacket({ addressAs: 'leak@oops.com' }),
    };
    const { request } = redactRequest(req);
    expect(() => assertNoIdentifiers(request)).not.toThrow();
  });
});
