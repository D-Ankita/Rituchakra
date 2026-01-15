-- RituChakra · Articles and User Interactions
-- Migration 2 of N · 2026-04-18
-- Creates: articles, saved_items, ritual_completions

-- ============================================================
-- articles · the Ayurveda + science content library
-- ============================================================
create table public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text,
  category text not null check (category in (
    'phase-wisdom',
    'ritual',
    'herb',
    'disorder',
    'science',
    'regimen'
  )),
  phases text[] default array[]::text[],
  doshas text[] default array[]::text[],
  tier text default 'premium' not null check (tier in ('free', 'premium')),
  body_markdown text not null,
  cover_image_url text,
  reading_minutes int check (reading_minutes > 0),
  duration_minutes int check (duration_minutes > 0),  -- for rituals
  supplies text[],                                     -- for rituals
  citations jsonb default '[]'::jsonb,
  reviewed_by text,
  reviewed_at timestamptz,
  published boolean default false,
  published_at timestamptz,
  version int default 1 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.articles is 'Ayurveda + hormone science content library. Published articles are user-facing; unpublished are drafts.';
comment on column public.articles.tier is 'free = available to all users; premium = gated behind subscription.';
comment on column public.articles.phases is 'Which cycle phases this article applies to. Empty array = any phase.';
comment on column public.articles.doshas is 'Which doshas are primarily addressed. Empty array = tridoshic.';

create index articles_published_idx on public.articles(published, published_at desc) where published = true;
create index articles_category_idx on public.articles(category) where published = true;
create index articles_tier_idx on public.articles(tier) where published = true;
create index articles_phases_gin on public.articles using gin (phases);
create index articles_doshas_gin on public.articles using gin (doshas);
create index articles_slug_idx on public.articles(slug);

create trigger articles_set_updated_at
  before update on public.articles
  for each row execute function public.set_updated_at();

-- ============================================================
-- saved_items · user bookmarked articles
-- ============================================================
create table public.saved_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  article_id uuid not null references public.articles(id) on delete cascade,
  saved_at timestamptz default now() not null,
  primary key (user_id, article_id)
);

comment on table public.saved_items is 'Junction table: user bookmarks / saves an article or ritual for later.';

create index saved_items_user_idx on public.saved_items(user_id, saved_at desc);

-- ============================================================
-- ritual_completions · user marked a ritual as completed
-- ============================================================
create table public.ritual_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  article_id uuid not null references public.articles(id) on delete cascade,
  completed_at timestamptz default now() not null,
  note text,
  phase_when_completed text check (phase_when_completed in ('menstrual', 'follicular', 'ovulation', 'luteal'))
);

comment on table public.ritual_completions is 'Log of every time a user marks a ritual article as completed. Powers streaks + pattern detection.';

create index ritual_completions_user_completed_idx on public.ritual_completions(user_id, completed_at desc);
create index ritual_completions_article_idx on public.ritual_completions(article_id);
