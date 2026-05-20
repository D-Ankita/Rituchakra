import { useEffect, useRef, useState } from 'react';

/**
 * Simulated amplitude for the avatar mouth while expo-speech is
 * playing. expo-speech doesn't expose audio amplitude, so we drive
 * a smooth sinusoidal pulse for the duration of an estimated
 * utterance.
 *
 * Returns amplitude 0-1 and a flag for whether we are "speaking."
 */
export interface AmplitudePulse {
  amplitude: number;
  isSpeaking: boolean;
  start: (durationMs: number) => void;
  stop: () => void;
}

export function useAmplitudePulse(): AmplitudePulse {
  const [amplitude, setAmplitude] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<number>(0);
  const durationRef = useRef<number>(0);

  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setAmplitude(0);
    setIsSpeaking(false);
  };

  const start = (durationMs: number) => {
    stop();
    startedAtRef.current = Date.now();
    durationRef.current = durationMs;
    setIsSpeaking(true);
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startedAtRef.current;
      if (elapsed >= durationRef.current) {
        stop();
        return;
      }
      // Two overlaid sinusoids give it a more natural "talking" feel
      // than a single sine wave.
      const t = elapsed / 1000;
      const a =
        0.5 * Math.abs(Math.sin(t * 8)) + 0.5 * Math.abs(Math.sin(t * 13 + 1));
      setAmplitude(Math.min(1, a));
    }, 60);
  };

  useEffect(() => () => stop(), []);

  return { amplitude, isSpeaking, start, stop };
}
