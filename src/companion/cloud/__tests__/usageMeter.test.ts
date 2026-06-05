jest.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map<string, string>();
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async (k: string) => store.get(k) ?? null),
      setItem: jest.fn(async (k: string, v: string) => {
        store.set(k, v);
      }),
      removeItem: jest.fn(async (k: string) => {
        store.delete(k);
      }),
    },
  };
});

import {
  loadUsage,
  incrementCount,
  isOverCap,
  resetUsage,
  getCount,
} from '../usageMeter';

beforeEach(async () => {
  await resetUsage();
});

describe('usageMeter', () => {
  it('starts empty', async () => {
    const u = await loadUsage();
    expect(u.counts).toEqual({});
  });

  it('increments per provider', async () => {
    await incrementCount('anthropic-claude');
    await incrementCount('anthropic-claude');
    await incrementCount('openai-gpt');
    expect(await getCount('anthropic-claude')).toBe(2);
    expect(await getCount('openai-gpt')).toBe(1);
  });

  it('reports over-cap correctly', async () => {
    for (let i = 0; i < 50; i++) await incrementCount('anthropic-claude');
    expect(await isOverCap('anthropic-claude', { perProviderPerDay: 50 })).toBe(true);
    expect(await isOverCap('anthropic-claude', { perProviderPerDay: 100 })).toBe(false);
  });

  it('local providers are always under cap', async () => {
    for (let i = 0; i < 1000; i++) await incrementCount('null-llm');
    // null-llm is never over cap by definition
    expect(await isOverCap('null-llm')).toBe(false);
    expect(await isOverCap('offline-template')).toBe(false);
  });

  it('resetUsage clears state', async () => {
    await incrementCount('anthropic-claude');
    await resetUsage();
    expect(await getCount('anthropic-claude')).toBe(0);
  });
});
