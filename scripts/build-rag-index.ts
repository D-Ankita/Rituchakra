#!/usr/bin/env node
/**
 * RituChakra · RAG Index Builder
 *
 * Reads markdown files under /content/**, splits each article into chunks,
 * embeds each chunk via OpenAI, and upserts into Supabase `article_chunks`.
 *
 * Run this after every `pnpm tsx scripts/seed-content.ts` (which populates `articles`)
 * OR as a standalone step when content changes.
 *
 * Usage:
 *   pnpm tsx scripts/build-rag-index.ts                    # re-index everything
 *   pnpm tsx scripts/build-rag-index.ts --slug=foo         # just one article
 *   pnpm tsx scripts/build-rag-index.ts --dry-run          # show what would happen
 *
 * Requires:
 *   SUPABASE_URL              — Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY — service role key (not the anon key)
 *   OPENAI_API_KEY            — for embeddings (text-embedding-3-small, 1536 dims)
 *
 * Idempotent: running twice on unchanged content is safe (upsert on article_id + chunk_index).
 */

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { createClient } from '@supabase/supabase-js';

// ────────────────────────────────────────────────────────────
// Config
// ────────────────────────────────────────────────────────────
const CHUNK_SIZE_CHARS = 1200;   // ~300 tokens at 4 chars/token average
const CHUNK_OVERLAP_CHARS = 200;  // ~50 tokens overlap
const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMS = 1536;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const CONTENT_ROOT = path.resolve(__dirname, '..', 'content');

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const slugFilter = args.find((a) => a.startsWith('--slug='))?.split('=')[1];

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
if (!OPENAI_API_KEY && !DRY_RUN) {
  console.error('❌ Missing OPENAI_API_KEY (required unless --dry-run)');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────
type Chunk = {
  article_id: string;
  slug: string;
  chunk_index: number;
  chunk_text: string;
  section_heading: string | null;
  phases: string[];
  doshas: string[];
  tier: 'free' | 'premium';
};

type ArticleMeta = {
  id: string;
  slug: string;
  phases: string[];
  doshas: string[];
  tier: 'free' | 'premium';
};

// ────────────────────────────────────────────────────────────
// Chunking — character-based sliding window w/ section awareness
// ────────────────────────────────────────────────────────────
function chunkMarkdownBody(body: string): { text: string; heading: string | null }[] {
  // Split on h2/h3 headings so chunks align with article structure.
  const sections: { heading: string | null; text: string }[] = [];
  let currentHeading: string | null = null;
  let buffer = '';

  for (const line of body.split('\n')) {
    const headingMatch = line.match(/^##+\s+(.+)$/);
    if (headingMatch) {
      if (buffer.trim().length > 0) {
        sections.push({ heading: currentHeading, text: buffer.trim() });
      }
      currentHeading = headingMatch[1].trim();
      buffer = '';
    } else {
      buffer += line + '\n';
    }
  }
  if (buffer.trim().length > 0) {
    sections.push({ heading: currentHeading, text: buffer.trim() });
  }

  // Then slide-window each section if it's bigger than CHUNK_SIZE_CHARS.
  const chunks: { text: string; heading: string | null }[] = [];
  for (const section of sections) {
    const text = section.text;
    if (text.length <= CHUNK_SIZE_CHARS) {
      chunks.push({ text, heading: section.heading });
      continue;
    }
    let start = 0;
    while (start < text.length) {
      const end = Math.min(start + CHUNK_SIZE_CHARS, text.length);
      chunks.push({ text: text.slice(start, end), heading: section.heading });
      if (end === text.length) break;
      start = end - CHUNK_OVERLAP_CHARS;
    }
  }

  return chunks.filter((c) => c.text.trim().length > 50);
}

// ────────────────────────────────────────────────────────────
// Embedding — OpenAI text-embedding-3-small
// ────────────────────────────────────────────────────────────
async function embedBatch(texts: string[]): Promise<number[][]> {
  if (DRY_RUN) {
    // Return dummy vectors for dry-run
    return texts.map(() => Array(EMBEDDING_DIMS).fill(0));
  }

  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: texts,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI embedding error ${res.status}: ${err}`);
  }

  const json = await res.json() as { data: { embedding: number[] }[] };
  return json.data.map((d) => d.embedding);
}

// ────────────────────────────────────────────────────────────
// Walk markdown files recursively
// ────────────────────────────────────────────────────────────
function* walkMarkdown(dir: string): Generator<string> {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walkMarkdown(full);
    else if (entry.isFile() && entry.name.endsWith('.md')) yield full;
  }
}

// ────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────
async function main() {
  // Fetch existing articles from the DB so we have their IDs
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, slug, phases, doshas, tier');

  if (error) {
    console.error('❌ Failed to fetch articles from Supabase:', error.message);
    console.error('   Did you run seed-content.ts first?');
    process.exit(1);
  }

  const articleMap = new Map<string, ArticleMeta>(
    (articles ?? []).map((a) => [a.slug as string, a as ArticleMeta])
  );

  console.log(`📚 Found ${articleMap.size} article(s) in Supabase.`);

  const files = Array.from(walkMarkdown(CONTENT_ROOT));
  let processed = 0;
  let totalChunks = 0;
  let skipped = 0;

  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf-8');
    const { data: frontmatter, content: body } = matter(raw);
    const slug = String(frontmatter.slug || '');

    if (!slug) {
      console.warn(`⚠ Skipping ${file} (no slug)`);
      skipped++;
      continue;
    }

    if (slugFilter && slug !== slugFilter) continue;

    const article = articleMap.get(slug);
    if (!article) {
      console.warn(`⚠ Skipping ${slug} (not found in DB — run seed-content.ts first)`);
      skipped++;
      continue;
    }

    const chunks = chunkMarkdownBody(body);
    if (chunks.length === 0) {
      console.warn(`⚠ ${slug} produced 0 chunks`);
      continue;
    }

    console.log(`\n📄 ${slug} · ${chunks.length} chunks`);

    // Embed in a single batch
    const embeddings = await embedBatch(chunks.map((c) => c.text));

    // Upsert
    const rows: (Chunk & { embedding: number[] })[] = chunks.map((c, i) => ({
      article_id: article.id,
      slug,
      chunk_index: i,
      chunk_text: c.text,
      section_heading: c.heading,
      phases: article.phases,
      doshas: article.doshas,
      tier: article.tier,
      embedding: embeddings[i],
    }));

    if (!DRY_RUN) {
      // Delete existing chunks for this article first (simpler than upsert on composite key)
      await supabase.from('article_chunks').delete().eq('article_id', article.id);

      const { error: upsertErr } = await supabase
        .from('article_chunks')
        .insert(rows.map((r) => {
          // Strip 'slug' — not a column on article_chunks in schema
          const { slug: _slug, ...rest } = r;
          return rest;
        }));

      if (upsertErr) {
        console.error(`  ❌ upsert failed: ${upsertErr.message}`);
        continue;
      }
    }

    processed++;
    totalChunks += chunks.length;
    console.log(`  ✅ ${chunks.length} chunks indexed`);
  }

  console.log(`\n─────────────────────────────────────`);
  console.log(`  Processed: ${processed} article(s)`);
  console.log(`  Chunks total: ${totalChunks}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Mode: ${DRY_RUN ? 'DRY RUN (no DB writes)' : 'LIVE'}`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
