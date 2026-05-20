/**
 * Bridge between the reviewed content library and the companion.
 *
 * Source of truth: scripts/build-content-registry.ts parses
 * content/**\/*.md and writes articleRegistry.generated.ts. Update
 * by running `npm run build:content-registry` whenever an article
 * is added, removed, or has its `published` flag flipped after
 * BAMS review.
 *
 * The companion may only cite articles with `published: true`.
 * Anything else is unreviewed Ayurvedic claims — the spec forbids
 * letting the LLM invent those.
 */

import { GENERATED_ARTICLES } from './articleRegistry.generated';

export interface ReviewedArticleRef {
  slug: string;
  category:
    | 'phase-wisdom'
    | 'rituals'
    | 'herbs'
    | 'hormone-science'
    | 'ritumaticharya';
  title: string;
  phases?: Array<'menstrual' | 'follicular' | 'ovulation' | 'luteal'>;
  published: boolean;
}

export function listAllArticles(): ReviewedArticleRef[] {
  return [...GENERATED_ARTICLES];
}

export function listPublishedArticles(): ReviewedArticleRef[] {
  return GENERATED_ARTICLES.filter((a) => a.published);
}

export function findArticleBySlug(slug: string): ReviewedArticleRef | null {
  return GENERATED_ARTICLES.find((a) => a.slug === slug && a.published) ?? null;
}

export function findArticlesForPhase(
  phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal'
): ReviewedArticleRef[] {
  return listPublishedArticles().filter(
    (a) => !a.phases || a.phases.includes(phase)
  );
}

export function articleCount(): { total: number; published: number } {
  return {
    total: GENERATED_ARTICLES.length,
    published: listPublishedArticles().length,
  };
}
