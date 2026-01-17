-- RituChakra · Row-Level Security Policies
-- Migration 3 of N · 2026-04-18
-- Enables RLS on every user-data table and defines policies.
--
-- CORE PRINCIPLE: A user can only see their own rows.
-- Articles are public-read when published=true, write only via service_role.

-- ============================================================
-- Enable RLS on every user-data table
-- ============================================================
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.cycles enable row level security;
alter table public.entries enable row level security;
alter table public.phase_events enable row level security;
alter table public.notification_prefs enable row level security;
alter table public.articles enable row level security;
alter table public.saved_items enable row level security;
alter table public.ritual_completions enable row level security;

-- ============================================================
-- profiles
-- ============================================================
create policy "users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- No INSERT — done via trigger handle_new_user()
-- No DELETE — cascades from auth.users deletion

-- ============================================================
-- subscriptions
-- ============================================================
create policy "users can view own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- INSERT + UPDATE handled via RevenueCat webhook using service_role key

-- ============================================================
-- cycles
-- ============================================================
create policy "users can view own cycles"
  on public.cycles for select
  using (auth.uid() = user_id);

create policy "users can insert own cycles"
  on public.cycles for insert
  with check (auth.uid() = user_id);

create policy "users can update own cycles"
  on public.cycles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users can delete own cycles"
  on public.cycles for delete
  using (auth.uid() = user_id);

-- ============================================================
-- entries
-- ============================================================
create policy "users can view own entries"
  on public.entries for select
  using (auth.uid() = user_id);

create policy "users can insert own entries"
  on public.entries for insert
  with check (auth.uid() = user_id);

create policy "users can update own entries"
  on public.entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users can delete own entries"
  on public.entries for delete
  using (auth.uid() = user_id);

-- ============================================================
-- phase_events
-- ============================================================
create policy "users can view own phase events"
  on public.phase_events for select
  using (auth.uid() = user_id);

create policy "users can insert own phase events"
  on public.phase_events for insert
  with check (auth.uid() = user_id);

create policy "users can update own phase events"
  on public.phase_events for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- No DELETE — history is append-only

-- ============================================================
-- notification_prefs
-- ============================================================
create policy "users can view own notification prefs"
  on public.notification_prefs for select
  using (auth.uid() = user_id);

create policy "users can update own notification prefs"
  on public.notification_prefs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- INSERT via handle_new_user() trigger
-- No DELETE — cascades from auth.users

-- ============================================================
-- articles (public read for published; no user writes)
-- ============================================================
create policy "anyone can read published articles"
  on public.articles for select
  using (published = true);

-- Free-tier restriction is enforced at the application layer, not RLS.
-- Rationale: metadata + slug + first paragraph of premium articles are readable
-- for teaser purposes; only the full body is gated by subscription entitlement.

-- Inserts / updates to articles happen only via service_role (seeding, admin).

-- ============================================================
-- saved_items
-- ============================================================
create policy "users can view own saved items"
  on public.saved_items for select
  using (auth.uid() = user_id);

create policy "users can save items"
  on public.saved_items for insert
  with check (auth.uid() = user_id);

create policy "users can unsave items"
  on public.saved_items for delete
  using (auth.uid() = user_id);

-- ============================================================
-- ritual_completions
-- ============================================================
create policy "users can view own completions"
  on public.ritual_completions for select
  using (auth.uid() = user_id);

create policy "users can record own completions"
  on public.ritual_completions for insert
  with check (auth.uid() = user_id);

create policy "users can delete own completions"
  on public.ritual_completions for delete
  using (auth.uid() = user_id);

-- No UPDATE — completions are immutable facts (if note needs editing, delete + recreate)
