export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  let sum = 0;
  for (const v of values) sum += v;
  return sum / values.length;
}

export function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  let sq = 0;
  for (const v of values) sq += (v - m) * (v - m);
  return Math.sqrt(sq / values.length);
}

export function countOutOfRange(
  values: number[],
  min: number,
  max: number
): number {
  let n = 0;
  for (const v of values) if (v < min || v > max) n++;
  return n;
}

export function rateOf<T>(items: T[], predicate: (x: T) => boolean): number {
  if (items.length === 0) return 0;
  let n = 0;
  for (const it of items) if (predicate(it)) n++;
  return n / items.length;
}
