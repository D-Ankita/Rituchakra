-- RituChakra · Initial Schema
-- Migration 1 of N · 2026-04-18
-- Creates: profiles, subscriptions, cycles, entries, phase_events, notification_prefs

-- ============================================================
-- Extensions
-- ============================================================
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- profiles · 1-to-1 with auth.users
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  cycle_length_avg int default 28 check (cycle_length_avg between 14 and 60),
  period_length_avg int default 5 check (period_length_avg between 1 and 14),
  last_period_start date,
  timezone text default 'Asia/Kolkata',
  locale text default 'en-IN',
  onboarded_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.profiles is 'User profile data, one row per authenticated user.';
comment on column public.profiles.last_period_start is 'Day 1 of the most recent period the user reported during onboarding or later.';

create index profiles_updated_idx on public.profiles(updated_at desc);

-- ============================================================
-- subscriptions · mirrored from RevenueCat via webhook
-- ============================================================
create table public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  revenuecat_id text unique,
  entitlement text check (entitlement in ('premium', null)),
  period_type text check (period_type in ('trial', 'intro', 'normal', 'promotional', null)),
  product_id text,
  expires_at timestamptz,
  will_renew boolean default true,
  store text check (store in ('app_store', 'play_store', 'stripe', 'promotional', null)),
  updated_at timestamptz default now() not null
);

comment on table public.subscriptions is 'Subscription entitlement state, kept in sync with RevenueCat via webhook.';
create index subscriptions_expires_idx on public.subscriptions(expires_at);

-- ============================================================
-- cycles · one row per menstrual cycle
-- ============================================================
create table public.cycles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  start_date date not null,
  end_date date,
  length int check (length between 14 and 60),
  period_length int check (period_length between 1 and 14),
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.cycles is 'One row per menstrual cycle, keyed on start_date (day 1 of period).';

create index cycles_user_start_idx on public.cycles(user_id, start_date desc);
create unique index cycles_user_start_unique on public.cycles(user_id, start_date);

-- ============================================================
-- entries · one row per day of tracking
-- ============================================================
create table public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cycle_id uuid references public.cycles(id) on delete set null,
  entry_date date not null,
  phase text check (phase in ('menstrual', 'follicular', 'ovulation', 'luteal')),
  cycle_day int check (cycle_day between 1 and 60),
  flow text check (flow in ('none', 'spot', 'light', 'medium', 'heavy')),
  moods text[] default array[]::text[],
  symptoms text[] default array[]::text[],
  energy int check (energy between 1 and 5),
  sleep_hours numeric(3,1) check (sleep_hours between 0 and 24),
  digestion text check (digestion in ('poor', 'weak', 'steady', 'strong', 'balanced', null)),
  libido int check (libido between 1 and 5),
  note text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(user_id, entry_date)
);

comment on table public.entries is 'Daily log entries. One row per user per date.';
comment on column public.entries.digestion is 'Ayurvedic quality of agni for that day.';

create index entries_user_date_idx on public.entries(user_id, entry_date desc);
create index entries_cycle_idx on public.entries(cycle_id);

-- ============================================================
-- phase_events · for history + phase-intro modal trigger
-- ============================================================
create table public.phase_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  phase text not null check (phase in ('menstrual', 'follicular', 'ovulation', 'luteal')),
  cycle_id uuid references public.cycles(id) on delete set null,
  occurred_at timestamptz default now() not null,
  shown_intro_modal boolean default false
);

comment on table public.phase_events is 'Logged when a user crosses into a new cycle phase; drives phase-intro modal + history.';

create index phase_events_user_occurred_idx on public.phase_events(user_id, occurred_at desc);

-- ============================================================
-- notification_prefs · one row per user
-- ============================================================
create table public.notification_prefs (
  user_id uuid primary key references auth.users(id) on delete cascade,
  phase_change boolean default true,
  morning_ritual boolean default true,
  period_prediction boolean default true,
  luteal_checkin boolean default false,
  weekly_recap boolean default true,
  quiet_hours_start time default '22:00',
  quiet_hours_end time default '07:30',
  push_token text,
  updated_at timestamptz default now() not null
);

comment on table public.notification_prefs is 'Per-user notification settings + quiet hours.';

-- ============================================================
-- updated_at auto-update trigger function
-- ============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger cycles_set_updated_at
  before update on public.cycles
  for each row execute function public.set_updated_at();

create trigger entries_set_updated_at
  before update on public.entries
  for each row execute function public.set_updated_at();

create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

create trigger notification_prefs_set_updated_at
  before update on public.notification_prefs
  for each row execute function public.set_updated_at();

-- ============================================================
-- Auto-create profile + prefs rows on auth.user creation
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id);
  insert into public.notification_prefs (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
