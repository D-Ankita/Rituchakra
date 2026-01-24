# RituChakra · Session Status — 2026-04-18/19

> **READ THIS FIRST WHEN YOU RETURN.** This document is the index of everything produced in the autonomous session.

## ✨ Update 2026-04-20 — Full "all" batch complete

Executed all four autonomous tasks:

| Task | Output | Path |
|---|---|---|
| 1 · AI eval set v1 | 50 cases (normal/adversarial/redflag/out-of-scope/low-confidence) with typed schema + target pass rates | [`eval/cases.ts`](../eval/cases.ts) |
| 2 · RAG embedding pipeline | TypeScript script · reads `/content/**/*.md` · chunks ~300 tokens with section awareness · embeds via OpenAI · upserts to `article_chunks` · supports `--dry-run` and `--slug=X` | [`scripts/build-rag-index.ts`](../scripts/build-rag-index.ts) |
| 3 · Phase 1 runbook | 10-task step-by-step · Supabase CLI + migrations + RLS verification + auth wiring + session persistence | [`docs/PHASE_1_RUNBOOK.md`](PHASE_1_RUNBOOK.md) |
| 4 · 12 new articles | 5 herbs + 4 hormone science + 3 ritumaticharya | `/content/herbs/`, `/content/hormone-science/`, `/content/ritumaticharya/` |

### Content library now at 21 articles (15-threshold crossed ✓)

**Phase Wisdom (4, prior):** menstrual · follicular · ovulation · luteal

**Daily Rituals (5, prior):** welcome ritual · castor oil belly pack · sesame abhyanga · nadi shodhana · slow kitchari

**Herbs (5, new):** [shatavari](../content/herbs/01-shatavari.md) · [ashoka](../content/herbs/02-ashoka.md) · [lodhra](../content/herbs/03-lodhra.md) · [triphala](../content/herbs/04-triphala.md) · [turmeric](../content/herbs/05-turmeric.md)

**Hormone Science (4, new):** [estrogen](../content/hormone-science/01-estrogen-the-rise.md) · [progesterone](../content/hormone-science/02-progesterone-the-hold.md) · [LH surge](../content/hormone-science/03-lh-surge.md) · [BBT](../content/hormone-science/04-basal-body-temperature.md)

**Ritumaticharya (3, new):** [classical regimen](../content/ritumaticharya/01-rajasvala-charya.md) · [myths debunked](../content/ritumaticharya/02-period-myths-debunked.md) · [modern working-woman adaptation](../content/ritumaticharya/03-modern-rajasvala.md)

### Critical review pass on the new work

✓ **Eval set** — 50 cases cover all 5 categories at target ratios · typed schema lets it plug directly into CI · notes per case explain non-obvious expectations (emotional manipulation, cultural myths, etc.)
✓ **RAG pipeline** — chunks by h2/h3 headings first then slide-window (preserves section semantics) · respects OpenAI dimensions · idempotent on re-run · dry-run mode tested
✓ **Phase 1 runbook** — every step has concrete commands · includes common pitfalls section · flags when to return to user (e.g., OAuth provider setup requires their click-through)
✓ **Articles** — all cite classical texts with chapter/verse + translator · all cite modern peer-reviewed sources · all have "when to see a doctor" where applicable · all tier-correctly set (free = foundational, premium = deeper wisdom) · all `published: false` pending BAMS review
✓ **Voice consistency** — same tone, same structure, same Sanskrit-on-first-use-then-translate pattern across all 12 articles
⚠ Two claims I want the practitioner to specifically verify:
  - Ashoka paper citations (research quality varies across traditional Indian journals)
  - Exact verse number *Ashtanga Hridaya 1.24* for rajasvala-charya — it's the right chapter, verse number approximate

### Spec tracker — updated progress

```
PHASE 0: ░░░░░░░░░░  0% · Foundation & Setup
PHASE 1: ▓░░░░░░░░░  5% · Auth + Data Model (runbook + migrations drafted)
PHASE 2: ░░░░░░░░░░  0% · Cycle Tracking MVP
PHASE 3: ░░░░░░░░░░  0% · Phase-Reactive Theming
PHASE 4: ░░░░░░░░░░  0% · Subscription + Paywall
PHASE 5: ▓▓▓▓░░░░░░ 40% · Ayurveda Content (21 articles drafted)
PHASE 6: ░░░░░░░░░░  0% · Insights / Rhythm
PHASE 7: ▓░░░░░░░░░ 10% · Polish & Launch (legal drafted)
PHASE 8: ▓░░░░░░░░░ 10% · AI Coach (eval set + pipeline + migration ready)
```

---



New deliverables added today on your ask for **"complete LLM for ayurvedic q&a and every day things"**:

| Deliverable | Path |
|---|---|
| AI Coach spec (architecture · safety · RAG · eval · cost · privacy) | [`docs/superpowers/specs/2026-04-19-ai-coach-design.md`](superpowers/specs/2026-04-19-ai-coach-design.md) |
| SQL migration 4 · chat + article_chunks + query_flags + ai_usage | [`supabase/migrations/20260419000001_ai_coach_tables.sql`](../supabase/migrations/20260419000001_ai_coach_tables.sql) |
| 3 Figma screens · Chat · Starter Prompts · Emergency Escalation | Page 3 Row 6 in Figma |
| Medical Disclaimer updated with §8a (AI-generated responses + red-flag protocol) | [`legal/medical-disclaimer.md`](../legal/medical-disclaimer.md) |
| Main spec §12 updated with Phase 8 (12% weight) + progress indicators | [`docs/superpowers/specs/2026-04-18-rituchakra-subscription-pivot.md`](superpowers/specs/2026-04-18-rituchakra-subscription-pivot.md) |

### The AI architecture in one paragraph

A **RAG-grounded chat** (not freeform LLM) using **Claude Sonnet 4.6** as the primary model, **Gemini 2.5 Flash** as the cheap free-tier fallback, **Jina or OpenAI embeddings** against our own article library stored in **Supabase pgvector (Mumbai region)**. Multi-layer safety: input classifier (emergency/injection/out-of-scope) → RAG confidence gate → hardened system prompt → output classifier (diagnosis/prescription/disclaimer detection) → post-processing. 150-query eval set must pass before every deploy. Per-user 3/day free, 50/day premium. Cost estimate at 1,000 DAU: ~₹37k-50k/month.

### AI-specific open decisions (§12 of AI spec)

| # | Decision | Default |
|---|---|---|
| AC.1 | Ship in v1 or v1.5? | **v1.5** — launch without it; add once we have 15+ reviewed articles + eval set passing |
| AC.2 | Primary LLM? | **Claude Sonnet 4.6** (safety-tuned) |
| AC.3 | Free tier limit? | **3 queries/day** |
| AC.4 | Training opt-in/out? | **opt-in** (DPDP explicit consent) |
| AC.5 | AI persona name? | **"Rhythm"** (working name) |
| AC.6 | Who writes the eval set? | **me 50 + practitioner 50 + real anonymized 50** |

### Critical review (AI design)

- ✓ Every safety research finding addressed: RAG for hallucination (40-80% reduction), input classifier for prompt injection (6-38% baseline), red-flag routing, output checks for diagnosis/prescription leaks
- ✓ Cost modeling realistic and freemium-friendly
- ✓ Privacy implications disclosed in Medical Disclaimer + Privacy Policy requires small update for Anthropic/Gemini sub-processors
- ✓ India-friendly architecture (Supabase Mumbai hosts the RAG index; only the LLM call itself goes to US/EU, and that's disclosed)
- ⚠ Minor: citation pill in chat screen overlaps body text in Figma mockup — cosmetic, fix in implementation
- ⚠ Dependency: AI Coach shouldn't ship until 15+ practitioner-reviewed articles exist in the library — guard against weak answers

---

---

## 🎯 Executive summary

- **Design:** all 23 screens live in Figma (13 from earlier + 10 new: auth, paywalls, subscription mgmt, account, article reader).
- **Legal:** 4 drafts (Privacy · ToS · Medical Disclaimer · Refund) ready for your lawyer.
- **Content:** 4 Phase Wisdom articles + 5 Daily Rituals = **9 publishable articles** drafted (all pending BAMS practitioner review).
- **Infrastructure:** Phase 0 setup runbook + 3 Supabase SQL migrations + content-seeding script ready to run.
- **Tracker:** Phase 0 is 0% (ready to start); Phase 5 is ~20% done (content drafts); Phase 7 is ~10% done (legal drafts).
- **Open blockers for coding:** your account setups (Apple/Google/Supabase/RevenueCat/Sentry/PostHog — all detailed in the Phase 0 runbook).

---

## 📁 What was built in this session (files)

### 🎨 Figma (same file, 10 new screens on Page 3)
https://www.figma.com/design/1IUMDK5SkufO67QVW7oess/Rituchakra?node-id=28-2

**Row 4 · Auth + Commerce (screens 14–18):**
- 14 · Sign In · magic-link + Google + Apple
- 15 · Sign Up · with DPDP consent checkbox
- 16 · Email Verify / Magic-link sent
- 17 · Paywall Main · annual + monthly toggle · ₹199/₹1,499
- 18 · Paywall Contextual · inline on blocked article

**Row 5 · Account + Reader (screens 19–23):**
- 19 · Subscription · Manage
- 20 · Account · Profile Edit
- 21 · Account · Delete Confirmation · DPDP-compliant (30-day soft delete + typed DELETE)
- 22 · Settings · Data Export · PDF/CSV/JSON
- 23 · Article Reader · the Ayurveda library detail view

### ⚖️ Legal drafts · `/legal/`
| File | Purpose |
|---|---|
| [`privacy-policy.md`](../legal/privacy-policy.md) | DPDP Act 2023 + Rule 3 notice requirements |
| [`terms-of-service.md`](../legal/terms-of-service.md) | India jurisdiction · CPA 2019 grievance officer · subscription terms |
| [`medical-disclaimer.md`](../legal/medical-disclaimer.md) | Cycle + Ayurveda caveats · India emergency numbers · liability |
| [`refund-policy.md`](../legal/refund-policy.md) | App Store/Play Store routing · CPA 2019 + E-Commerce Rules 2020 |

### 📖 Content system
| File | Purpose |
|---|---|
| [`docs/content/STYLE_GUIDE.md`](content/STYLE_GUIDE.md) | Voice · article template · citation format · taxonomy · review workflow |

### 🌱 Content · Phase Wisdom articles · `/content/phase-wisdom/`
| File | Phase | Tier | Words |
|---|---|---|---|
| [`01-menstrual-inner-winter.md`](../content/phase-wisdom/01-menstrual-inner-winter.md) | Menstrual | Free | ~1,100 |
| [`02-follicular-inner-spring.md`](../content/phase-wisdom/02-follicular-inner-spring.md) | Follicular | Premium | ~1,200 |
| [`03-ovulation-inner-summer.md`](../content/phase-wisdom/03-ovulation-inner-summer.md) | Ovulation | Premium | ~1,500 |
| [`04-luteal-inner-autumn.md`](../content/phase-wisdom/04-luteal-inner-autumn.md) | Luteal | Premium | ~1,500 |

### 🧘 Content · Daily Rituals · `/content/rituals/`
| File | Phase | Tier |
|---|---|---|
| [`01-welcome-first-ritual.md`](../content/rituals/01-welcome-first-ritual.md) | Any | Free |
| [`02-menstrual-warm-castor-oil-belly-pack.md`](../content/rituals/02-menstrual-warm-castor-oil-belly-pack.md) | Menstrual | Free |
| [`03-follicular-warm-sesame-abhyanga.md`](../content/rituals/03-follicular-warm-sesame-abhyanga.md) | Follicular | Free |
| [`04-ovulation-nadi-shodhana.md`](../content/rituals/04-ovulation-nadi-shodhana.md) | Ovulation | Free |
| [`05-luteal-slow-kitchari.md`](../content/rituals/05-luteal-slow-kitchari.md) | Luteal | Free |

### 🏗 Infrastructure scaffolding · `/supabase/migrations/`
| File | What it creates |
|---|---|
| [`20260418000001_initial_schema.sql`](../supabase/migrations/20260418000001_initial_schema.sql) | profiles · subscriptions · cycles · entries · phase_events · notification_prefs · auto-updated-at trigger · handle_new_user trigger |
| [`20260418000002_articles_and_interactions.sql`](../supabase/migrations/20260418000002_articles_and_interactions.sql) | articles (with GIN indexes on phases/doshas) · saved_items · ritual_completions |
| [`20260418000003_rls_policies.sql`](../supabase/migrations/20260418000003_rls_policies.sql) | Row-level security on every user-data table · articles public-read when published |

### 🌾 Content seed script · `/scripts/`
| File | Purpose |
|---|---|
| [`seed-content.ts`](../scripts/seed-content.ts) | Reads `/content/**/*.md` → upserts to Supabase `articles` table · respects practitioner-review gating |

### 📚 Docs · `/docs/`
| File | Purpose |
|---|---|
| [`superpowers/specs/2026-04-18-rituchakra-subscription-pivot.md`](superpowers/specs/2026-04-18-rituchakra-subscription-pivot.md) | Full product spec · research · data model · phased plan with % tracker |
| [`PHASE_0_RUNBOOK.md`](PHASE_0_RUNBOOK.md) | 10-task step-by-step guide for Phase 0 setup · commands + URLs + SDK install |
| [`SESSION_STATUS.md`](SESSION_STATUS.md) | This file |

---

## ✅ Critical review (self-audit)

### Design
- All 10 new screens follow Figma Design System tokens (Page 4)
- DPDP-compliance UX is in: consent granularity, data export visibility, soft-delete with typed confirm
- Flagged for implementation: consent checkbox default unchecked at runtime; email change must trigger re-verify

### Legal
- Privacy policy: every DPDP §4/6/7/8/11-14 and Rule 3 notice clause present
- ToS: India governing law, CPA 2019 grievance officer, subscription auto-renewal disclosure
- Medical Disclaimer: Ayurvedic herb interaction warnings, cycle-tracking caveats, 102/iCall/Vandrevala helplines
- Refund Policy: correctly routes refunds to App Store/Play Store, preserves CPA 2019 rights
- **All four still require Indian lawyer review before publication** — this is Option A (your choice in §14.6)

### Content (9 articles total)
- All follow Style Guide article structure (frontmatter · hook · body · classical lens · practical · doctor red flags · further reading)
- All cite Charaka / Sushruta / Ashtanga Hridaya with translator credits
- All pair Ayurveda with modern biology (hormone levels, neurobiology, evidence)
- All have "when to see a doctor" sections with specific red flags
- **All `published: false` pending BAMS practitioner review** (seed script respects this gate)

### Infrastructure
- 3 migrations are clean, idempotent-ish (will need `drop` before re-run in dev), CHECK constraints on all enum-like fields
- RLS policies enforce "users only see own data" at the database layer — defence-in-depth, not just app-layer
- Seed script is safe to re-run (uses `upsert` on slug) and respects practitioner-review status before publishing

---

## 📊 Spec §12 Tracker — updated

```
PHASE 0 · Foundation & Setup         ░░░░░░░░░░   0%  (ready to start)
PHASE 1 · Auth + Data Model           ░░░░░░░░░░   0%  (migrations drafted, not applied)
PHASE 2 · Cycle Tracking MVP          ░░░░░░░░░░   0%
PHASE 3 · Phase-Reactive Theming      ░░░░░░░░░░   0%
PHASE 4 · Subscription + Paywall      ░░░░░░░░░░   0%
PHASE 5 · Ayurveda Content            ▓▓░░░░░░░░  ~20%  (9/40+ articles drafted, pending review)
PHASE 6 · Insights / Rhythm           ░░░░░░░░░░   0%
PHASE 7 · Polish & Launch             ▓░░░░░░░░░  ~10%  (legal drafted, not reviewed)
──────────────────────────────────────────────────
TOTAL DEV                             ░░░░░░░░░░   0%
```

Content: 9/~50 target articles drafted (18% of library at launch target).
Legal: 4/4 drafts done (100% of drafts · 0% lawyer-reviewed).

---

## 🔴 Blockers that only you can resolve

| Blocker | Phase it blocks |
|---|---|
| Trademark search (IP India portal, Class 9/42/44) | Marketing spend · renaming contingency |
| Apple Developer account ($99/yr) | Phase 0.3 |
| Google Play Console account (₹2,000) | Phase 0.3 |
| BAMS practitioner reviewer confirmed | Phase 5 publish (drafts can continue) |
| Supabase / RevenueCat / Sentry / PostHog project creation | Phase 0.1, 0.2, 0.4 |
| Lawyer engagement for legal review | Phase 7.6 |
| Git commit permission | All files currently on disk, not in git |

---

## 🎯 Next steps when you return

Pick one to start:

1. **"Commit everything" →** I'll stage only the new files (not the pre-existing modified tsx files — those are yours), write a clean commit message, push if you want.

2. **"Start Phase 0" →** Open [`docs/PHASE_0_RUNBOOK.md`](PHASE_0_RUNBOOK.md) and I'll walk you through each step as you do it (account creation, copying keys, etc).

3. **"Keep writing content" →** I can batch through more articles: next up are Ritumaticharya (free tier), Herb references (shatavari · ashoka · lodhra), and Hormone Science explainers (4-5 free pieces).

4. **"Show me screenshots of the 10 new screens" →** I'll screenshot each and show them inline.

5. **"Review X specifically" →** Pick any deliverable to deep-review together.

---

*Session summary written 2026-04-18. Total: 10 screens, 4 legal docs, 1 style guide, 9 articles, 3 SQL migrations, 1 seed script, 2 runbook docs, spec updates.*
