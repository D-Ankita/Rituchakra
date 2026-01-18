# Phase 1 Runbook — Auth + Data Model

**Prerequisite:** Phase 0 complete (Supabase project exists, `.env.local` has keys, SDKs installed).

**Goal:** database schema live, auth working end-to-end, users can sign up + sign in + reach the tab layout.

**Total weight in tracker:** 12%
**Estimated time:** 2 focused days of work

---

## Task 1.1 — Apply Supabase migrations (30 min) · weight 2%

Four migration files live in `supabase/migrations/`:

1. `20260418000001_initial_schema.sql` — profiles, subscriptions, cycles, entries, phase_events, notification_prefs
2. `20260418000002_articles_and_interactions.sql` — articles, saved_items, ritual_completions
3. `20260418000003_rls_policies.sql` — RLS on every user-data table
4. `20260419000001_ai_coach_tables.sql` — chat_sessions, chat_messages, article_chunks (pgvector), query_flags, ai_usage

### Install Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Or via npm
npm install -g supabase
```

### Link to your project

```bash
cd /path/to/RituChakra
supabase login                                    # browser flow
supabase link --project-ref YOUR_PROJECT_REF       # from Supabase dashboard → Settings → General
```

### Apply migrations

```bash
supabase db push
```

You should see:
```
Applying migration 20260418000001_initial_schema.sql...
Applying migration 20260418000002_articles_and_interactions.sql...
Applying migration 20260418000003_rls_policies.sql...
Applying migration 20260419000001_ai_coach_tables.sql...
Finished applying migrations.
```

### Verify tables

Open Supabase Dashboard → Table Editor. You should see:
- `profiles`, `subscriptions`, `cycles`, `entries`, `phase_events`, `notification_prefs`
- `articles`, `saved_items`, `ritual_completions`
- `chat_sessions`, `chat_messages`, `article_chunks`, `query_flags`, `ai_usage`

---

## Task 1.2 — Verify RLS policies (20 min) · weight 1.5%

Open SQL Editor in Supabase Dashboard and run:

```sql
-- Every policy should return rows here
select schemaname, tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public'
order by tablename, cmd;

-- Row counts of policy per table
select tablename, count(*) as policies
from pg_policies
where schemaname = 'public'
group by tablename
order by tablename;
```

Expected counts roughly:
- `profiles` 2 · `subscriptions` 1 · `cycles` 4 · `entries` 4 · `phase_events` 3 · `notification_prefs` 2
- `articles` 1 · `saved_items` 3 · `ritual_completions` 3
- `chat_sessions` 4 · `chat_messages` 3 · `article_chunks` 1 · `ai_usage` 1

### Test RLS in practice

Sign up a test user, then in SQL editor:

```sql
-- As service_role (bypasses RLS)
insert into profiles (id) values ('some-uuid-that-is-not-current-user-id');

-- Then switch to the test user session and try:
select * from profiles;
```

You should only see the test user's row. If you see others, RLS is broken.

---

## Task 1.3 — Build Supabase client wrapper (30 min) · weight 1%

Create `src/lib/supabase.ts`:

```typescript
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Custom auth storage using Expo SecureStore (encrypted)
const secureStorage = {
  getItem: async (key: string) => await SecureStore.getItemAsync(key),
  setItem: async (key: string, value: string) => {
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string) => await SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: secureStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helpful typed selectors
export type Profile = {
  id: string;
  display_name: string | null;
  cycle_length_avg: number;
  period_length_avg: number;
  last_period_start: string | null;
  timezone: string;
  locale: string;
};

export async function getProfile(): Promise<Profile | null> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();
  return profile as Profile | null;
}
```

### Auth state helper

Create `src/lib/auth-context.tsx`:

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
```

Wrap your root layout: `<AuthProvider>{children}</AuthProvider>`.

---

## Task 1.4 — Build Sign Up screen (60 min) · weight 1%

Match the Figma mockup (screen #15). Create `app/auth/sign-up.tsx`.

Key interactions:
- Email input (validate: basic regex)
- Consent checkbox (UNCHECKED by default — this is the DPDP requirement)
- "Create account" button → calls `supabase.auth.signInWithOtp({ email })` (magic link)
- On success → navigate to Email Verify screen

Minimal flow:

```typescript
import { useState } from 'react';
import { View, TextInput, Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/src/lib/supabase';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignUp = async () => {
    if (!consent) {
      setError('Please agree to Terms & Privacy to continue.');
      return;
    }
    setLoading(true);
    setError(null);
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'rituchakra://auth-callback',
      },
    });
    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    router.push({ pathname: '/auth/verify', params: { email } });
  };

  return (/* layout from Figma screen #15 */);
}
```

---

## Task 1.5 — Build Sign In screen (45 min) · weight 1.5%

Similar to Sign Up. Screen #14.

- Magic-link primary (reuses `signInWithOtp`)
- Google OAuth via `supabase.auth.signInWithOAuth({ provider: 'google' })`
- Apple OAuth via `signInWithOAuth({ provider: 'apple' })`

For OAuth you need to configure the providers in Supabase → Authentication → Providers first. Takes ~15 min setup per provider.

---

## Task 1.6 — Email Verify / Magic-link Sent screen (30 min) · weight 0.5%

Screen #16. Mostly presentational.

- Reads `email` from route params
- "Resend in 30s" countdown timer
- "Change email" link → back to sign-up
- No API calls here unless user taps "resend"

Hook deep-link handling in `app/_layout.tsx`:

```typescript
import * as Linking from 'expo-linking';

// In your root layout:
useEffect(() => {
  const sub = Linking.addEventListener('url', async ({ url }) => {
    // Supabase magic link format:
    // rituchakra://auth-callback#access_token=...&refresh_token=...
    const params = Object.fromEntries(
      new URLSearchParams(url.split('#')[1] || '')
    );
    if (params.access_token && params.refresh_token) {
      await supabase.auth.setSession({
        access_token: params.access_token,
        refresh_token: params.refresh_token,
      });
      router.replace('/(tabs)');
    }
  });
  return () => sub.remove();
}, []);
```

Add to `app.json`:

```json
{
  "expo": {
    "scheme": "rituchakra"
  }
}
```

Configure allowed redirect URLs in Supabase → Authentication → URL Configuration.

---

## Task 1.7 — Insert auth step in onboarding flow (30 min) · weight 0.5%

Flow order:
1. `app/onboarding/welcome.tsx` — Welcome
2. `app/auth/sign-up.tsx` — Create account (NEW in flow)
3. `app/auth/verify.tsx` — Verify email (NEW)
4. `app/onboarding/last-period.tsx` — Onboarding continues only after verified
5. `app/onboarding/cycle-length.tsx`
6. `app/(tabs)/` — Main app

On Welcome screen's "Begin" button, navigate to `/auth/sign-up`.

Track onboarding completion via `profiles.onboarded_at` — set on final step (cycle-length submit). Any user without `onboarded_at` and with a session returns to the onboarding flow, not to tabs.

---

## Task 1.8 — Protect routes (45 min) · weight 1%

Create `src/lib/auth-gate.tsx`:

```typescript
import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from './auth-context';

/**
 * Redirects:
 * - unauthenticated → /auth/sign-in (unless already in /auth/* or /onboarding/welcome)
 * - authenticated but not onboarded → /onboarding/last-period
 * - authenticated + onboarded + in /auth/* → /(tabs)
 */
export function useAuthGate(onboardedAt: string | null | undefined) {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthFlow = segments[0] === 'auth';
    const inOnboarding = segments[0] === 'onboarding';

    if (!session && !inAuthFlow && segments[1] !== 'welcome') {
      router.replace('/auth/sign-in');
    } else if (session && !onboardedAt && !inOnboarding && !inAuthFlow) {
      router.replace('/onboarding/last-period');
    } else if (session && onboardedAt && inAuthFlow) {
      router.replace('/(tabs)');
    }
  }, [session, loading, segments, onboardedAt]);
}
```

Use in root layout.

---

## Task 1.9 — Session persistence + token refresh (15 min) · weight 1%

The Supabase client we built in Task 1.3 already:
- Persists session in SecureStore
- Auto-refreshes tokens

To handle app-foreground token check:

```typescript
import { AppState } from 'react-native';
import { supabase } from '@/src/lib/supabase';

AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
```

Place this once in `app/_layout.tsx`.

---

## Task 1.10 — Seed content + build RAG index (30 min · optional for Phase 1)

This is technically Phase 8 prep but quick to do while you're in the flow:

```bash
# Populate articles table
pnpm tsx scripts/seed-content.ts

# Build the RAG index (requires OPENAI_API_KEY)
pnpm tsx scripts/build-rag-index.ts
```

---

## Phase 1 completion checklist

- [ ] 1.1 · 4 migrations applied successfully
- [ ] 1.2 · RLS policies verified with test queries
- [ ] 1.3 · Supabase client wrapper + AuthProvider live
- [ ] 1.4 · Sign Up screen functional (sends magic link)
- [ ] 1.5 · Sign In screen with Google + Apple
- [ ] 1.6 · Email Verify screen + deep link handler
- [ ] 1.7 · Onboarding flow inserts auth step
- [ ] 1.8 · Route protection working
- [ ] 1.9 · Session persists across app restart
- [ ] 1.10 · Content seeded + RAG index built (optional, unblocks Phase 8)

---

## Common pitfalls

- **"JWT malformed" error after OAuth:** check redirect URL in Supabase Auth settings exactly matches `rituchakra://auth-callback`.
- **Magic link opens Safari instead of the app (iOS):** verify `scheme: "rituchakra"` is in `app.json` AND Universal Links are set up (run `npx expo prebuild` after edits).
- **RLS blocks service-role inserts:** don't use the anon key for admin scripts — use the service role key, which bypasses RLS.
- **pgvector error on migration:** Supabase enables the extension automatically when your SQL runs `create extension if not exists "vector"`. If it fails, go to Database → Extensions → enable `vector` manually.
- **Migrations out of order:** Supabase CLI applies them alphabetically by filename; our timestamp prefix ensures order.

---

## What comes after Phase 1

Phase 2 (Cycle Tracking MVP). First task: port the existing `src/utils/cycleMath.ts` to query `cycles` + `entries` tables instead of AsyncStorage. Then rebuild Today/Calendar screens using the theme provider + real data.

---

*Runbook drafted 2026-04-20. Version 1.*
