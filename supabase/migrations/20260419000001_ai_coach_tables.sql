-- RituChakra · AI Coach · Chat + Chunks + Audit
-- Migration 4 of N · 2026-04-19
-- Creates: chat_sessions · chat_messages · article_chunks · query_flags
-- Enables: pgvector extension for RAG similarity search

-- ============================================================
-- Extension: pgvector for embeddings
-- ============================================================
create extension if not exists "vector";

-- ============================================================
-- chat_sessions · groups related messages in a conversation
-- ============================================================
create table public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz default now() not null,
  ended_at timestamptz,
  message_count int default 0 not null,
  phase_at_start text check (phase_at_start in ('menstrual', 'follicular', 'ovulation', 'luteal', null)),
  cycle_day_at_start int check (cycle_day_at_start between 1 and 60 or cycle_day_at_start is null),
  title text  -- optional user-renamed title; default null = "Chat from [date]"
);

comment on table public.chat_sessions is 'One row per AI conversation. Messages belong to a session.';
create index chat_sessions_user_started_idx on public.chat_sessions(user_id, started_at desc);

-- ============================================================
-- chat_messages · individual user + assistant turns
-- ============================================================
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  model text,                            -- e.g. 'claude-sonnet-4-6', 'gemini-2.5-flash'
  input_tokens int,
  output_tokens int,
  latency_ms int,
  retrieved_chunks jsonb default '[]'::jsonb,
  classifier_decisions jsonb default '{}'::jsonb,
  user_rating text check (user_rating in ('positive', 'negative', null)),
  user_flagged boolean default false not null,
  moderator_reviewed boolean default false not null,
  moderator_action text,
  created_at timestamptz default now() not null
);

comment on table public.chat_messages is 'Every message in every chat session. Assistant messages include model metadata + classifier decisions.';
comment on column public.chat_messages.retrieved_chunks is 'Array of {chunk_id, article_slug, similarity} — for audit and citation verification.';
comment on column public.chat_messages.classifier_decisions is 'Object: {emergency: bool, injection: bool, scope: in|out, confidence: float}';

create index chat_messages_session_created_idx on public.chat_messages(session_id, created_at);
create index chat_messages_user_created_idx on public.chat_messages(user_id, created_at desc);
create index chat_messages_flagged_idx on public.chat_messages(user_flagged, moderator_reviewed) where user_flagged = true;

-- Auto-increment message count on session
create or replace function public.increment_session_message_count()
returns trigger as $$
begin
  update public.chat_sessions
  set message_count = message_count + 1
  where id = new.session_id;
  return new;
end;
$$ language plpgsql;

create trigger chat_messages_increment_count
  after insert on public.chat_messages
  for each row execute function public.increment_session_message_count();

-- ============================================================
-- article_chunks · RAG retrieval index
-- ============================================================
create table public.article_chunks (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  chunk_index int not null,              -- 0-based order within the article
  chunk_text text not null,
  section_heading text,
  phases text[] default array[]::text[],
  doshas text[] default array[]::text[],
  tier text check (tier in ('free', 'premium')),
  embedding vector(1536),                 -- OpenAI text-embedding-3-small / Jina v3 dims
  created_at timestamptz default now() not null,
  unique(article_id, chunk_index)
);

comment on table public.article_chunks is 'Pre-chunked article content with embeddings, used for RAG retrieval during AI chat.';

-- Vector similarity index (ivfflat — works well up to ~1M vectors without tuning)
create index article_chunks_embedding_idx
  on public.article_chunks
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create index article_chunks_phases_gin on public.article_chunks using gin (phases);
create index article_chunks_doshas_gin on public.article_chunks using gin (doshas);
create index article_chunks_article_idx on public.article_chunks(article_id, chunk_index);

-- ============================================================
-- query_flags · audit trail of refused / flagged queries
-- ============================================================
create table public.query_flags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,  -- nullable so we keep audit after deletion
  session_id uuid references public.chat_sessions(id) on delete set null,
  message_id uuid references public.chat_messages(id) on delete set null,
  query_text text not null,                -- stored verbatim for audit
  flag_type text not null check (flag_type in (
    'emergency',
    'injection',
    'out_of_scope',
    'low_confidence',
    'output_diagnosis',
    'output_prescription',
    'output_missing_disclaimer',
    'invalid_citation',
    'user_flagged'
  )),
  classifier_details jsonb default '{}'::jsonb,
  resolved boolean default false not null,
  resolver_notes text,
  created_at timestamptz default now() not null
);

comment on table public.query_flags is 'Audit trail of every flagged AI query. Read only by admins / moderators. Supports safety review process.';
create index query_flags_type_created_idx on public.query_flags(flag_type, created_at desc);
create index query_flags_unresolved_idx on public.query_flags(resolved, created_at desc) where resolved = false;

-- ============================================================
-- ai_usage · per-user daily counter (for rate limiting)
-- ============================================================
create table public.ai_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null,
  query_count int default 0 not null,
  primary key (user_id, usage_date)
);

comment on table public.ai_usage is 'Per-user daily query count for rate limiting and analytics.';
create index ai_usage_date_idx on public.ai_usage(usage_date desc);

-- Convenience function to atomically increment usage
create or replace function public.increment_ai_usage(p_user_id uuid)
returns int as $$
declare
  new_count int;
begin
  insert into public.ai_usage (user_id, usage_date, query_count)
  values (p_user_id, current_date, 1)
  on conflict (user_id, usage_date)
  do update set query_count = public.ai_usage.query_count + 1
  returning query_count into new_count;
  return new_count;
end;
$$ language plpgsql security definer;

-- ============================================================
-- RLS policies
-- ============================================================
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.article_chunks enable row level security;
alter table public.query_flags enable row level security;
alter table public.ai_usage enable row level security;

-- chat_sessions
create policy "users see own sessions"
  on public.chat_sessions for select
  using (auth.uid() = user_id);

create policy "users create sessions"
  on public.chat_sessions for insert
  with check (auth.uid() = user_id);

create policy "users update own sessions"
  on public.chat_sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users delete own sessions"
  on public.chat_sessions for delete
  using (auth.uid() = user_id);

-- chat_messages
create policy "users see own messages"
  on public.chat_messages for select
  using (auth.uid() = user_id);

create policy "users create own user-role messages"
  on public.chat_messages for insert
  with check (auth.uid() = user_id and role = 'user');

-- assistant messages inserted by edge function using service_role
-- (no policy needed; service_role bypasses RLS)

create policy "users rate or flag own messages"
  on public.chat_messages for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- article_chunks: readable by anyone if the parent article is published
create policy "anyone can read chunks of published articles"
  on public.article_chunks for select
  using (
    exists (
      select 1 from public.articles a
      where a.id = article_chunks.article_id
        and a.published = true
    )
  );
-- Inserts/updates via service_role only (via seed script)

-- query_flags: no user read/write policies — admins access via service_role only
-- (We intentionally don't grant user access to this audit table.)

-- ai_usage
create policy "users see own usage"
  on public.ai_usage for select
  using (auth.uid() = user_id);
-- inserts/updates via increment_ai_usage() function (security definer)
