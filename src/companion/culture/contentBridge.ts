/**
 * Bridge between the reviewed content library and the companion.
 *
 * The companion may only reference articles that have been
 * practitioner-reviewed (frontmatter `published: true`). Anything
 * else is unreviewed Ayurvedic claims — the spec forbids letting
 * the LLM invent those.
 *
 * Note: in the app's runtime (React Native) we don't read the
 * filesystem at boot; the published article registry is bundled at
 * build time. For now this module exposes a static registry that
 * mirrors the content/ directory. Update when articles are
 * approved.
 *
 * TODO(M2-followup): replace this hand-maintained registry with a
 * generated artifact from scripts/seed-content.ts, so it cannot
 * drift from the actual content library.
 */

export interface ReviewedArticleRef {
  slug: string;
  category: 'phase-wisdom' | 'rituals' | 'herbs' | 'hormone-science' | 'ritumaticharya';
  title: string;
  phases?: Array<'menstrual' | 'follicular' | 'ovulation' | 'luteal'>;
  published: boolean;
}

const ARTICLES: ReadonlyArray<ReviewedArticleRef> = [
  // Currently ALL articles in the library are `published: false`
  // pending BAMS review (see docs/SESSION_STATUS.md). The companion
  // will surface zero citations until at least one is approved.
  { slug: 'menstrual-inner-winter', category: 'phase-wisdom', title: 'Menstrual · The Inner Winter', phases: ['menstrual'], published: false },
  { slug: 'follicular-inner-spring', category: 'phase-wisdom', title: 'Follicular · The Inner Spring', phases: ['follicular'], published: false },
  { slug: 'ovulation-inner-summer', category: 'phase-wisdom', title: 'Ovulation · The Inner Summer', phases: ['ovulation'], published: false },
  { slug: 'luteal-inner-autumn', category: 'phase-wisdom', title: 'Luteal · The Inner Autumn', phases: ['luteal'], published: false },
  { slug: 'welcome-first-ritual', category: 'rituals', title: 'Welcome Ritual', published: false },
  { slug: 'menstrual-warm-castor-oil-belly-pack', category: 'rituals', title: 'Warm Castor Oil Belly Pack', phases: ['menstrual'], published: false },
  { slug: 'follicular-warm-sesame-abhyanga', category: 'rituals', title: 'Warm Sesame Abhyanga', phases: ['follicular'], published: false },
  { slug: 'ovulation-nadi-shodhana', category: 'rituals', title: 'Nadi Shodhana', phases: ['ovulation'], published: false },
  { slug: 'luteal-slow-kitchari', category: 'rituals', title: 'Slow Kitchari', phases: ['luteal'], published: false },
  { slug: 'shatavari', category: 'herbs', title: 'Shatavari', published: false },
  { slug: 'ashoka', category: 'herbs', title: 'Ashoka', published: false },
  { slug: 'lodhra', category: 'herbs', title: 'Lodhra', published: false },
  { slug: 'triphala', category: 'herbs', title: 'Triphala', published: false },
  { slug: 'turmeric', category: 'herbs', title: 'Turmeric', published: false },
  { slug: 'estrogen-the-rise', category: 'hormone-science', title: 'Estrogen · The Rise', published: false },
  { slug: 'progesterone-the-hold', category: 'hormone-science', title: 'Progesterone · The Hold', published: false },
  { slug: 'lh-surge', category: 'hormone-science', title: 'The LH Surge', published: false },
  { slug: 'basal-body-temperature', category: 'hormone-science', title: 'Basal Body Temperature', published: false },
  { slug: 'rajasvala-charya', category: 'ritumaticharya', title: 'Rajasvala Charya', published: false },
  { slug: 'period-myths-debunked', category: 'ritumaticharya', title: 'Period Myths Debunked', published: false },
  { slug: 'modern-rajasvala', category: 'ritumaticharya', title: 'Modern Rajasvala', published: false },
];

export function listPublishedArticles(): ReviewedArticleRef[] {
  return ARTICLES.filter((a) => a.published);
}

export function findArticleBySlug(slug: string): ReviewedArticleRef | null {
  return ARTICLES.find((a) => a.slug === slug && a.published) ?? null;
}

export function findArticlesForPhase(
  phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal'
): ReviewedArticleRef[] {
  return listPublishedArticles().filter(
    (a) => !a.phases || a.phases.includes(phase)
  );
}
