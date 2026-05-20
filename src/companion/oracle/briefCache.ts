import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'rituchakra-companion-brief-cache';

export interface CachedBrief {
  text: string;
  generatedAt: number;
  isFallback: boolean;
}

export async function getCachedBrief(): Promise<CachedBrief | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.text !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function setCachedBrief(brief: CachedBrief): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(brief));
  } catch {
    /* ignore */
  }
}

export async function clearCachedBrief(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
