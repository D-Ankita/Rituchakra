---
name: RituChakra — Subscription Pivot Spec & Implementation Plan
date: 2026-04-18
updated: 2026-04-18 (decisions §14 resolved · trademark + pricing research complete)
status: APPROVED · Phase 0 unblocked · soft-blockers tracked in §14
owner: Ankita Dodamani
---

# RituChakra — Subscription Pivot Spec & Implementation Plan

## 0. TL;DR

**Pivot:** From offline-first free app → cloud-backed freemium subscription app.
**New USP:** Ayurveda × hormone science × phase-reactive UX — grounded in classical texts (Charaka, Sushruta, Ashtanga Hridaya) + modern integrative sources (Welch, Svoboda, Tiwari, Lad).
**Target:** India-first, architected for global expansion.
**Pricing hypothesis:** ₹199/mo · ₹1,499/yr · 7-day free trial. Core cycle tracking free; Ayurveda library + insights + phase-personalized rituals behind paywall.
**Stack:** React Native + Expo (existing) · Supabase (backend, DPDP-compliant Mumbai region) · RevenueCat (subscription) · PostHog (analytics) · Sentry (errors).
**Scope:** 13 existing screens + 8 new auth/paywall screens + full Ayurveda content pipeline.
**Tracker:** 8 phases, each with sub-tasks and % weight. Total = 100%.

**⚠ Before coding: §14 lists 8 decisions you must resolve. I'll hold the start signal until those are closed.**

---

## 1. Strategic Pivot — What Changes

| Dimension | Old (offline-first) | New (freemium subscription) |
|---|---|---|
| Data | Device-only | Cloud sync + device cache |
| Account | None | Required (email/magic-link, Apple/Google OAuth) |
| Monetization | None | ₹199/mo · ₹1,499/yr · 7-day trial |
| USP | Privacy-first free app | Ayurveda × science · phase-reactive daily wisdom |
| Content | Bundled JSON | Server-delivered, CMS-curated, versioned |
| Backend | None | Supabase (Postgres + Auth + Storage + Edge Functions) |
| Compliance | Minimal | DPDP Act (India) · Apple Health Data · Google Play sensitive data |

**What stays:** The full visual design system (Page 2 + Page 3 + Page 4 in Figma) is usable as-is. Phase-theming architecture (variables with 4 modes) is ideal for this product.

---

## 2. Market + Competitive Analysis

### Global cycle trackers

| App | Free | Premium (USD) | USP | Weakness |
|---|---|---|---|---|
| **Flo** | ✓ | $9.99/mo, $49.99/yr · Free in India via "Pass It On" | Largest dataset, AI predictions, community | Generic Western framing; no Ayurveda |
| **Clue** | ✓ | $9.99/mo, $39.99/yr | Science-grounded, Berlin, privacy-first | Visual dated, dry tone |
| **Stardust** | ✓ | $2.99/wk | Moon-cycle aesthetic, Gen-Z vibe | Thin on science, astrology-leaning |
| **Ovia Fertility** | ✓ | Freemium | Fertility-focused, clinical | Ugly, fertility-only |
| **Hormona** | ✓ | ~$14.99/mo | Hormone-test integration, UK | Expensive, requires tests |

### Indian Ayurveda/wellness apps

| Brand | Model | Price | Overlap |
|---|---|---|---|
| **Gynoveda** | Ayurvedic supplements (for PCOS, periods, fertility) | Products ₹1500-3000/month course | Not a tracker — sells herbs |
| **Nirva** | Ayurveda coaching app (diet, yoga, coach chat) | Plans ₹2,500-10,000+/month | Premium coaching layer, not daily tracker |
| **Vedix** | Customized Ayurvedic hair/skin subscription | Products ₹800-1500/mo | Not menstrual — body care |

### Positioning gap (the opening)

**No existing product combines:**
1. Daily menstrual cycle tracking (Flo's job)
2. **Classical Ayurvedic doshic framework applied to your actual phase today** (Rtumaticharya / Ritucharya)
3. **Hormone science overlay** (estrogen/progesterone/LH mapped alongside Vata/Pitta/Kapha)
4. **Phase-reactive UX** that morphs daily so the app *feels* different on day 2 vs day 14
5. **Authentic sourcing** — rituals and wisdom traceable to Charaka/Sushruta/Ashtanga Hridaya, not influencer content

RituChakra's positioning:

> *"Your cycle as seasons. Your seasons as medicine. Grounded in 2,500 years of Ayurveda, validated by hormone science, designed for your inner weather today."*

---

## 3. USP Defense — Why Ayurveda × Science Wins

**Why Ayurveda works culturally (India):**
- Cultural familiarity — Ayurveda is in the water for Indian women.
- Ritucharya (seasonal living) is an intuitive frame — most Indians have heard phrases like "body is more Vata in winter."
- Remedies are locally accessible (sesame oil, ghee, triphala, ashoka, shatavari are in every kirana store).
- Authority structure (classical texts) matches Indian expectations of wisdom-sourcing.

**Why science matters (credibility):**
- Young educated Indian women don't want pure mystical content — they want evidence.
- Pairing dosha framework with hormone curves makes it feel *verified*.
- Protects against "anti-science" backlash or medical criticism.
- Internationalizes well — Western users get the science, learn the Ayurveda gently.

**Why phase-reactive UX is the moat:**
- Flo/Clue look identical on day 1 and day 28. The app doesn't *feel* cyclical.
- RituChakra does (Figma design system already proves this).
- This is a felt-sense differentiator that's hard to replicate — it requires a full color/content system built per phase.

---

## 4. Target User

**Primary (launch):** Urban/semi-urban Indian woman, 22-38.
- Tier-1 + Tier-2 cities: Bangalore, Mumbai, Delhi-NCR, Pune, Hyderabad, Chennai, Ahmedabad, Kochi.
- English-primary, comfortable with Hinglish. Hindi/regional as localization v2.
- Smartphone-native (Android 80% / iOS 20% in India).
- Income: ₹40k-2L/mo (can afford ₹200/mo for wellness).
- Psychographic: interested in yoga, Ayurveda, slow living; frustrated by mainstream cycle apps' tone; may track their cycle today in a notebook or Flo.

**Secondary (v1 late):** Indian diaspora (US/UK/Canada/Singapore/UAE/Australia).
- Dollar pricing; same English content; culturally connected.

**v2:** Non-Indian English-speakers interested in holistic women's health.

---

## 5. Content Strategy — Authentic Ayurvedic Sourcing

### Primary classical sources (Brihat Trayi — The Great Three)

| Text | Author | English translation to reference |
|---|---|---|
| **Charaka Samhita** | Acharya Charaka, c. 300 BCE | P.V. Sharma, Chaukhamba Orientalia, 1981 |
| **Sushruta Samhita** | Acharya Sushruta, c. 600 BCE | K.L. Bhishagratna, Chaukhamba Orientalia, 1991, 3 vols |
| **Ashtanga Hridaya** | Acharya Vagbhata, c. 7th CE | Shri Kanta Murthy, Chaukhamba Orientalia, 1991, 3 vols |

Key chapters to mine:
- *Charaka · Sharira Sthana* (embryology, reproduction, women's physiology)
- *Charaka · Chikitsa Sthana* (treatments, including yoni-vyapat / gynecological disorders)
- *Sushruta · Sharira Sthana* (menstrual physiology, Ritumati concept)
- *Ashtanga Hridaya · Uttara Tantra* (gynecology — Yoni-vyapat-adhyaya)

### Secondary integrative sources (modern credible authors)

| Book | Author | Use |
|---|---|---|
| **Balance Your Hormones, Balance Your Life** | Claudia Welch | Ayurveda+TCM+Western science bridge — our core positioning match |
| **Ayurveda for Women: A Guide to Vitality and Health** | Dr. Robert Svoboda | Practical daily rituals, menstrual regimens |
| **Women's Power to Heal Through Inner Medicine** | Maya Tiwari | Rhythm, biorhythms, lunar junctures — aligns with phase-reactive design |
| **The Complete Book of Ayurvedic Home Remedies** | Dr. Vasant Lad | Recipe-level rituals (oils, teas, foods per phase) |
| **Ayurveda for Women: The Power of Food as Medicine** | Emily L. Glaser + Claudia Welch | Phase-specific food recommendations |

### Content taxonomy (what we'll produce)

```
Ayurveda Library
├── Phase Wisdom (4 phases × 3-5 articles each)
│   ├── Menstrual · inner winter · Apana Vayu
│   ├── Follicular · inner spring · Kapha rebuilding
│   ├── Ovulation · inner summer · Pitta zenith
│   └── Luteal · inner autumn · Pitta→Vata gathering
├── Daily Rituals (40-60 rituals tagged by phase + dosha + ailment)
│   ├── Abhyanga variations, Pichu, Nasya, Gandusha, Shirodhara-adapted
│   ├── Dinacharya (daily routine) adapted per cycle day
│   └── Ritucharya (seasonal layer on top of cycle)
├── Herbs & Foods (25-40 entries with safety notes)
│   ├── Shatavari, Ashoka, Lodhra, Dashamoola, Triphala, Pippali
│   ├── Food pairings per phase (per Charaka's six tastes)
│   └── Contraindications
├── Cycle Disorders (Yoni-vyapat — 8-12 entries)
│   ├── Rajonasha (amenorrhea), Ati-artava (menorrhagia)
│   ├── Krichra-artava (dysmenorrhea), etc.
│   └── Each with disclaimer: "Consult a practitioner for persistent symptoms"
├── Hormone Science Overlay (12-15 explainers)
│   ├── What estrogen actually does on day 7 vs day 14
│   ├── Progesterone + BBT elevation explained
│   └── LH surge, FSH dynamics, prolactin
└── Ritumaticharya (Menstrual Regimen — 4-6 articles)
    ├── Classical do's/don'ts from Charaka & Sushruta
    └── Modern adaptations (no "shouldn't bathe" myths)
```

### Content production workflow

**Phase A — Foundation (weeks 1-4 parallel to coding):**
1. I draft each Ayurveda Library article using the primary + secondary sources cited above.
2. Each article: 400-800 words, cites source (e.g. "*Ashtanga Hridaya Uttara Tantra 33.4*"), includes science overlay where applicable.
3. All drafts reviewed by a qualified Ayurvedic practitioner (BAMS degree) before publishing — **non-negotiable for credibility and legal safety**.

**Phase B — Ongoing:** Monthly new articles; community feedback loop; practitioner Q&A later.

⚠ **Critical decision §14.3:** Who is the reviewing Ayurvedic practitioner? This is a blocker for content launch.

---

## 6. Feature Set

### Free tier (no subscription)
- Cycle tracking: period log, day count, phase detection
- Calendar view with phase-colored days
- Daily greeting with phase name + 1-line tagline
- Basic predictions (next period, ovulation window)
- Quick log (flow, mood, simple symptoms)
- **5-10 "teaser" Ayurveda articles** (hook: "Unlock 200+ more with Premium")
- Export cycle data (CSV)

### Premium tier (₹199/mo)
- **Full Ayurveda Library** (Phase Wisdom + Rituals + Herbs + Disorders)
- **Daily phase-personalized ritual recommendations** (today's ritual card)
- **Rhythm/Insights** — hormone curves, pattern detection, month-over-month analysis
- **Ritucharya seasonal overlay** (how the current calendar season modifies your phase)
- **Extended tracking:** 20+ symptoms, sleep, digestion (agni), energy, libido, social
- **Phase Intro modals** — full-screen phase-change takeover with poetic + practical onboarding
- **Cycle history** with pattern insights
- **Data export** (PDF report with Ayurveda context, shareable with practitioner)
- **Reminder system** (morning ritual, period prediction, luteal dip check-in)
- **No ads** (there are none in free either, but this reinforces the promise)

### v2 (post-launch)
- Practitioner directory + chat (like Nirva but lighter)
- Community (private, phase-synced circles)
- Recipes per phase (Vasant Lad-sourced)
- Partner/family sharing mode
- Hindi + Tamil + Telugu localization
- Apple Health / Samsung Health sync
- Apple Watch complication
- AI coach (GPT-wrapped, carefully fenced)

---

## 7. Complete Screen Inventory

### ✅ Already designed (Page 3 "App Screens" in Figma)

| # | Screen | Status |
|---|---|---|
| 01 | Onboarding Welcome | ✅ designed |
| 02 | Onboarding Last Period | ✅ designed |
| 03 | Onboarding Cycle Length | ✅ designed |
| 04 | Today (Home) · 4 phase variants | ✅ designed |
| 05 | Calendar | ✅ designed |
| 06 | Rhythm / Insights | ✅ designed |
| 07 | Learn library | ✅ designed |
| 08 | You / Settings | ✅ designed |
| 09 | History / Past Cycles | ✅ designed |
| 10 | Ritual Detail Modal | ✅ designed |
| 11 | Quick Log Sheet | ✅ designed |
| 12 | Phase Intro Modal | ✅ designed |
| 13 | Settings · Notifications | ✅ designed |

### 🟡 New screens required (not yet designed)

| # | Screen | Priority | Depends on |
|---|---|---|---|
| 14 | Auth · Sign In (email + magic-link + Google + Apple) | P0 | — |
| 15 | Auth · Sign Up | P0 | — |
| 16 | Auth · Email Verify / Magic-link sent | P0 | — |
| 17 | Paywall · Main subscription offer | P0 | Feature-gated content |
| 18 | Paywall · Contextual upsell (inline on blocked articles) | P1 | — |
| 19 | Subscription · Manage (in Settings) | P0 | RevenueCat integration |
| 20 | Account · Profile edit | P1 | Auth |
| 21 | Account · Delete confirmation | P0 (DPDP compliance) | Auth |
| 22 | Settings · Data Export | P1 | — |
| 23 | Article reader (Ayurveda library detail view) | P0 | Content CMS |

Existing screens needing updates:
- **Onboarding flow:** insert auth (sign-up) between Welcome and Last Period
- **Settings/You:** add Subscription, Account, Sign-out rows
- **Learn:** add lock icons on Premium articles, "Unlock with Premium" inline CTA
- **Today:** show phase card as teaser for non-subscribers on premium features

**Design work remaining: ~10 screens.** I'll design these after spec approval (~1 day of Figma work).

---

## 8. Stack Recommendation

### Frontend
- **React Native + Expo SDK 54+** (already set up)
- **Expo Router** (file-based routing — already in use)
- **NativeWind / Tailwind** (or plain StyleSheet — to decide)
- **React Native Reanimated 3** (for phase-transition animations)
- **Expo Blur / LinearGradient / Svg** (for glassmorphism and gradient mesh)

### Backend — Supabase (recommended)

**Why Supabase over Firebase/Convex for this product:**

| Dimension | Supabase | Firebase | Convex |
|---|---|---|---|
| India data residency | ✅ ap-south-1 (Mumbai) | ❌ no India region (closest: Singapore) | ❌ no India region |
| DPDP compliance | ✅ easy (data localization supported) | ⚠ requires workarounds | ⚠ requires workarounds |
| Cost predictability | ✅ tier-based | ❌ per-read (can balloon) | ✅ usage-based |
| Open-source / self-host | ✅ yes | ❌ no | ❌ no |
| SQL (useful for cycle analytics) | ✅ Postgres | ❌ NoSQL | ⚠ TypeScript DSL |
| RN/Expo SDK maturity | ✅ official docs | ✅ mature | ✅ supported |
| Row-level security | ✅ built-in | ⚠ manual rules | ✅ built-in |

**→ Recommendation: Supabase, Mumbai region, self-host fallback option reserved.**

### Subscription — RevenueCat
- Cross-platform subscription state management
- Handles Google Play + App Store IAP + web billing (for v2 web portal)
- Freemium pattern well-supported
- ₹0 up to $2.5k MTR, then 1% cut — fine for bootstrap
- **India-specific:** UPI Autopay works through Google Play Billing (post-Nov 2022)

### Auth
- **Supabase Auth** with:
  - Email + password
  - Magic link (primary for low-friction)
  - Google OAuth
  - Apple OAuth (mandatory for iOS review if Google is offered)

### Analytics — PostHog (self-hostable, GDPR/DPDP-friendly)
Alternative: Mixpanel (hosted, has India infra).

### Error tracking — Sentry

### Content CMS — Hybrid approach
- Authoring: Notion (writer-friendly) or directly in markdown in a `content/` folder in repo
- Delivery: Supabase tables (`articles`, `rituals`, `herbs`) populated via migration script
- Images: Supabase Storage
- Versioning: git for markdown, timestamp columns in Supabase

**Why not a paid CMS (Sanity, Contentful):** Overkill for MVP content volume. Revisit in v2 if content team grows.

---

## 9. Data Model (Postgres / Supabase)

```sql
-- Auth handled by Supabase Auth (auth.users table)

-- Public user profile
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  cycle_length_avg int default 28,
  period_length_avg int default 5,
  last_period_start date,
  timezone text default 'Asia/Kolkata',
  locale text default 'en-IN',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Subscription state (mirrored from RevenueCat via webhook)
create table subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  revenuecat_id text unique,
  entitlement text, -- 'premium' or null
  period_type text, -- 'trial' | 'intro' | 'normal'
  expires_at timestamptz,
  will_renew boolean,
  store text, -- 'play_store' | 'app_store' | 'stripe'
  updated_at timestamptz default now()
);

-- Cycles (one row per menstrual cycle)
create table cycles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  start_date date not null, -- day 1 of period
  end_date date, -- null if current cycle
  length int,
  period_length int,
  notes text,
  created_at timestamptz default now()
);

-- Daily entries
create table entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  cycle_id uuid references cycles(id) on delete cascade,
  date date not null,
  phase text, -- menstrual | follicular | ovulation | luteal
  cycle_day int,
  flow text, -- none | spot | light | medium | heavy
  moods text[],
  symptoms text[],
  energy int, -- 1-5
  sleep_hours numeric,
  digestion text, -- agni quality
  libido int,
  note text,
  created_at timestamptz default now(),
  unique(user_id, date)
);

-- Phase events (for history / phase-intro triggers)
create table phase_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  phase text,
  occurred_at timestamptz default now(),
  shown_intro_modal boolean default false
);

-- Ayurveda content (articles, rituals, herbs)
create table articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text,
  category text, -- 'phase-wisdom' | 'ritual' | 'herb' | 'disorder' | 'science' | 'regimen'
  phases text[], -- ['follicular', 'ovulation'] — which phases it applies to
  doshas text[], -- ['vata', 'pitta']
  tier text default 'premium', -- 'free' | 'premium'
  body_markdown text not null,
  cover_image_url text,
  reading_minutes int,
  citations jsonb, -- [{text, source, ref}]
  reviewed_by text, -- practitioner name
  reviewed_at timestamptz,
  published boolean default false,
  published_at timestamptz,
  created_at timestamptz default now()
);

-- User saved articles / rituals
create table saved_items (
  user_id uuid references auth.users(id) on delete cascade,
  article_id uuid references articles(id) on delete cascade,
  saved_at timestamptz default now(),
  primary key(user_id, article_id)
);

-- Ritual completions
create table ritual_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  article_id uuid references articles(id) on delete cascade,
  completed_at timestamptz default now(),
  note text
);

-- Notification preferences
create table notification_prefs (
  user_id uuid primary key references auth.users(id) on delete cascade,
  phase_change boolean default true,
  morning_ritual boolean default true,
  period_prediction boolean default true,
  luteal_checkin boolean default false,
  weekly_recap boolean default true,
  quiet_hours_start time default '22:00',
  quiet_hours_end time default '07:30'
);
```

**All tables: Row Level Security (RLS) enabled.** Every user can only read/write their own rows. Articles table has public read for `published = true` rows, write restricted to service role.

---

## 10. Subscription Architecture

### Freemium boundary (where paywall kicks in)

| Feature | Free | Premium |
|---|---|---|
| Cycle tracking + calendar | ✅ | ✅ |
| Phase name + basic greeting | ✅ | ✅ |
| Quick log (basic) | ✅ | ✅ |
| Next period prediction | ✅ | ✅ |
| CSV export | ✅ | ✅ |
| 5-10 teaser articles | ✅ | ✅ |
| **Full Ayurveda Library** | 🔒 paywall | ✅ |
| **Daily ritual recommendation** | 🔒 paywall | ✅ |
| **Rhythm/Insights** | 🔒 paywall | ✅ |
| **Extended tracking (agni, sleep, 20+ symptoms)** | 🔒 paywall | ✅ |
| **Phase intro modals (poetic deep-dive)** | 🔒 paywall | ✅ |
| **PDF report export** | 🔒 paywall | ✅ |
| **Ritucharya seasonal overlay** | 🔒 paywall | ✅ |

### Paywall trigger points

1. **Contextual** — user taps a locked article → modal paywall with "Unlock [article title] + 200+ more"
2. **Scheduled** — after 3 cycles of free use, prompt to upgrade with personalized pattern insight preview
3. **Explicit** — "Upgrade to Premium" button in Settings / You tab

### Trial strategy
- **7-day free trial** on annual plan (not monthly — encourages yearly)
- Trial starts on first paywall tap (not sign-up) to give time to fall in love with free
- Trial reminder push 2 days before expiry
- RevenueCat handles entitlement lifecycle

### Pricing (recommendation — flagged for confirmation in §14)

| Plan | India (INR) | Global (USD) |
|---|---|---|
| Monthly | ₹199 | $3.99 |
| Annual | ₹1,499 (~₹125/mo · 38% savings) | $29.99 (~$2.50/mo · 37% savings) |
| 7-day free trial | On annual only | On annual only |
| Lifetime (optional v2) | ₹5,999 | $89.99 |

**Benchmark rationale:**
- Flo $9.99/mo globally feels *expensive* for Indian market; locals undercut at ₹199 is competitive
- Stardust $2.99/wk ≈ $12/mo — too expensive at parity
- Indian streaming (Spotify ₹119, YouTube Premium ₹129, Netflix ₹199) — ₹199 is the familiar anchor
- Annual at ₹1,499 is psychological sweet spot (under ₹1,500 feels right)

⚠ **Decision §14.5:** Confirm ₹199/₹1,499 or specify your preference.

---

## 11. Compliance & Legal

### DPDP Act 2023 (India) — mandatory

| Requirement | How we meet it |
|---|---|
| Explicit consent before processing | Onboarding consent screen · granular toggles |
| Data minimization | Collect only what's needed (no email unless needed for notifications) |
| Purpose limitation | Cycle data used only for user-facing features — no ad targeting |
| Data localization | Supabase Mumbai region (ap-south-1) |
| Right to access | In-app "Export My Data" (CSV + JSON + PDF) |
| Right to erasure | "Delete my account" with 30-day soft-delete + hard wipe |
| Breach notification | 72-hour disclosure process · Sentry + logs ready |
| Data Protection Officer | Required if data volume > threshold; tbd |
| Consent withdrawal | One-tap in Settings |
| Deadline | Full compliance by **May 13, 2027** |

### Apple App Store Health Data policy (for iOS launch)
- Must disclose data use in App Privacy section
- Cannot share health data with third parties for advertising
- Must provide meaningful health-related user value (✓)

### Google Play sensitive data
- "Personal and Sensitive User Data" disclosure required
- Privacy policy URL mandatory
- Declare data handling practices in Data Safety section

### Legal docs required before launch
- [ ] Privacy Policy (DPDP-compliant · hosted at `rituchakra.app/privacy`)
- [ ] Terms of Service
- [ ] Medical disclaimer ("not medical advice" · boilerplate reviewed by counsel)
- [ ] Refund policy (annual subscription — India consumer law implications)
- [ ] Cookie policy (for future web)

⚠ **Decision §14.6:** Who drafts the legal docs? (Options: template-based with lawyer review; fully engaged lawyer; I can draft first-pass boilerplate.)

---

## 12. Implementation Phases (WITH TRACKER %)

Total = 100%. Each phase has sub-tasks with individual weights. Tracker updated as we build.

---

### Phase 0 · Foundation & Setup — **10%**

| # | Task | Weight | Status |
|---|---|---|---|
| 0.1 | Create Supabase project (ap-south-1 Mumbai) | 1% | ⬜ |
| 0.2 | Create RevenueCat project + configure Play Store + App Store product IDs | 1% | ⬜ |
| 0.3 | Apple Developer + Google Play Console accounts (if not already) | 1% | ⬜ |
| 0.4 | Sentry project · PostHog project | 0.5% | ⬜ |
| 0.5 | Env vars + `.env.local` + `.env.example` in repo | 0.5% | ⬜ |
| 0.6 | Install + configure: `@supabase/supabase-js`, `react-native-purchases`, `@sentry/react-native`, `posthog-react-native` | 1.5% | ⬜ |
| 0.7 | Replace hardcoded colors in `src/theme/colors.ts` with phase-token architecture matching Figma variables | 2% | ⬜ |
| 0.8 | Port Figma text styles to RN typography tokens (`src/theme/typography.ts`) | 1% | ⬜ |
| 0.9 | Port spacing + radius tokens (`src/theme/spacing.ts`, `src/theme/radius.ts`) | 0.5% | ⬜ |
| 0.10 | Set up ESLint + Prettier + TypeScript strict | 1% | ⬜ |

---

### Phase 1 · Auth + Data Model — **12%**

| # | Task | Weight | Status |
|---|---|---|---|
| 1.1 | Write + run Supabase migrations for all tables in §9 | 2% | ⬜ |
| 1.2 | Configure RLS policies for all tables | 1.5% | ⬜ |
| 1.3 | Build Supabase client wrapper (`src/lib/supabase.ts`) with retry + offline queue | 1% | ⬜ |
| 1.4 | Design 8 new screens in Figma (auth + paywall + subscription mgmt) | 2% | ⬜ |
| 1.5 | Build Sign Up screen | 1% | ⬜ |
| 1.6 | Build Sign In screen (email/password + magic link + Google + Apple) | 1.5% | ⬜ |
| 1.7 | Build Email Verify / Magic-link sent screen | 0.5% | ⬜ |
| 1.8 | Insert auth step into onboarding flow (between Welcome and Last Period) | 0.5% | ⬜ |
| 1.9 | Protect routes: redirect unauth users to sign-in | 1% | ⬜ |
| 1.10 | Persist session (secure storage) + auto-refresh tokens | 1% | ⬜ |

---

### Phase 2 · Cycle Tracking MVP (Free Tier Core) — **18%**

| # | Task | Weight | Status |
|---|---|---|---|
| 2.1 | Port existing cycle engine (`src/utils/cycleMath.ts`) to new data model | 2% | ⬜ |
| 2.2 | Rebuild Today/Home screen using phase-theme tokens (bind to current phase) | 2.5% | ⬜ |
| 2.3 | Rebuild Calendar screen with phase-colored days, sync from Supabase | 2.5% | ⬜ |
| 2.4 | Quick-log bottom sheet (create/update `entries` row) | 2% | ⬜ |
| 2.5 | Cycle creation flow (on period start, close current cycle & create new) | 2% | ⬜ |
| 2.6 | Onboarding screens wired: Welcome → Auth → Last Period → Cycle Length → Home | 2.5% | ⬜ |
| 2.7 | Phase detection + prediction engine (pure functions, testable) | 2% | ⬜ |
| 2.8 | History screen with cycle rings (free tier: last 3 cycles) | 1.5% | ⬜ |
| 2.9 | CSV export (free) | 1% | ⬜ |

---

### Phase 3 · Phase-Reactive Theming System — **8%**

| # | Task | Weight | Status |
|---|---|---|---|
| 3.1 | Build `PhaseProvider` context — reads current phase from `entries` | 1.5% | ⬜ |
| 3.2 | `usePhaseTheme()` hook returning current palette (cherry/spring/sun/earth) | 1% | ⬜ |
| 3.3 | Replace hardcoded fills across all screens with theme tokens | 2.5% | ⬜ |
| 3.4 | Smooth color transitions (Reanimated) on phase boundary crossing | 1.5% | ⬜ |
| 3.5 | Phase Intro Modal (full-screen takeover, triggered by phase_events) | 1.5% | ⬜ |

---

### Phase 4 · Subscription + Paywall — **14%**

| # | Task | Weight | Status |
|---|---|---|---|
| 4.1 | RevenueCat SDK integration + `Purchases.configure()` | 1% | ⬜ |
| 4.2 | Product setup in Play Console + App Store Connect (₹199/mo, ₹1,499/yr) | 1% | ⬜ |
| 4.3 | Paywall main screen (subscription offer · design + build) | 2% | ⬜ |
| 4.4 | Contextual paywall (inline on locked articles) | 1.5% | ⬜ |
| 4.5 | Purchase flow + error handling (billing failures, restore purchases) | 2% | ⬜ |
| 4.6 | RevenueCat webhook → Supabase `subscriptions` sync | 2% | ⬜ |
| 4.7 | Entitlement gate: `useIsPremium()` hook + `<PaywallGate>` component | 1.5% | ⬜ |
| 4.8 | Subscription management screen (view, cancel, change plan) | 1.5% | ⬜ |
| 4.9 | Free trial flow + reminder scheduling (day -2 of trial) | 1.5% | ⬜ |

---

### Phase 5 · Ayurveda Content + Learn — **18%**

| # | Task | Weight | Status |
|---|---|---|---|
| 5.1 | Draft article taxonomy + content style guide | 1% | ⬜ |
| 5.2 | **Content batch 1:** 4 Phase Wisdom articles (one per phase) — sourced from Charaka/Sushruta/Welch | 3% | ⬜ |
| 5.3 | **Content batch 2:** 12 daily rituals (3 per phase, tagged by dosha) — sourced from Svoboda/Lad | 3% | ⬜ |
| 5.4 | **Content batch 3:** 8 herb/food entries — sourced from Lad + Glaser | 2% | ⬜ |
| 5.5 | **Content batch 4:** 6 science overlays (hormones, BBT, LH surge) | 2% | ⬜ |
| 5.6 | **Content batch 5:** 4 Ritumaticharya (menstrual regimen) articles — sourced from Ashtanga Hridaya | 2% | ⬜ |
| 5.7 | Practitioner review pass (all articles) | 1% | ⬜ |
| 5.8 | Seed articles into Supabase via migration | 0.5% | ⬜ |
| 5.9 | Build Learn library screen (already designed) | 1.5% | ⬜ |
| 5.10 | Build Article reader screen (markdown renderer + citations) | 1.5% | ⬜ |
| 5.11 | Saved articles + "Save for later" flow | 0.5% | ⬜ |

---

### Phase 6 · Insights / Rhythm / Premium Features — **10%**

| # | Task | Weight | Status |
|---|---|---|---|
| 6.1 | Hormone curve chart component (SVG, 28-day cycle) | 2% | ⬜ |
| 6.2 | Pattern detection engine (`src/engine/PatternCorrelation.ts` enhancements) | 2% | ⬜ |
| 6.3 | Rhythm screen wiring (chart + 3 insight cards) | 1.5% | ⬜ |
| 6.4 | Daily ritual recommendation engine (today's phase + dosha + user's recent log) | 2% | ⬜ |
| 6.5 | Extended tracking (sleep, agni quality, libido, social) | 1.5% | ⬜ |
| 6.6 | Ritucharya seasonal overlay (detect current season · modify recommendations) | 1% | ⬜ |

---

### Phase 7 · Notifications, Polish & Launch — **10%**

| # | Task | Weight | Status |
|---|---|---|---|
| 7.1 | Expo push notifications setup + permission flow | 0.5% | ⬜ |
| 7.2 | Notification scheduling (morning ritual, phase change, period prediction, luteal check-in, weekly recap) | 1.5% | ⬜ |
| 7.3 | Settings · Notifications screen wiring | 1% | ⬜ |
| 7.4 | Account management (edit profile, delete account with confirmation) | 1.5% | ⬜ |
| 7.5 | PDF report export | 1% | ⬜ |
| 7.6 | Privacy Policy + ToS pages (in-app + hosted) | 0.5% | ⬜ |
| 7.7 | Accessibility pass (screen reader labels, contrast, tap targets) | 1% | ⬜ |
| 7.8 | Performance pass (image optimization, bundle size, cold start) | 1% | ⬜ |
| 7.9 | Beta testing via TestFlight + Play Internal Testing (~30 testers) | 1% | ⬜ |
| 7.10 | Store listing assets (screenshots, description, keywords) | 0.5% | ⬜ |
| 7.11 | Submit for review: Apple + Google | 0.5% | ⬜ |

---

### Tracker template (live)

```
PHASE 0: ░░░░░░░░░░ 0% · Foundation & Setup               (10%)
PHASE 1: ░░░░░░░░░░ 0% · Auth + Data Model                (12%)
PHASE 2: ░░░░░░░░░░ 0% · Cycle Tracking MVP               (18%)
PHASE 3: ░░░░░░░░░░ 0% · Phase-Reactive Theming           ( 8%)
PHASE 4: ░░░░░░░░░░ 0% · Subscription + Paywall           (14%)
PHASE 5: ▓▓░░░░░░░░ 20% · Ayurveda Content                (18%)
                        9/~50 articles drafted (pending review)
PHASE 6: ░░░░░░░░░░ 0% · Insights / Rhythm                (10%)
PHASE 7: ▓░░░░░░░░░ 10% · Polish & Launch                 (10%)
                        4/4 legal drafts done (pending lawyer review)
PHASE 8: ░░░░░░░░░░ 0% · AI Coach (Rhythm)                (12%)
                        spec done 2026-04-19 · impl pending
─────────────────────────────────────────────────────────────
TOTAL (112% target): ~3%
```

**Note:** adding Phase 8 (AI Coach) pushes total to 112%. We accept that — dev effort is real, it's not arbitrary. Could rebalance existing phases down ~1% each but prefer keeping task granularity honest.

Updated after every merged PR in this spec file (§12 tracker).

---

## 13. Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│ React Native + Expo (iOS · Android)             │
│ ├── Expo Router (file-based routing)            │
│ ├── PhaseProvider (current phase context)       │
│ ├── SubscriptionProvider (RevenueCat state)     │
│ └── SupabaseProvider (auth + data)              │
└──────────┬───────────────────┬───────────┬──────┘
           │                   │           │
    ┌──────▼─────┐      ┌──────▼──────┐   │
    │ Supabase   │      │ RevenueCat  │   │
    │ (Mumbai)   │      │             │   │
    │            │      └──────┬──────┘   │
    │ · Auth     │             │          │
    │ · Postgres │       ┌─────▼─────┐    │
    │ · Storage  │       │ App Store │    │
    │ · Edge Fns │       │ + Play    │    │
    │ · RLS      │       │ Billing   │    │
    └──────┬─────┘       └─────┬─────┘    │
           │                   │           │
           └────────┬──────────┘           │
                    │                      │
                    │ webhook              │
                    ▼                      │
           ┌─────────────────┐             │
           │ Supabase webhook │            │
           │ handler (edge fn)│            │
           │ → syncs sub state│            │
           └──────────────────┘            │
                                           │
                                   ┌───────▼────────┐
                                   │ PostHog        │
                                   │ + Sentry       │
                                   └────────────────┘
```

---

## 14. Decisions — Resolved (2026-04-18)

### 14.1 Brand name — "RituChakra" · **Soft-blocker · clearance needed before marketing**

**My research findings:**
- "RituChakra" is a Sanskrit compound meaning *cycle of seasons* (ritu = season, chakra = cycle/wheel). It's rooted in the Ayurvedic concept of *Ritucharya*.
- Existing non-software usage found:
  - Rituchakra incense stick brand (design concept, packaging)
  - Rituchakra — novel by Ilachandra Joshi (Hindi literature)
  - Ritu Chakra: The Circle of Seasons — music album by Surya Vakkalanka
  - Ritu Chakra — painting by Durga Bai Vyam
  - Rituchakra — Darpana theatrical production
- These are in classes 3 (incense), 16 (books), 9 (music recordings), 41 (entertainment) — NOT overlapping with the relevant classes for an app.
- **Relevant TM classes for us:** Class 9 (downloadable software, mobile apps) + Class 42 (SaaS / platform services) + Class 44 (health & wellness advisory).

**Next steps (you + a TM lawyer):**
1. Run formal search at [IP India public search](https://tmrsearch.ipindia.gov.in/tmrpublicsearch/) — I cannot do this via web fetch (JS-rendered form). Takes ~10 min. Search "RituChakra" + "Ritu Chakra" + "Rithu Chakra" in **Class 9, 42, 44**.
2. Run USPTO TESS search for US: [tmsearch.uspto.gov](https://tmsearch.uspto.gov/search/) — same three spellings.
3. If clean → engage a TM attorney (budget ₹8,000–15,000 per class) to file a combined word + device mark. I recommend Vakilsearch, LegalRaasta, or a personal IP lawyer.
4. Because "cycle of seasons" is a **descriptive mark**, filing as a stylized logo is stronger than plain text.

**Risk assessment:** LOW to MEDIUM. The non-software uses don't block us. But descriptive Sanskrit marks are weaker — acquired distinctiveness through use will matter.

**Fallback names** (if clearance fails): *Rituwisdom · Rhitya · Chandrika · Rtu · Shakti Cycle · Aarya Cycle*. I'll workshop alternatives if needed.

**Dev/design can proceed under "RituChakra" codename** — rebrand cost is non-trivial but manageable (Figma variables + a few copy strings). Marketing spend should wait until TM clears.

---

### 14.2 Domain — **Deferred to post-dev-testing** ✓

No blocker. Sample Phase 7 launch task: register `rituchakra.app` + `.com` (budget ₹1,500–3,000). I'll remind you when Phase 6 wraps.

---

### 14.3 Ayurvedic practitioner reviewer — **You have contacts · confirm before Phase 5 kickoff**

No blocker for Phase 0–4. Content work (Phase 5) cannot merge without BAMS-qualified reviewer sign-off per §5. Budget ~₹500–1,000 per article for review pass, or a flat monthly retainer.

---

### 14.4 Apple + Google Developer accounts — **New accounts needed · setup guide below**

| | Apple Developer | Google Play Console |
|---|---|---|
| Cost | $99/year (~₹8,300) | ₹2,000 one-time |
| Required | For iOS builds + TestFlight | For Android builds + Play Internal Testing |
| Signup URL | https://developer.apple.com/programs/ | https://play.google.com/console/signup |
| Account type | Individual or Organization (Organization needs DUNS number + takes ~2 weeks for DUNS) | Individual or Organization |
| Recommendation | Individual for MVP → upgrade to Organization at v1.0 launch | Organization if you have a business entity, else Individual |
| What I need from you | Paid account active + invite me as developer (if I'm coding) OR credentials | Same |

**Action:** Create both accounts this week. Ping me with Team ID (Apple) and Developer account email (Google) when done. Phase 0 task 0.3 tracks this.

---

### 14.5 Pricing — **Market research complete · recommendation: ₹199/mo · ₹1,499/yr**

**Indian benchmarks (2026):**

| App | Category | Monthly | Annual |
|---|---|---|---|
| HealthifyMe Smart | Wellness · diet tracking | ₹208 | ~₹1,500 (annual save 30-50%) |
| HealthifyMe 1-Coach | Wellness · personalized | ₹1,500+ | ~₹9,000+ |
| Netflix Mobile India | Entertainment | ₹149 | ₹1,788 |
| Netflix Standard India | Entertainment | ₹499 | ₹5,988 |
| Spotify Premium India | Music | ₹119 | ₹1,189 |
| YouTube Premium India | Video | ₹129 | ₹1,290 |
| Flo Premium (global) | Cycle tracking | ~₹830 equivalent | ~₹4,200 equivalent |
| Gynoveda (product, not app) | Ayurveda supplements | ₹1,200-1,400 | — |
| Nirva Health (coaching) | Wellness + coach chat | ₹2,500-10,000+ | — |

**Indian digital-fitness ARPU (Statista 2025):** $28.05/user/year (~₹2,350/year).
**User penetration:** 10.1% in 2025, projected 12.3% by 2029.

**My recommendation (confirmed):**

| Plan | India (INR) | Global (USD, v2) |
|---|---|---|
| **Monthly** | **₹199** | $3.99 |
| **Annual** | **₹1,499** (~₹125/mo · 38% savings) | $29.99 (~$2.50/mo) |
| 7-day free trial | Annual only | Annual only |

**Rationale:**
- ₹199/mo matches the Netflix Standard India anchor (familiar, psychologically "fair").
- Sits just below HealthifyMe Smart ₹208 — positions as accessible wellness, not luxury.
- ₹1,499/yr stays under the ₹1,500 psychological line.
- Targets ARPU of ~₹700-900/year (accounting for trial failures, monthly churn, discount promos) — roughly 30-40% of India digital fitness ARPU, which is a realistic capture given freemium nature.
- A/B test opportunity at Month 3+: try ₹249/mo · ₹1,999/yr to test price elasticity for premium positioning.

**Locked for launch: ₹199/mo · ₹1,499/yr.**

---

### 14.6 Legal docs — **Option A: I draft boilerplate → lawyer review** ✓

I'll draft the following using DPDP-compliant templates in Phase 7:
- Privacy Policy
- Terms of Service
- Medical Disclaimer
- Refund Policy
- Cookie Policy (for future web)

Budget ₹15,000–30,000 for lawyer review pass. Recommended firms: Khaitan & Co (premium), LexStart (startup-friendly), or a personal IP/consumer lawyer.

---

### 14.7 Content workflow — **Option A: I draft → practitioner reviews → you approve → publish** ✓

Pipeline per article:
1. I draft (cited from Charaka/Sushruta/Ashtanga Hridaya + Welch/Svoboda/Tiwari/Lad). 400-800 words with citation block.
2. Practitioner reviews for accuracy, flags anything outside classical authority.
3. You approve voice + tone (e.g. "too clinical," "more warmth").
4. I revise, publish to Supabase `articles` table.

Target cadence: ~5-8 articles per week during Phase 5.

---

### 14.8 Launch market — **India-only** ✓

Phase 0-7 scoped for India only:
- INR pricing
- Mumbai Supabase region
- Play Store primary (iOS secondary — build both, but no US App Store listing at launch)
- English + Hinglish copy, Hindi localization deferred to v2

Diaspora and global launch deferred to **v1.5** (post-launch month 3+), driven by data. No architecture changes needed to flip (Supabase supports multi-region, RevenueCat supports multi-currency, already designed for it).

---

## 14b. New Action Items Emerging from Decisions

| # | Owner | Action | Priority | Deadline |
|---|---|---|---|---|
| A1 | You | Run trademark search at IP India portal (Class 9, 42, 44) for "RituChakra" · "Ritu Chakra" · "Rithu Chakra" | HIGH | Before marketing spend |
| A2 | You | Create Apple Developer account ($99/yr) | HIGH | Before Phase 0.3 (task ~2 weeks in) |
| A3 | You | Create Google Play Console account (₹2,000) | HIGH | Before Phase 0.3 |
| A4 | You | Confirm BAMS practitioner + agree on ~₹500-1,000/article review rate | MEDIUM | Before Phase 5.1 (est. ~8 weeks in) |
| A5 | Me | Design 10 missing screens (auth, paywall, subscription mgmt, account, article reader) | HIGH | Before Phase 1.4 |
| A6 | Me | Draft legal doc boilerplate (Privacy, ToS, Disclaimer, Refund) | MEDIUM | Before Phase 7.6 |
| A7 | Me | Draft content style guide + taxonomy (Phase 5.1) | MEDIUM | Before Phase 5 kickoff |
| A8 | You + TM lawyer | File trademark once search is clean | MEDIUM | Before public launch |

**Soft-blocker list (won't stop dev, but launch-blocking):**
- A1 trademark search
- A4 practitioner confirmation
- A6 legal review

**Low-priority (v2 scope):**
- Localization (Hindi/Tamil/Telugu)
- Apple Watch complication
- Partner/family sharing mode
- Diaspora launch

---

## 15. Ready-to-Code Checklist

Status key: ✅ done · 🟡 soft-blocker (dev can proceed) · 🔴 hard-blocker (must clear before the task)

### Phase 0 prerequisites (start gate)
- [x] Spec reviewed + approved
- [x] §14 decisions 14.1–14.8 resolved
- [ ] 🔴 Apple Developer account active — **A2**
- [ ] 🔴 Google Play Console account active — **A3**
- [ ] 🔴 Supabase project created (Mumbai ap-south-1, note URL + anon key)
- [ ] 🔴 RevenueCat project created (note public key)
- [ ] 🔴 Sentry project created (note DSN)
- [ ] 🔴 PostHog project created (note API key)

### Phase 5 prerequisites (content gate)
- [ ] 🟡 Practitioner reviewer confirmed (A4)
- [ ] 🟡 Content style guide drafted (A7 — my task)

### Phase 7 prerequisites (launch gate)
- [ ] 🔴 Trademark search clean or alternative name chosen (A1)
- [ ] 🔴 Domain registered
- [ ] 🔴 Privacy Policy + ToS drafted (A6) + lawyer-reviewed
- [ ] 🔴 Apple Privacy disclosure complete
- [ ] 🔴 Google Play Data Safety section complete
- [ ] 🔴 Refund policy published
- [ ] 🟡 Legal email (legal@rituchakra.app) set up

---

## 16. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Ayurvedic content criticized by medical community | M | H | Clear "not medical advice" disclaimers · cite classical sources · practitioner review · evidence overlay |
| Brand name conflicts in India | L | H | Trademark search **before** any marketing spend |
| Play Store UPI billing failures (India has 30%+ failure rate) | H | M | RevenueCat handles retries · show grace-period UX · email + in-app reminders |
| DPDP compliance gaps at scale | M | H | Mumbai region from day 1 · data minimization by design · delete-account working on day 1 |
| Free-tier users never convert | M | H | Value-stack free so they stay · phase-change moments are paywall triggers (emotionally primed) · pattern insights at cycle 3 |
| Apple rejection for health data | L | H | App Privacy section disclosed fully · HealthKit not used initially (avoids HIPAA-adjacent complications) |
| Content volume insufficient at launch | M | M | Launch with 30 well-sourced articles is fine — "quality over quantity" reinforces authenticity brand |
| Writer/practitioner bottleneck | M | M | Buffer 4 weeks of content head-start before launch |

---

## 17. Success Metrics (post-launch)

| Metric | 3-month target | 6-month target |
|---|---|---|
| Installs | 10,000 | 50,000 |
| MAU / Install | 40% | 50% |
| D30 retention | 25% | 35% |
| Free → Trial conversion | 8% | 12% |
| Trial → Paid conversion | 40% | 50% |
| Paid MRR | ₹80k | ₹5L |
| Avg rating | 4.3+ | 4.5+ |
| Article completion rate | 50% | 60% |
| Cycle logged days / month | 18 | 22 |

---

## 18. What I'll Do Next (upon your approval)

1. **Design the 10 missing screens in Figma** (auth flow, paywall, subscription mgmt, account, article reader)
2. **Set up Phase 0 infrastructure** (Supabase project, RevenueCat, Sentry, PostHog)
3. **Port Figma variables to RN theme tokens** (`src/theme/*.ts`)
4. **Begin Phase 1** (auth + data model)
5. **In parallel, start content Phase 5** — I'll draft the first batch of Ayurveda articles citing classical sources, ready for practitioner review

Each completed task will update the tracker in §12 of this file. I'll check in for your review at each phase boundary (0→1, 1→2, etc.), and any time a decision surfaces that wasn't in §14.

---

## Sources

- [Flo Health pricing and subscription details](https://help.flo.health/hc/en-us/articles/4411278780564-What-is-the-price-for-a-Flo-subscription)
- [Flo "Pass It On" program (India free access)](https://flo.health/newsroom/pass-it-on-project)
- [Best Period Tracker Apps 2026 comparison](https://www.go-go-gaia.com/blog/how-to-choose-period-tracker-app.html)
- [Stardust cycle app pricing](https://www.mindfulsuite.com/reviews/best-period-tracker-apps)
- [Ayurveda menstrual cycle — Ritumaticharya](https://www.apollopharmacy.in/momverse/a/rajaswalacharya-ayurveda-menstrual-health)
- [Banyan Botanicals Ayurvedic cycle guide](https://www.banyanbotanicals.com/pages/ayurvedic-healthy-cycle-guide)
- [Brihat Trayi — 3 foundational Ayurvedic texts](https://www.easyayurveda.com/2016/09/12/brihat-trayi-3-treatises-form-foundation-ayurveda/)
- [Ancient Ayurvedic writings (Ayurvedic Institute)](https://ayurveda.com/blog/the-ancient-ayurvedic-writings/)
- [Charaka Samhita (English translation info)](https://pmc.ncbi.nlm.nih.gov/articles/PMC11782805/)
- [Claudia Welch books](https://drclaudiawelch.com/shop/books/)
- [Robert Svoboda · Ayurveda for Women](https://www.amazon.com/Ayurveda-Women-Robert-Svoboda/dp/0715308556)
- [DPDP Act 2023 guide for healthcare](https://truecopy.in/blog/dpdp-act-2023-guide-for-the-healthcare-industry/)
- [DPDP Act 2026 compliance guide (Phase 1)](https://secureprivacy.ai/blog/india-dpdp-act-phase-1)
- [RevenueCat React Native docs](https://www.revenuecat.com/docs/getting-started/installation/reactnative)
- [RevenueCat Freemium Paywalls playbook](https://www.revenuecat.com/docs/playbooks/guides/freemium)
- [Google Play UPI Autopay for subscriptions](https://blog.google/intl/en-in/products/platforms/now-pay-for-subscriptions-via-upi-on-google-play/)
- [Supabase vs Firebase vs Convex 2026](https://www.vibestack.io/blog/supabase-vs-firebase-vs-convex-2026)
- [Expo + Supabase integration guide](https://docs.expo.dev/guides/using-supabase/)
- [Gynoveda about page](https://gynoveda.com/pages/about/)
- [Nirva healthcare plans](https://www.nirvahealth.com/blog/nirva-healthcare-services-cost-effective)
- [Women's Power to Heal Through Inner Medicine — Maya Tiwari](https://www.jasminehemsley.com/friends-of-east-by-west/2021/2/15/dr-claudia-welch)

---

*End of spec · 2026-04-18*
