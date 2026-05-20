export type FestivalKind = 'festival' | 'fasting' | 'observance';

export interface FestivalEntry {
  name: string;
  kind: FestivalKind;
  // Approximate month/day for fixed-date festivals; lunar-calendar
  // festivals are best-effort year-by-year and noted as such.
  month: number; // 1-12
  day: number;   // 1-31
  region?: 'all' | 'north-india' | 'maharashtra' | 'south-india' | 'east-india';
  contentSlug?: string;
  isLunar?: boolean; // if true, dates shift year to year — used as a hint, not a hard date
}

/**
 * Curated, minimal festival dataset. Lunar dates are approximate
 * (anchored to a sample year) — the spec calls for "best-effort"
 * cultural intelligence at this stage, not a full panchang. Expand
 * iteratively as the companion gets feedback.
 *
 * NOT a substitute for a real Hindu calendar library; treat hits as
 * hints to Dadi, not as authoritative dates.
 */
export const FESTIVALS: ReadonlyArray<FestivalEntry> = [
  // Fixed-ish solar dates
  { name: 'Makar Sankranti', kind: 'festival', month: 1, day: 14, region: 'all' },
  { name: 'Republic Day', kind: 'observance', month: 1, day: 26, region: 'all' },
  { name: 'Independence Day', kind: 'observance', month: 8, day: 15, region: 'all' },
  { name: 'Gandhi Jayanti', kind: 'observance', month: 10, day: 2, region: 'all' },

  // Lunar festivals — anchor month/day approximate. isLunar=true so callers know.
  { name: 'Holi', kind: 'festival', month: 3, day: 14, region: 'all', isLunar: true },
  { name: 'Gudi Padwa', kind: 'festival', month: 3, day: 30, region: 'maharashtra', isLunar: true },
  { name: 'Ram Navami', kind: 'festival', month: 4, day: 6, region: 'all', isLunar: true },
  { name: 'Akshaya Tritiya', kind: 'festival', month: 5, day: 10, region: 'all', isLunar: true },
  { name: 'Vat Purnima', kind: 'observance', month: 6, day: 11, region: 'maharashtra', isLunar: true },
  { name: 'Guru Purnima', kind: 'observance', month: 7, day: 10, region: 'all', isLunar: true },
  { name: 'Raksha Bandhan', kind: 'festival', month: 8, day: 9, region: 'all', isLunar: true },
  { name: 'Janmashtami', kind: 'festival', month: 8, day: 26, region: 'all', isLunar: true },
  { name: 'Ganesh Chaturthi', kind: 'festival', month: 9, day: 7, region: 'maharashtra', isLunar: true },
  { name: 'Navratri (begins)', kind: 'fasting', month: 10, day: 3, region: 'all', isLunar: true, contentSlug: 'ritumaticharya/01-rajasvala-charya' },
  { name: 'Dussehra', kind: 'festival', month: 10, day: 12, region: 'all', isLunar: true },
  { name: 'Karva Chauth', kind: 'fasting', month: 10, day: 20, region: 'north-india', isLunar: true, contentSlug: 'ritumaticharya/02-period-myths-debunked' },
  { name: 'Dhanteras', kind: 'festival', month: 11, day: 1, region: 'all', isLunar: true },
  { name: 'Diwali', kind: 'festival', month: 11, day: 4, region: 'all', isLunar: true },
  { name: 'Bhai Dooj', kind: 'festival', month: 11, day: 6, region: 'all', isLunar: true },
  { name: 'Chhath Puja', kind: 'fasting', month: 11, day: 7, region: 'east-india', isLunar: true },
];

/**
 * Recurring monthly observances (rough approximations).
 * Ekadashi falls twice a lunar month; treat as a hint only.
 */
export const MONTHLY_OBSERVANCES: ReadonlyArray<{ name: string; dayOfMonth: number; kind: FestivalKind }> = [
  { name: 'Ekadashi (approx.)', dayOfMonth: 11, kind: 'fasting' },
  { name: 'Ekadashi (approx.)', dayOfMonth: 26, kind: 'fasting' },
  { name: 'Purnima (full moon, approx.)', dayOfMonth: 15, kind: 'observance' },
  { name: 'Amavasya (new moon, approx.)', dayOfMonth: 30, kind: 'observance' },
];
