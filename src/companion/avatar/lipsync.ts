/**
 * Cheap lip-sync driver. Maps an audio amplitude stream to mouth
 * openness values 0-1. Production lip-sync uses visemes; this is
 * the "good enough until M3 hits the demo" amplitude approach.
 */

export interface AmplitudeSample {
  tMs: number;
  amplitude: number; // 0-1
}

export interface MouthFrame {
  tMs: number;
  openness: number; // 0-1
}

export function amplitudeToFrames(
  samples: AmplitudeSample[],
  smoothing = 0.4
): MouthFrame[] {
  let prev = 0;
  return samples.map(({ tMs, amplitude }) => {
    const openness = smoothing * prev + (1 - smoothing) * clamp01(amplitude);
    prev = openness;
    return { tMs, openness };
  });
}

function clamp01(v: number): number {
  if (v < 0) return 0;
  if (v > 1) return 1;
  return v;
}
