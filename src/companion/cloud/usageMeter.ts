import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Local, on-device usage counter per LLM provider per day. Prevents
 * a runaway loop from quietly draining the user's own API key.
 *
 * No network call; this is a pre-flight check before CloudBoundary
 * actually hits the provider. When the cap is hit, ask() returns
 * the offline fallback and surfaces that via the
 * `daily_limit_reached` flag.
 */

const KEY = 'rituchakra-usage-meter';

export interface UsageDay {
  date: string;          // YYYY-MM-DD local
  counts: Record<string, number>; // providerName -> count
}

export interface UsageLimits {
  perProviderPerDay: number;
}

export const DEFAULT_LIMITS: UsageLimits = {
  perProviderPerDay: 50,
};

function today(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export async function loadUsage(): Promise<UsageDay> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { date: today(), counts: {} };
    const parsed = JSON.parse(raw) as UsageDay;
    if (parsed.date !== today()) return { date: today(), counts: {} };
    return parsed;
  } catch {
    return { date: today(), counts: {} };
  }
}

export async function saveUsage(usage: UsageDay): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(usage));
  } catch {
    /* ignore */
  }
}

export async function getCount(providerName: string): Promise<number> {
  const u = await loadUsage();
  return u.counts[providerName] ?? 0;
}

export async function incrementCount(providerName: string): Promise<number> {
  const u = await loadUsage();
  const next = (u.counts[providerName] ?? 0) + 1;
  u.counts[providerName] = next;
  await saveUsage(u);
  return next;
}

export async function isOverCap(
  providerName: string,
  limits: UsageLimits = DEFAULT_LIMITS
): Promise<boolean> {
  // Local-only providers (null-llm, offline-template) are always free.
  if (providerName === 'null-llm' || providerName === 'offline-template') return false;
  const n = await getCount(providerName);
  return n >= limits.perProviderPerDay;
}

export async function resetUsage(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
