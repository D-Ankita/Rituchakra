#!/usr/bin/env node
/**
 * RituChakra · Content Seed Script
 *
 * Reads markdown files from /content/** and upserts them into
 * Supabase's `articles` table.
 *
 * Usage:
 *   pnpm tsx scripts/seed-content.ts
 *   # or: node --loader tsx scripts/seed-content.ts
 *
 * Requires:
 *   SUPABASE_URL              — your Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY — service role key (NEVER ship in the app; only use here)
 *
 * Run this manually from your laptop after migrations are applied,
 * and re-run anytime content changes.
 */

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { createClient } from '@supabase/supabase-js';

// ────────────────────────────────────────────────────────────
// Environment
// ────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.');
  console.error('   Check .env.local — or run with: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... pnpm seed');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ────────────────────────────────────────────────────────────
// Types matching the articles table
// ────────────────────────────────────────────────────────────
type ArticleRow = {
  slug: string;
  title: string;
  subtitle: string | null;
  category: 'phase-wisdom' | 'ritual' | 'herb' | 'disorder' | 'science' | 'regimen';
  phases: string[];
  doshas: string[];
  tier: 'free' | 'premium';
  body_markdown: string;
  cover_image_url: string | null;
  reading_minutes: number | null;
  duration_minutes: number | null;
  supplies: string[] | null;
  citations: unknown;
  reviewed_by: string | null;
  reviewed_at: string | null;
  published: boolean;
  version: number;
};

// ────────────────────────────────────────────────────────────
// Collect all .md files under /content recursively
// ────────────────────────────────────────────────────────────
const CONTENT_ROOT = path.resolve(__dirname, '..', 'content');

function* walkMarkdown(dir: string): Generator<string> {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walkMarkdown(full);
    else if (entry.isFile() && entry.name.endsWith('.md')) yield full;
  }
}

// ────────────────────────────────────────────────────────────
// Parse and normalize a markdown file
// ────────────────────────────────────────────────────────────
function parseArticle(filePath: string): ArticleRow | null {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data: frontmatter, content } = matter(raw);

  // Validation
  const required = ['slug', 'title', 'category'] as const;
  for (const key of required) {
    if (!frontmatter[key]) {
      console.warn(`⚠ Skipping ${filePath} — missing frontmatter.${key}`);
      return null;
    }
  }

  // Only publish articles with practitioner review AND published: true
  // Until a practitioner reviews, every article goes in with published=false
  const published =
    Boolean(frontmatter.published) &&
    typeof frontmatter.reviewed_by === 'string' &&
    !frontmatter.reviewed_by.includes('pending');

  return {
    slug: String(frontmatter.slug),
    title: String(frontmatter.title),
    subtitle: frontmatter.subtitle ? String(frontmatter.subtitle) : null,
    category: frontmatter.category,
    phases: Array.isArray(frontmatter.phases) ? frontmatter.phases : [],
    doshas: Array.isArray(frontmatter.doshas) ? frontmatter.doshas : [],
    tier: frontmatter.tier === 'premium' ? 'premium' : 'free',
    body_markdown: content.trim(),
    cover_image_url: frontmatter.cover_image_url ? String(frontmatter.cover_image_url) : null,
    reading_minutes: typeof frontmatter.reading_minutes === 'number' ? frontmatter.reading_minutes : null,
    duration_minutes: typeof frontmatter.duration_minutes === 'number' ? frontmatter.duration_minutes : null,
    supplies: Array.isArray(frontmatter.supplies) ? frontmatter.supplies : null,
    citations: frontmatter.citations ?? [],
    reviewed_by: frontmatter.reviewed_by ? String(frontmatter.reviewed_by) : null,
    reviewed_at: frontmatter.reviewed_at ? String(frontmatter.reviewed_at) : null,
    published,
    version: typeof frontmatter.version === 'number' ? frontmatter.version : 1,
  };
}

// ────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────
async function main() {
  if (!fs.existsSync(CONTENT_ROOT)) {
    console.error(`❌ Content directory not found: ${CONTENT_ROOT}`);
    process.exit(1);
  }

  const files = Array.from(walkMarkdown(CONTENT_ROOT));
  console.log(`📚 Found ${files.length} markdown file(s) in ${CONTENT_ROOT}`);

  const rows: ArticleRow[] = [];
  for (const file of files) {
    const article = parseArticle(file);
    if (article) rows.push(article);
  }

  if (rows.length === 0) {
    console.warn('⚠ No valid articles to seed. Exiting.');
    return;
  }

  console.log(`📥 Upserting ${rows.length} article(s)...\n`);

  let published = 0;
  let drafts = 0;
  for (const row of rows) {
    const { error } = await supabase
      .from('articles')
      .upsert(row, { onConflict: 'slug' });

    if (error) {
      console.error(`❌ ${row.slug} — ${error.message}`);
      continue;
    }

    const status = row.published ? '✅ LIVE' : '📝 DRAFT';
    console.log(`${status}  ${row.category.padEnd(14)}  ${row.tier.padEnd(7)}  ${row.slug}`);
    if (row.published) published++;
    else drafts++;
  }

  console.log(`\nDone. Published: ${published} · Drafts: ${drafts} · Total: ${rows.length}`);
  console.log('\nRemember: drafts stay hidden from users until `published=true` AND `reviewed_by` does not contain "pending".');
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
