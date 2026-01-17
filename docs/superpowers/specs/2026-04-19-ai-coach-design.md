---
name: RituChakra AI Coach — Architecture, Safety, and Implementation
date: 2026-04-19
status: APPROVED (2026-04-19) · decisions AC.1–AC.6 locked
owner: Ankita Dodamani
depends_on: 2026-04-18-rituchakra-subscription-pivot.md
---

# RituChakra AI Coach — Architecture, Safety, and Implementation

## 0. TL;DR

An AI chat feature inside RituChakra that answers **Ayurvedic and daily wellness questions** specific to the user's current cycle phase. Built on **Retrieval-Augmented Generation (RAG)** grounded in our own practitioner-reviewed content library — not freeform LLM generation. Multi-layer safety guardrails. India-hosted data path. Free tier gets 3 queries/day; Premium gets unlimited.

**Why RAG and not plain LLM?** Research shows RAG reduces medical hallucinations by 40-80%. On unguarded health queries, LLMs hallucinate in 6-38% of cases. We cannot ship that.

**Cost at realistic scale:** ~₹35k/month at 1,000 daily active users with 5 queries each — a meaningful but manageable expense.

**Recommended stack:** Claude Sonnet 4.6 (primary, safety-tuned) + Jina embeddings + Supabase pgvector + custom input/output classifiers.

**Risks acknowledged & mitigated:**
1. Hallucinations → RAG + answer-grounding refusal when retrieval is weak
2. Prompt injection → multi-layer input classifier + system-prompt hardening
3. Missed red-flags ("chest pain", "heavy bleeding") → keyword + LLM classifier → emergency escalation UI
4. Cost blowout → per-user daily caps + aggressive caching + freemium gating

---

## 1. Why this is high-value AND high-risk

### Why it wins

- **Daily engagement loop.** Without AI, the app is a passive tracker. With AI, it's an ongoing dialogue.
- **The Ayurveda library comes alive.** Static articles answer what the user thinks to ask. A coach answers what they *actually* ask.
- **Cultural fit.** Indian women often ask a mother, mother-in-law, or friend ("can I wash my hair on day 2?"). RituChakra becomes that voice — but with modern science + citations.
- **Retention moat.** An AI trained on our content + your own cycle data is impossible to replicate without both.

### Why it could go very wrong

Recent research (JAMA Network Open, 2025):
- LLMs hallucinate medical advice in **6.2% of baseline queries**
- With adversarial emotional manipulation, error rates reach **37.5%**
- **System prompts alone are NOT security** — attacks succeed in 80% of cases across multi-turn follow-ups
- Hallucinations in health context can cause real harm, especially around herb-drug interactions, contraindications, and missed red-flags

Our response: **don't ship without proper guardrails.** This design spec exists to make that concrete.

---

## 2. Scope — what the AI Coach does and doesn't do

### It DOES

- Answer questions about menstrual cycle phases: "why am I tired on day 22?"
- Answer questions about Ayurveda concepts: "what's apana vayu?"
- Answer questions about rituals and practices: "can I do abhyanga during my period?"
- Answer questions about herbs and foods with safety caveats: "is shatavari safe while breastfeeding?"
- Reference the user's logged data: "based on your pattern, you tend to feel X during luteal"
- Cite sources from our article library inline
- Suggest a ritual or article from our library after the answer
- Escalate red-flag symptoms to emergency/doctor CTAs

### It DOES NOT

- Diagnose conditions ("you have endometriosis")
- Prescribe dosages ("take 3g of ashwagandha")
- Replace medical consultation
- Discuss non-reproductive health issues (cancer, heart disease, mental health crises) — refers to doctor
- Answer questions outside the cycle/wellness domain (coding, politics, general chat)
- Pretend to be a doctor, practitioner, or real human
- Remember conversations across sessions without explicit user opt-in (privacy default)

---

## 3. Architecture

```
┌────────────────────────────────────────────────────────────┐
│ User asks in chat: "can I eat curd on day 2?"              │
└─────────────────┬──────────────────────────────────────────┘
                  │
       ┌──────────▼───────────┐
       │ GUARDRAIL LAYER 1    │  Input classifier
       │ • Emergency keywords │  (cheap LLM or regex + Jina classifier)
       │ • Prompt injection   │
       │ • Out-of-scope       │
       └──────────┬───────────┘
                  │
        ┌─ red flag? → route to Emergency UI, don't call main LLM
        ├─ prompt injection? → refuse with generic response
        ├─ out of scope? → polite refusal + suggest library search
        │
        ▼ in scope
       ┌──────────────────────┐
       │ QUERY ENRICHMENT     │  append user's current phase,
       │ • current_phase      │  dosha (if known), cycle day
       │ • user_cycle_data    │  to the query context
       └──────────┬───────────┘
                  │
                  ▼
       ┌──────────────────────┐
       │ RAG RETRIEVAL        │  pgvector similarity search
       │ • embed query        │  over article_chunks
       │ • top-K = 5 chunks   │  filter by phase-relevance
       │ • rerank w/ metadata │
       └──────────┬───────────┘
                  │
        ┌─ retrieved_score < threshold? →
        │   "I don't have a confident answer on this. Try asking
        │    your doctor or an Ayurvedic practitioner." (refusal)
        │
        ▼ confident
       ┌──────────────────────┐
       │ LLM GENERATION       │  Claude Sonnet 4.6
       │ • system prompt      │  + retrieved context
       │ • user query         │  + user metadata
       │ • safety guardrails  │
       └──────────┬───────────┘
                  │
                  ▼
       ┌──────────────────────┐
       │ GUARDRAIL LAYER 2    │  Output classifier
       │ • Diagnosis detect   │  Does response diagnose?
       │ • Prescription detect│  Does it prescribe dosages?
       │ • Disclaimer present │  Check for "consult a doctor" if needed
       │ • Citations valid    │  Do cited chunks exist?
       └──────────┬───────────┘
                  │
        ┌─ fails? → log + return sanitized/shorter answer
        │
        ▼ passes
       ┌──────────────────────┐
       │ POST-PROCESS         │  append citations,
       │ • inject citations   │  related ritual CTA,
       │ • related CTA        │  "ask a doctor" footer
       │ • disclaimer footer  │
       └──────────┬───────────┘
                  │
                  ▼
           RESPONSE TO USER + LOG TO chat_messages
```

---

## 4. Provider selection

### Decision matrix

| Requirement | Claude Sonnet 4.6 | Gemini 2.5 Pro/Flash | GPT-5.2 | Sarvam AI | Krutrim |
|---|---|---|---|---|---|
| Safety tuning for health | ★★★★★ | ★★★★ | ★★★★ | ★★★ | ★★★ |
| India data residency | ❌ (US/EU) | ❌ (US) | ❌ (US) | ✅ India | ✅ India |
| Indic language support | moderate | good | good | excellent | excellent |
| Refusal quality | ★★★★★ | ★★★★ | ★★★★ | unknown | unknown |
| Cost (per M tokens) | $3 in / $15 out | Flash $0.30 / Pro $1.25 | $1.75 / $14 | TBD | TBD |
| Context window | 200K+ | 1M-2M | 400K | moderate | moderate |
| Enterprise DPAs | ✅ | ✅ | ✅ | ✅ native | ✅ native |
| Maturity for RAG | high | high | high | growing | growing |

### Recommendation

**Primary: Claude Sonnet 4.6** (Anthropic) for English queries.
- Reason: best-in-class refusal patterns for health content. Safety culture aligned with our risk tolerance.
- Sub-processor contract via Anthropic's standard DPA. Data does NOT route through India region (US/EU), so Privacy Policy must disclose this.

**Fallback for free tier: Gemini 2.5 Flash** (to control cost on free queries).
- Reason: $0.30/M vs $3/M is 10x cheaper. Use it for the first 3 daily queries of free users.

**Future (v2): Sarvam AI** for Indian language responses.
- Once we add Hindi / Tamil / Telugu support, Sarvam is the DPDP-aligned choice. Their enterprise tier is positioned for health/education sectors.

### Embeddings provider

**Jina AI embeddings v3** (jina-embeddings-v3) or **OpenAI text-embedding-3-small**.
- Jina: $0.02/M tokens, open-source option available, good multilingual.
- OpenAI: $0.02/M tokens, battle-tested, wide ecosystem.
- Either works. Lean OpenAI for MVP, switch to Jina if data-residency becomes a concern.

---

## 5. Safety architecture (the hard part)

### Layer 1 — Input classifier

Runs **before** the main LLM is called. Three checks:

**(a) Emergency / red-flag keyword detection**
Simple regex + keyword list for critical flags. Immediately routes to the **Emergency Escalation UI** (see §7.3).

```
Critical keywords:
- "chest pain", "breathing difficulty", "severe bleeding"
- "suicidal", "want to die", "ending it", "kill myself"
- "soaking through" (+ "hour")
- "ectopic", "severe pain"
- "can't stop bleeding"
```

Supplemented by a lightweight LLM-based classifier (Gemini Flash with a narrow prompt) for fuzzy matches ("I feel like I can't breathe").

**(b) Prompt injection detection**
Common patterns:
- "Ignore previous instructions"
- "You are now..."
- "Act as a medical professional and prescribe..."
- Role-play escape attempts
- Multi-turn grooming (tracked across session)

Action: refuse with a generic message; log the attempt; don't pass the user's content to the LLM.

**(c) Out-of-scope detection**
Domain: cycles · Ayurveda · wellness · the user's logged data.
Out of scope: coding, politics, celebrity, finance, unrelated medical (e.g., dermatology not tied to cycle).

Action: polite refusal with redirect: "I focus on cycle + Ayurveda questions. Try asking about your phase, a ritual, or search the library instead."

### Layer 2 — RAG confidence gate

After retrieval, check:
- Top retrieved chunk similarity score ≥ threshold (e.g., 0.75 cosine)
- At least 3 chunks scoring above threshold, OR flag as low-confidence

If low-confidence:
- Don't generate. Refuse with: "I don't have a confident answer on this. Here's what I found that's related [list 2 article links]. For anything specific to your body, please consult a doctor or a qualified Ayurvedic practitioner."

### Layer 3 — Output classifier

After LLM generates, check for:
- **Diagnosis detection** — does the response contain "you have", "this is", "you're suffering from" [condition]? → rewrite or append disclaimer.
- **Prescription detection** — specific dosages ("take 3g of X"), frequency ("twice daily")? → strip, replace with "ask a practitioner for dosage".
- **Missing disclaimer** — if response discusses a herb, symptom, or condition, verify the "not medical advice" disclaimer is present → append if missing.
- **Invalid citations** — every citation ID must exist in our articles table → strip invalid ones.
- **Length check** — if response is < 30 words or > 600 words, flag for review (LLM likely failed or is rambling).

### Layer 4 — Hard-coded system prompt

```
You are RituChakra, a wellness companion grounded in Ayurveda and modern hormone science.

You help women understand their menstrual cycle and daily wellness questions through the combined lenses of classical Ayurvedic wisdom and contemporary biology.

STRICT RULES:
1. You NEVER diagnose a medical condition. If the user describes symptoms, you describe what Ayurveda says and suggest they consult a qualified BAMS practitioner or physician.
2. You NEVER prescribe specific dosages of herbs or medications.
3. You NEVER replace medical advice. Always include a gentle reminder for anything health-significant.
4. You ONLY answer from the provided context passages. If the context does not contain the answer, you say so and suggest seeking a practitioner's advice.
5. You NEVER claim to be a doctor, practitioner, or real human.
6. You NEVER discuss topics outside menstrual cycle, reproductive health, Ayurveda, or daily wellness.
7. If the user appears to be in crisis (severe symptoms, mental health emergency), you respond with a helpline number and a direction to seek immediate care.
8. Cite the article slug for every claim you make, formatted as [cite:slug].
9. You speak warmly, in second-person, like an older sister who happens to be well-read in both Ayurveda and biology.

CONTEXT (retrieved from library):
{retrieved_chunks}

USER METADATA:
- Current phase: {phase}
- Cycle day: {day}
- Dosha (if known): {dosha}

USER QUESTION:
{user_question}
```

### Layer 5 — Rate limiting + session limits

- **Free tier:** 3 queries/day, max 5 messages per session.
- **Premium:** 50 queries/day, max 20 messages per session.
- **Global:** server-side per-user rate limit of 1 query every 5 seconds (prevents automated scraping).

### Layer 6 — Evaluation set

A growing set of 150+ test queries covering:
- Normal queries (cycle, phase, food, herb, ritual)
- Adversarial queries (prompt injection, emotional manipulation, jailbreak attempts)
- Red-flag queries (bleeding, chest pain, suicidal ideation)
- Out-of-scope queries (coding, celebrity, unrelated medical)
- Low-confidence queries (obscure herbs, rare conditions)

Run every time the system prompt, LLM model, or RAG index changes. **Failing test = block deploy.**

Initial eval set to be authored in Phase 8.2.

### Layer 7 — Audit trail

Every query logs to `query_flags` table with:
- User query (hashed if opted out of training, full if opted in)
- Classifier decisions at each layer
- Retrieved chunks + similarity scores
- LLM raw response
- Final response (post-sanitization)
- Latency breakdown
- Red flag fired (y/n)
- User rating (if provided)

This enables offline analysis, regression detection, and rapid identification of dangerous outputs.

---

## 6. RAG knowledge base

### What goes in the vector index

**Chunking strategy:**
- Each article → split into ~300-token chunks with 50-token overlap
- Preserve section headings as metadata
- Store: `article_id`, `slug`, `chunk_index`, `chunk_text`, `section_heading`, `phases`, `doshas`, `tier`, `embedding`

**Content in the index at launch:**
- 4 Phase Wisdom articles (8-12 chunks each) = ~40 chunks
- 5 Daily Rituals (4-6 chunks each) = ~25 chunks
- As content grows: 200+ articles → ~1,500 chunks

Supabase pgvector handles this scale easily (pgvector benchmarked to millions of vectors).

### Retrieval query pattern

```sql
select
  slug,
  chunk_text,
  section_heading,
  1 - (embedding <=> $query_embedding) as similarity
from article_chunks
where
  ($phase_filter is null or $phase_filter = any(phases))
  and $tier in ('free', 'premium')
order by embedding <=> $query_embedding
limit 5;
```

- `<=>` is cosine distance in pgvector
- Phase filter is applied when user asks phase-specific questions
- Tier filter prevents free users from getting premium content surfaced (but we retrieve premium too — just signal locked in UI)

### Re-ranking

After initial top-5, re-rank by:
- Similarity score (primary)
- Recency (ties broken by `updated_at`)
- Tier (free content bumped up in free-user responses)
- Practitioner-reviewed flag (always prioritized)

---

## 7. UX design

### 7.1 Chat screen (to be designed in Figma)

Layout:
- Top: header with "Ask Rhythm" (the AI's in-app name), back button, settings icon (opens privacy + memory settings)
- Body: chat history, user messages right-aligned (phase-colored), AI responses left-aligned (cream bubble)
- Each AI response includes:
  - Inline citations rendered as taps ("from [Follicular · the inner spring]")
  - Related ritual CTA pill at the bottom ("Try this ritual →")
  - Clear "not medical advice" disclaimer footer, always
- Bottom: input area with phase pill ("you're in follicular") + starter prompts + text field
- Persistent banner: "Ask Rhythm is not a doctor. For urgent symptoms, call 102."

### 7.2 Starter prompts (new user / empty state)

Suggested prompts, phase-aware:

**Menstrual:**
- "Why do I feel cold during my period?"
- "Can I exercise when I'm bleeding?"
- "What food helps with cramps?"

**Follicular:**
- "Why do I feel more creative this week?"
- "Good rituals for rebuilding energy?"
- "Can I intermittent fast during follicular?"

**Ovulation:**
- "Why is my libido higher today?"
- "How do I know I'm ovulating?"
- "Ayurvedic foods to pair with peak energy?"

**Luteal:**
- "Why do I feel bloated before my period?"
- "Is PMS actually real? Science?"
- "What can I eat to help late-luteal mood?"

### 7.3 Emergency escalation UI (triggered by red-flag classifier)

Full-screen modal (not a chat bubble) with:
- Warm, calm tone — not alarming
- "What you described sounds like it deserves real medical attention right now, not an app."
- Three buttons:
  - **Call 102** (India emergency)
  - **iCall (mental health crisis)** — for ideation
  - **Find a nearby hospital** (opens Maps with "hospital near me")
- "Close" is deliberately small and at the bottom

### 7.4 Response rendering

Every AI response gets:
1. The answer (markdown rendered)
2. Inline citations ([cite:slug] → tap to open article)
3. A "Related" pill (ritual or article to go deeper)
4. Feedback: 👍 / 👎 / flag-this-response
5. Footer: "RituChakra is not medical advice."

---

## 8. Data model additions

New Supabase tables (migration 20260419...):

```sql
-- Chat sessions (grouping related messages)
create table chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz default now() not null,
  ended_at timestamptz,
  message_count int default 0,
  phase_at_start text,
  cycle_day_at_start int
);

-- Individual messages
create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references chat_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  model text,  -- e.g., 'claude-sonnet-4-6'
  input_tokens int,
  output_tokens int,
  latency_ms int,
  retrieved_chunks jsonb,  -- [{chunk_id, slug, similarity}]
  classifier_decisions jsonb,  -- {emergency: false, injection: false, scope: 'in_scope'}
  user_rating text check (user_rating in ('positive', 'negative', null)),
  flagged boolean default false,
  created_at timestamptz default now() not null
);

-- Pre-chunked content for RAG (one row per ~300-token chunk)
create table article_chunks (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references articles(id) on delete cascade,
  chunk_index int not null,
  chunk_text text not null,
  section_heading text,
  phases text[],
  doshas text[],
  tier text check (tier in ('free', 'premium')),
  embedding vector(1536),  -- OpenAI text-embedding-3-small dimensions
  created_at timestamptz default now() not null
);

-- Flagged queries for audit / review
create table query_flags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  query_text text not null,
  flag_type text check (flag_type in ('emergency', 'injection', 'out_of_scope', 'low_confidence', 'output_violation')),
  classifier_details jsonb,
  created_at timestamptz default now() not null
);

-- Indexes
create index article_chunks_embedding_idx on article_chunks using ivfflat (embedding vector_cosine_ops);
create index chat_messages_session_idx on chat_messages(session_id, created_at);
create index chat_messages_user_date_idx on chat_messages(user_id, created_at desc);
create index query_flags_type_idx on query_flags(flag_type, created_at desc);

-- RLS policies (abbreviated)
alter table chat_sessions enable row level security;
alter table chat_messages enable row level security;
alter table query_flags enable row level security;

create policy "users see own sessions" on chat_sessions for select using (auth.uid() = user_id);
create policy "users create sessions" on chat_sessions for insert with check (auth.uid() = user_id);
create policy "users see own messages" on chat_messages for select using (auth.uid() = user_id);
-- messages inserted via edge function using service_role

-- article_chunks public-read (same pattern as articles)
alter table article_chunks enable row level security;
create policy "anyone can read chunks of published articles"
  on article_chunks for select
  using (exists (select 1 from articles a where a.id = article_chunks.article_id and a.published = true));
```

---

## 9. Cost modeling

### At 1,000 DAU (daily active users), 5 queries/day average

Inputs per query:
- System prompt: ~300 tokens
- 5 retrieved chunks × 200 tokens = 1,000 tokens context
- User query: ~30 tokens
- Total input: ~1,330 tokens
- Response: ~200 tokens average

**Per-query cost (Claude Sonnet 4.6):**
- Input: 1,330 × $3/M = $0.00399
- Output: 200 × $15/M = $0.003
- **Total per query: ~$0.007 (~₹0.59)**

**Monthly cost at 1,000 DAU × 5 queries/day × 30 days = 150,000 queries:**
- 150,000 × $0.007 = **$1,050/month = ~₹88,000/month**

**With freemium gating (free users capped at 3/day, avg 1 due to non-use):**
- Free 80% of users × 1 q/day = 800 queries × 30 = 24,000 queries
- Premium 20% × 10 q/day = 2,000 × 30 = 60,000 queries
- Total: 84,000 queries/month
- Cost: 84,000 × $0.007 = **~$588/month = ~₹49,000/month**

**Further optimization — use Gemini Flash for free tier:**
- Flash @ $0.30/M input: roughly 10x cheaper per query
- Free-tier 24,000 queries × $0.0007 = $17
- Premium 60,000 × $0.007 = $420
- Total: **~$437/month = ~₹37,000/month**

### Additional costs

- **Embeddings (one-time per article update):** negligible at current scale. ~$0.02/M tokens × 1,500 chunks × 300 tokens = $0.009 (~₹0.75) one-time.
- **Embeddings at query time:** 30 tokens × 84,000 queries × $0.02/M = $0.05 (negligible)
- **Supabase Edge Functions:** free tier covers ~500K invocations/month.

**Monthly ceiling: ~₹50,000** for 1,000 DAU with reasonable freemium discipline. At ₹199/mo premium × 200 premium users = ₹39,800 revenue — roughly breakeven on AI cost alone before other revenue sources.

### Scaling math

- 5,000 DAU → ~₹250k/mo AI cost → needs ~1,250 premium users → reasonable
- 10,000 DAU → ~₹500k/mo AI cost → 2,500 premium users → healthy

**Important knob to pull if cost grows:** reduce premium query cap from 50 to 30/day, and introduce stricter RAG-only-answer policy that short-circuits generation when retrieval is weak.

---

## 10. Privacy & DPDP implications

### New data flows

- Queries may contain health-sensitive text → needs explicit consent at first AI chat use
- Data path: user device → Supabase edge function → Anthropic/Gemini API (US/EU) → response
- Anthropic retains API inputs/outputs for 30 days (per their standard policy) unless on a zero-retention enterprise plan
- Gemini default retention 30 days, configurable to 0 with paid tier

### Required updates

**Privacy Policy (edit):** Add §6 sub-processor line:
> "Anthropic (Claude API) — for AI-powered Q&A responses — United States — DPA in place. Input retained for 30 days for abuse monitoring, then deleted."

**Medical Disclaimer (edit):** Add section:
> "Our AI chat feature (Rhythm) provides responses grounded in our practitioner-reviewed content library and classical Ayurvedic texts. AI-generated responses are not medical advice, may be inaccurate or incomplete, and must not be relied upon for diagnosis or treatment. Always consult a qualified physician or BAMS-qualified practitioner."

**Consent at first use:** modal before first chat:
> "Rhythm sends your questions to our AI model (Anthropic's Claude, based in the US). Your questions are used only to answer you and are deleted within 30 days. No data is used for AI training without your explicit opt-in."

### User controls

- Settings → AI Privacy:
  - Toggle: "Allow questions to improve the service" (default OFF — you must opt in)
  - "Delete chat history" — wipes chat_messages for this user
  - "Opt out of AI features" — hides the AI chat entirely; they keep the rest of the app

---

## 11. Phase 8 implementation plan (new phase, +12% to tracker)

Adds to the main spec §12. Total tracker now 112% — I'll rebalance the main spec accordingly (each existing phase goes down by ~1% proportionally, or we accept 112% target and scale appropriately).

| # | Task | Weight |
|---|---|---|
| 8.1 | Content chunking + embedding pipeline (script) | 1% |
| 8.2 | Evaluation set v1 — 150 test queries with golden answers | 2% |
| 8.3 | Supabase migrations for chat + article_chunks + query_flags | 1% |
| 8.4 | Supabase Edge Function: RAG retrieval + LLM call | 2% |
| 8.5 | Input classifier (keyword + Gemini Flash classifier) | 1% |
| 8.6 | Output classifier (diagnosis/prescription/disclaimer check) | 1% |
| 8.7 | Chat screen UI (React Native) | 1.5% |
| 8.8 | Starter prompts (phase-aware) | 0.5% |
| 8.9 | Emergency Escalation modal | 0.5% |
| 8.10 | Privacy consent flow + settings | 0.5% |
| 8.11 | Rate limiting + session caps | 0.5% |
| 8.12 | Run eval set + measure hallucination rate | 0.5% |

Total: 12%.

**Dependencies:**
- Phase 0 infrastructure ready (Supabase)
- Phase 5 content batch 1+ complete (we need articles to ground on)
- Phase 4 entitlements wired (to gate premium queries)

Target timeline: phase can start alongside Phase 5 — they're content-ground-interdependent.

---

## 12. Decisions — Resolved (2026-04-19) ✓

| # | Decision | Resolution |
|---|---|---|
| **AC.1** | Ship v1 or v1.5? | ✅ **v1.5** · launch without, add once 15+ practitioner-reviewed articles exist + eval passes |
| **AC.2** | Primary LLM? | ✅ **Claude Sonnet 4.6** primary · **Gemini 2.5 Flash** fallback for free tier |
| **AC.3** | Free tier query limit? | ✅ **3/day free · 50/day premium** |
| **AC.4** | AI training opt-in default? | ✅ **Opt-in** (DPDP explicit consent; default off) |
| **AC.5** | AI persona name? | ✅ **Rhythm** |
| **AC.6** | Eval set authorship? | ✅ **Me 50 + practitioner 50 + real anonymized 50** (post-launch) |

All decisions locked. Phase 8 ready to scaffold eval set + embedding pipeline whenever Phase 5 content crosses the 15-article threshold.

---

## 13. Critical review — honest risks

1. **LLMs fail unpredictably.** Even with RAG and guardrails, edge cases will slip through. We need a human-in-the-loop review of flagged outputs at least weekly.

2. **Cost scales fast.** If our free tier is popular but doesn't convert, AI cost can outpace revenue. The 3-query-per-day cap is defensive for good reason.

3. **Content dependency.** The AI is only as good as our article library. Launching with 9 articles = narrow answers. Launching with 30 = much better. I recommend **not shipping AI until ~30 practitioner-reviewed articles** are live.

4. **Cultural context loss.** Claude and Gemini are trained primarily on English, Western-framed content. Edge cases ("my grandmother says I can't enter the kitchen during my period — is this true?") require careful cultural handling. Our system prompt should explicitly acknowledge these contexts and neither dismiss nor endorse restrictively.

5. **Dependency on Anthropic/Google.** A single model provider outage takes the feature down. We should have a fallback message: "Rhythm is resting right now. Please try again in a few minutes."

6. **Prompt injection evolves.** The research field is actively hostile. We should subscribe to security disclosures from Anthropic and OWASP LLM Top 10, and plan for quarterly guardrail updates.

---

## 14. What I'll do next

Adjacent work already queued:
- SQL migration file for AI tables (next up)
- 3 Figma screens (Chat, Starter Prompts, Emergency modal)
- Medical Disclaimer update with AI paragraph
- Main spec tracker update

Before coding AC.* tasks:
- You answer AC.1–AC.6
- We have at least 15 practitioner-reviewed articles in the library
- Phase 0 infra is done

---

*Draft prepared 2026-04-19. Complements 2026-04-18-rituchakra-subscription-pivot.md.*
