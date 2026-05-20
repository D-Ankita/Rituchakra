import { useEffect, useRef, useState } from 'react';

/**
 * Amplitude driver for the avatar mouth.
 *
 * Two modes:
 *   - `start(durationMs)` runs a smoothed sinusoid for a fixed
 *     duration. Used when the provider exposes no per-word timing
 *     (Android expo-speech, all fallbacks).
 *   - `pulseWord()` triggers a single decaying spike. Call this
 *     from a TTS provider's onBoundary callback to get word-aligned
 *     mouth motion (iOS expo-speech, ElevenLabs alignment data).
 */
export interface AmplitudePulse {
  amplitude: number;
  isSpeaking: boolean;
  start: (durationMs: number) => void;
  pulseWord: () => void;
  stop: () => void;
}

export function useAmplitudePulse(): AmplitudePulse {
  const [amplitude, setAmplitude] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<number>(0);
  const durationRef = useRef<number>(0);
  const wordSpikeUntilRef = useRef<number>(0);
  const wordSpikeStartRef = useRef<number>(0);

  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setAmplitude(0);
    setIsSpeaking(false);
    wordSpikeUntilRef.current = 0;
  };

  const start = (durationMs: number) => {
    stop();
    startedAtRef.current = Date.now();
    durationRef.current = durationMs;
    setIsSpeaking(true);
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startedAtRef.current;
      if (elapsed >= durationRef.current && wordSpikeUntilRef.current < now) {
        stop();
        return;
      }

      // Sinusoidal base
      const t = elapsed / 1000;
      const base =
        0.4 * Math.abs(Math.sin(t * 8)) + 0.4 * Math.abs(Math.sin(t * 13 + 1));

      // Word spike — sharp rise + decay over ~200ms
      let spike = 0;
      if (now < wordSpikeUntilRef.current) {
        const spikeAge = (now - wordSpikeStartRef.current) / 200;
        spike = Math.max(0, 1 - spikeAge) * 0.6;
      }

      setAmplitude(Math.min(1, base + spike));
    }, 50);
  };

  const pulseWord = () => {
    const now = Date.now();
    wordSpikeStartRef.current = now;
    wordSpikeUntilRef.current = now + 200;
    if (!intervalRef.current) {
      // If no fixed-duration animation is running, start a short
      // word-only one — 800ms is long enough for the spike to decay.
      start(800);
    } else {
      // Extend the speaking window — words keep coming.
      durationRef.current = Math.max(
        durationRef.current,
        now - startedAtRef.current + 500
      );
    }
  };

  useEffect(() => () => stop(), []);

  return { amplitude, isSpeaking, start, pulseWord, stop };
}
