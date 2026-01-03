/**
 * Educational hormone curve estimation.
 * These are NOT medical data - they represent typical patterns
 * for visualization purposes only.
 */

export interface HormonePoint {
  day: number;
  estrogen: number; // 0-1
  progesterone: number; // 0-1
  energy: number; // 0-1
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function calculateEstrogen(
  day: number,
  cycleLength: number,
  ovDay: number
): number {
  if (day <= 5) {
    return 0.1 + (day / 5) * 0.1;
  }
  if (day <= ovDay) {
    const progress = (day - 5) / (ovDay - 5);
    return 0.2 + 0.7 * Math.pow(progress, 1.5);
  }
  if (day <= ovDay + 2) {
    return 0.9 - (day - ovDay) * 0.15;
  }
  // Luteal: secondary rise then fall
  const lutealProgress = (day - ovDay - 2) / (cycleLength - ovDay - 2);
  if (lutealProgress < 0.5) {
    return 0.6 + lutealProgress * 0.2;
  }
  return 0.7 - (lutealProgress - 0.5) * 1.0;
}

function calculateProgesterone(
  day: number,
  cycleLength: number,
  ovDay: number
): number {
  if (day <= ovDay) return 0.05;

  const lutealProgress = (day - ovDay) / (cycleLength - ovDay);
  // Bell curve peaking around 60% through luteal phase
  const peakAt = 0.6;
  const spread = 0.3;
  return (
    0.9 *
    Math.exp(
      -Math.pow(lutealProgress - peakAt, 2) / (2 * spread * spread)
    )
  );
}

function calculateEnergy(
  day: number,
  cycleLength: number,
  ovDay: number
): number {
  if (day <= 3) return 0.3;
  if (day <= 5) return 0.4;
  if (day <= ovDay) {
    return 0.5 + ((day - 5) / (ovDay - 5)) * 0.4;
  }
  if (day <= ovDay + 3) return 0.7;
  const lutealProgress = (day - ovDay - 3) / (cycleLength - ovDay - 3);
  return 0.7 - lutealProgress * 0.4;
}

export function generateHormoneCurve(
  cycleLength: number = 28
): HormonePoint[] {
  const points: HormonePoint[] = [];
  const ovulationDay = cycleLength - 14;

  for (let day = 1; day <= cycleLength; day++) {
    points.push({
      day,
      estrogen: clamp(
        calculateEstrogen(day, cycleLength, ovulationDay),
        0,
        1
      ),
      progesterone: clamp(
        calculateProgesterone(day, cycleLength, ovulationDay),
        0,
        1
      ),
      energy: clamp(
        calculateEnergy(day, cycleLength, ovulationDay),
        0,
        1
      ),
    });
  }

  return points;
}
