import { FESTIVALS, MONTHLY_OBSERVANCES, FestivalEntry } from './festivals.data';
import { CulturalFlag } from '../context/ContextPacket';

interface LookupOpts {
  date: Date;
  region?: string;
  toleranceDays?: number; // window around lunar dates
}

/**
 * Best-effort lookup. Returns the first matching cultural flag for
 * a date, or null. Lunar entries match within +/- toleranceDays.
 */
export function findCulturalFlag(opts: LookupOpts): CulturalFlag | null {
  const tol = opts.toleranceDays ?? 1;
  const month = opts.date.getMonth() + 1;
  const day = opts.date.getDate();

  const regionMatch = (e: FestivalEntry) =>
    !e.region || e.region === 'all' || e.region === opts.region;

  for (const e of FESTIVALS) {
    if (!regionMatch(e)) continue;
    const window = e.isLunar ? tol : 0;
    if (e.month === month && Math.abs(e.day - day) <= window) {
      return {
        kind: e.kind === 'observance' ? 'observance' : e.kind,
        name: e.name,
        contentSlug: e.contentSlug ?? null,
      };
    }
  }

  for (const o of MONTHLY_OBSERVANCES) {
    if (o.dayOfMonth === day || (o.dayOfMonth === 30 && day === lastDayOfMonth(opts.date))) {
      return { kind: o.kind === 'observance' ? 'observance' : o.kind, name: o.name, contentSlug: null };
    }
  }

  return null;
}

function lastDayOfMonth(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}
