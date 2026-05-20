import {
  listAllArticles,
  listPublishedArticles,
  findArticleBySlug,
  findArticlesForPhase,
  articleCount,
} from '../contentBridge';

describe('contentBridge', () => {
  it('listAllArticles returns the generated registry', () => {
    const all = listAllArticles();
    expect(all.length).toBeGreaterThan(0);
    // Every category in our content tree should be represented
    const cats = new Set(all.map((a) => a.category));
    expect(cats.has('phase-wisdom')).toBe(true);
    expect(cats.has('rituals')).toBe(true);
  });

  it('listPublishedArticles only returns published=true', () => {
    const published = listPublishedArticles();
    for (const a of published) {
      expect(a.published).toBe(true);
    }
  });

  it('findArticleBySlug only matches published articles', () => {
    // Without a published article in the library, this returns null.
    // If/when one is approved, this assertion still holds because
    // the function gates on `published: true`.
    const all = listAllArticles();
    const unpublishedSlug = all.find((a) => !a.published)?.slug;
    if (unpublishedSlug) {
      expect(findArticleBySlug(unpublishedSlug)).toBeNull();
    }
  });

  it('findArticlesForPhase respects publication and phase filter', () => {
    const luteal = findArticlesForPhase('luteal');
    for (const a of luteal) {
      expect(a.published).toBe(true);
      expect(!a.phases || a.phases.includes('luteal')).toBe(true);
    }
  });

  it('articleCount totals match the registry', () => {
    const c = articleCount();
    const all = listAllArticles();
    expect(c.total).toBe(all.length);
    expect(c.published).toBe(all.filter((a) => a.published).length);
  });
});
