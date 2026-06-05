import * as SecureStore from 'expo-secure-store';

/**
 * Encrypted storage for provider API keys. Backed by the OS
 * keychain (iOS) / EncryptedSharedPreferences (Android). Never
 * persisted to AsyncStorage, never logged, never sent anywhere
 * except the provider it belongs to.
 *
 * Keys are wiped by the existing one-tap data wipe (see wipe.ts).
 */

export type ProviderKeyName =
  | 'anthropic'
  | 'openai'
  | 'elevenlabs'
  | 'elevenlabs-voice-en'
  | 'elevenlabs-voice-hi'
  | 'elevenlabs-voice-mr';

const PREFIX = 'dadi-key-';

function storageKey(name: ProviderKeyName): string {
  return PREFIX + name;
}

export async function setKey(name: ProviderKeyName, value: string): Promise<void> {
  await SecureStore.setItemAsync(storageKey(name), value, {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
  });
}

export async function getKey(name: ProviderKeyName): Promise<string | null> {
  try {
    const v = await SecureStore.getItemAsync(storageKey(name));
    return v && v.length > 0 ? v : null;
  } catch {
    return null;
  }
}

export async function clearKey(name: ProviderKeyName): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(storageKey(name));
  } catch {
    /* ignore */
  }
}

export async function clearAllKeys(): Promise<void> {
  const all: ProviderKeyName[] = [
    'anthropic',
    'openai',
    'elevenlabs',
    'elevenlabs-voice-en',
    'elevenlabs-voice-hi',
    'elevenlabs-voice-mr',
  ];
  await Promise.all(all.map(clearKey));
}
