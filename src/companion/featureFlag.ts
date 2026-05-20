import { useCompanionStore } from '../stores/useCompanionStore';

/**
 * Single source of truth for "is the companion enabled?" and
 * "may we hit the cloud?". Other modules read through these
 * functions rather than touching the store directly, so the
 * intent is greppable.
 */

export function isCloudOptIn(): boolean {
  return useCompanionStore.getState().cloudOptIn;
}

export function isVoiceEnabled(): boolean {
  return useCompanionStore.getState().voiceEnabled;
}

export function isCompanionEnabled(): boolean {
  // Feature flag: companion is always available as a feature; only
  // cloud features are gated. Voice/avatar follow cloudOptIn too.
  return true;
}
