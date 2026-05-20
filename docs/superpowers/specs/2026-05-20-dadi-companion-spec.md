---
name: RituChakra — "Dadi" AI Companion Spec
date: 2026-05-20
status: DRAFT · awaiting plan approval before Milestone 1
owner: Ankita Dodamani
depends_on: 2026-04-19-ai-coach-design.md
---

# RituChakra — "Dadi" AI Companion Spec

For: Claude Code
Goal: Build the autonomous AI elder-sister/dadi companion layer on top of the existing RituChakra app.
Owner: Ankita
Target: 3-month build, weekend cadence. Ship a viral-worthy demo.

## 0. Read this first

This is NOT a new app. RituChakra already exists in this repo as a working Expo / React Native period tracker (local-only SQLite, Drizzle ORM, prediction engine, dosha-phase mapping, Skia charts). Do not rebuild any of that.

You are adding ONE new capability: an autonomous, culturally-intelligent AI companion (working name "Dadi") that talks to the user in her language, remembers her, proactively reaches out, and surfaces health insights including a gentle PCOS/irregularity screening signal.

Before writing any code:

1. Read the existing `src/engine/` (PredictionEngine, phaseCalculator, hormoneEstimator, PatternCorrelation).
2. Read `src/db/schema.ts` (cycles, daily_logs, predictions, phase_insights).
3. Read `docs/PRD.md` and `docs/superpowers/specs/2026-04-19-ai-coach-design.md` (the prior AI coach design — reuse its safety/RAG/eval thinking, do not duplicate it).
4. Then propose a plan before building.

The companion reuses the existing prediction engine and pattern correlator as its "brain." Do not re-implement cycle math.

## 1. What we are building (one paragraph)

An AI companion that feels like the wise elder woman every Indian woman used to have access to but lost in nuclear, urban life. She infers the user's cycle state from data the app already collects, proactively reaches out at the right moments in the user's own language (Hindi / Marathi / English code-switching), holds a continuous memory of past conversations, and quietly screens for cycle irregularities that may warrant seeing a doctor. She is delivered through voice and an animated face, not just a chat bubble.

Three integrated capabilities, one persona:

- The Brain — pattern recognition + irregularity/PCOS screening (data layer)
- The Oracle — proactive daily morning intelligence (orchestration layer)
- The Dadi — voice + face + memory + multilingual conversation (interface layer)

## 2. Hard product principles (do not violate)

1. She is a companion, not a doctor. Never diagnoses. Screens and gently suggests seeing a professional. All medical-adjacent output routes through a safety layer (reuse the existing AI coach safety design).
2. She is warm, never clinical. Voice and tone are that of a wise, kind elder woman. No corporate wellness language. No "consult your healthcare provider" robotic disclaimers mid-conversation.
3. Privacy is sacred. Cycle data is the most intimate data a person has. On-device by default. Any cloud call (LLM, voice, avatar) sends the minimum necessary context, never raw identifiable history dumps. User must explicitly opt in to any cloud feature. Make the data boundary explicit in code and in UI.
4. Cultural intelligence is the moat. She knows festivals, fasting days, joint-family dynamics, regional language. This is not decoration; it is the core differentiator. Build it in from day one, not as an afterthought.
5. Graceful degradation. If voice/avatar/LLM is unavailable (offline, no subscription, API down), she still works as text. Never hard-fail the companion because a cloud service is down.

## 3. Architecture overview

```
Existing app (local SQLite, prediction engine)  ← DO NOT REBUILD
        │
        ▼
[Companion Context Builder]  ── assembles a compact, privacy-safe context packet
        │                        (cycle day, phase, recent patterns, today's calendar
        │                         hint, festival/fasting flag, irregularity signal)
        ▼
[Companion Orchestrator]
   ├── Brain:  IrregularityScreener + PatternCorrelation (local)
   ├── Oracle: MorningBriefGenerator (scheduled, local trigger → LLM)
   └── Dadi:   ConversationEngine (LLM + memory + persona) → Voice → Avatar
        │
        ▼
[Delivery]  proactive notification → tap → Dadi screen (voice + face + chat)
```

Keep each layer independently testable. The Brain must work with zero cloud. The Oracle and Dadi degrade to text if cloud is off.

## 4. Capability 1 — The Brain (irregularity + pattern screening)

Location: `src/engine/screening/` (new folder)

Reuse `PatternCorrelation.ts` and the prediction strategies. Add:

`IrregularityScreener.ts`

- Input: completed cycle history from `cycles` table.
- Computes: cycle length variability (std dev), count of cycles outside 21–35 days, missed/skipped cycles, luteal phase consistency, symptom clusters associated with PCOS (from `daily_logs` — acne, weight, mood, energy) and endometriosis (severe pain patterns).
- Output: a structured `ScreeningResult`:

```ts
type ScreeningResult = {
  signal: 'none' | 'gentle' | 'notable';   // never "diagnosis"
  reasons: string[];                       // human-readable, e.g. "4 of last 6 cycles longer than 35 days"
  suggestSeeingDoctor: boolean;
  confidence: 'low' | 'medium' | 'high';   // tied to amount of data
  disclaimerRequired: true;
}
```

- Hard rule: Never output a condition name as a conclusion. "This pattern is sometimes associated with PCOS — worth asking a doctor" is allowed. "You have PCOS" is forbidden. Enforce this in code with a validation layer that rejects banned phrasings before any screening text reaches the user.
- Minimum data gate: needs ≥3 completed cycles before any signal above 'none'. With <3 cycles, always returns 'none' + "still learning your rhythm."

Tests (required)

- `IrregularityScreener.test.ts` with synthetic histories: regular cycles → 'none'; consistently long irregular cycles → 'notable' + suggestSeeingDoctor; insufficient data → 'none'.
- A guardrail test asserting no banned diagnostic phrasing can ever be emitted.

## 5. Capability 2 — The Oracle (proactive morning brief)

Location: `src/companion/oracle/`

`ContextBuilder.ts`

Assembles a compact, privacy-safe context packet (target < 1,500 tokens) for the LLM. Includes:

- Today's cycle day + phase + dosha mapping (from existing engine)
- Prediction confidence
- Last 1–2 notable patterns from PatternCorrelation (e.g. "mood dips days 22–25")
- Today's cultural flag (festival / fasting day / none) — from a local calendar lookup, see §7
- Screening signal (only if 'gentle' or 'notable', and only surfaced occasionally, not every day)
- A behavior hint if available (e.g. poor sleep logged) — optional, no wearable assumed
- User's language preference + name + how she likes to be addressed

Never send raw full history. Send derived summaries only.

`MorningBriefGenerator.ts`

- Triggered by a local scheduled task (reuse existing `expo-notifications` setup; default 6:30 AM, user-configurable).
- Calls the LLM with the context packet + the Dadi persona system prompt (§6).
- Produces a short spoken brief (2–4 sentences) + optional 1 actionable suggestion + optional gentle screening nudge (rate-limited: at most once per cycle).
- Caches the brief locally so tapping the notification shows it instantly, even offline.
- If LLM unavailable: fall back to a template-based brief built purely from local engine output. Never skip the brief.

Tests

- Context packet never exceeds token budget.
- Screening nudge respects the once-per-cycle rate limit.
- Offline fallback produces a valid brief.

## 6. Capability 3 — The Dadi (voice + face + memory + conversation)

Location: `src/companion/dadi/`

Persona

- Working name "Dadi" (user can rename: Dadi / Aaji / Nani / Didi / custom).
- Voice and manner: warm, wise, unhurried elder woman from the user's region. Uses the user's language, code-switches naturally (Hinglish / Marathi-English). Never shames around periods, sex, fertility, mood. Direct but gentle.
- She references shared history ("last cycle you mentioned the same thing about work").

`personaPrompt.ts`

A system prompt template parameterized by language, region, persona name, and the user's preferred address. Encode the cultural voice rules here. Keep it version-controlled and eval-tested. Do not hardcode medical claims in the prompt.

`ConversationEngine.ts`

- Manages a turn-based conversation with the LLM.
- Injects: persona prompt + compact memory summary + current cycle context + retrieved relevant past notes.
- Routes every response through the safety classifier (reuse the prior AI coach safety design: red-flag detection, out-of-scope handling, injection mitigation). Medical red flags (e.g. very heavy bleeding, severe pain, suicidal ideation) trigger a caring escalation message pointing to professional help — never minimized, never ignored.

`Memory.ts`

- Persistent, on-device memory store (new SQLite table `companion_memory`: id, timestamp, cycle_day, summary, salient_topics, sentiment).
- After each conversation, generate a short summary + extract salient topics. Store locally.
- On new conversation, retrieve the most relevant past memories (recency + topic match) to inject. Keep retrieval simple and local; do not stand up a vector DB on-device for v1 — use keyword + recency scoring first.
- Memory is wiped by the existing one-tap data wipe. Document this.

Voice

- `VoiceService.ts` — abstraction over a TTS provider (start with ElevenLabs; keep provider-swappable behind an interface). Indian elder-woman voice. Streams audio for low latency.
- STT for user voice input: use device-native speech-to-text first (Expo speech APIs) to save cost; provider STT optional later.
- Always provide a text fallback path (type instead of speak).

Avatar

- `AvatarView.tsx` — an animated face that lip-syncs to the voice.
- v1 scope cut: Do NOT attempt real-time photoreal avatar generation on-device. Start with a stylized, warm, illustrated/2D animated face (lottie or a simple morph-target lip-sync driven by audio amplitude/visemes). A beautiful illustrated dadi beats an uncanny-valley photoreal one. Keep the avatar provider behind an interface so it can be upgraded later (HeyGen / D-ID) for marketing demo videos.
- The avatar must degrade to a calm static portrait + waveform if animation is unavailable.

Tests / Evals

- Extend the existing `eval/cases.ts` with companion-specific cases: cultural code-switching correctness, refusal of diagnosis, red-flag escalation, memory recall accuracy, persona consistency.

## 7. Cultural intelligence layer

Location: `src/companion/culture/`

- `festivalCalendar.ts` — local lookup of major festivals + fasting days (Karva Chauth, Navratri fasting, Ekadashi, regional festivals). Maps date → cultural flag + any relevant cycle/fasting wisdom (e.g. what Ayurveda actually says about fasting during menstruation, citing existing reviewed content only).
- `languageProfile.ts` — user's language + region + code-switching preference.
- Pull cultural wisdom ONLY from the existing reviewed content library (`content/`), respecting the `published` review gate. Never let the LLM invent Ayurvedic claims; ground them in reviewed articles or omit.

## 8. UI / delivery

- New screen: `app/(tabs)/dadi.tsx` (or a prominent entry from Home).
- Proactive: morning notification → tap → Dadi screen opens with today's brief already spoken.
- Conversation: voice-first with visible text transcript; user can tap to type instead.
- Settings additions: persona name, language, voice on/off, proactive time, cloud-features opt-in toggle, and a clear "what leaves my device" explanation screen.
- Respect existing theme tokens (`src/theme/`). The dadi screen should feel warm, soft, watercolor-meets-geometry per the existing brand.

## 9. Privacy & safety (non-negotiable, build as code not policy)

- A single `CloudBoundary.ts` module is the ONLY place that makes external calls (LLM, TTS, STT, avatar). Everything else talks to it through an interface. This makes the data boundary auditable in one file.
- Before any cloud call, the context packet passes through a `redactor` that strips direct identifiers and caps history to derived summaries.
- Cloud features are OFF until the user explicitly opts in. Local brain + template briefs work without opt-in.
- All companion data participates in the existing one-tap wipe.
- Reuse the prior AI coach safety classifier and medical-disclaimer §8a protocol. Do not weaken it.

## 10. Build sequence (3 milestones)

Milestone 1 — The Brain (Weeks 1–4)

- `IrregularityScreener` + tests + guardrails.
- Extend PatternCorrelation outputs the companion will need.
- `companion_memory` table migration.
- No cloud yet. Everything local and tested.
- Demo at end: screening result printed for synthetic + real local data.

Milestone 2 — The Oracle + text Dadi (Weeks 5–8)

- ContextBuilder + redactor + CloudBoundary.
- MorningBriefGenerator with offline fallback.
- ConversationEngine (text only) + Memory + personaPrompt + safety routing.
- Cultural calendar layer.
- Demo at end: a text conversation where Dadi remembers you, code-switches, gives a morning brief, and gently surfaces a screening nudge.

Milestone 3 — Voice + Face + polish (Weeks 9–12)

- VoiceService (ElevenLabs) + device STT + text fallback.
- AvatarView (illustrated, audio-driven lip-sync) + static fallback.
- dadi.tsx screen, settings, opt-in flow, "what leaves my device" screen.
- Eval pass on companion cases.
- Demo at end: the full viral demo — wake up, notification, tap, an elder woman's face speaks to you in your language about your day and your body, you talk back, she remembers.

## 11. Definition of done for the wow demo

A 60–90 second screen recording where:

1. A morning notification arrives.
2. Tapping it opens a warm animated elder-woman face who speaks (in Hindi/Marathi/English mix) a specific, personal brief based on real cycle + pattern data.
3. She gently raises a real insight (a pattern, a cultural note, or a soft screening nudge).
4. The user speaks back; she responds with memory of past conversations.
5. Everything visibly respects privacy (a clear local-first indicator).

If a stranger watching that video thinks "wait, this is like having my grandmother who's also a doctor, on my phone, in my language" — we've hit the wow.

## 12. Explicit non-goals for this build

- No diagnosis, ever. Screening + suggestion only.
- No photoreal real-time on-device avatar in v1.
- No on-device vector DB in v1 (keyword + recency memory first).
- No subscription/paywall wiring in this build (that's the separate v2 pivot work; keep this companion behind a simple feature flag).
- No new cycle-math; reuse the existing engine.
- No wearable dependency; behavior signals are optional bonuses, not required.

## 13. First task for Claude Code

Do not start coding features yet. First:

1. Read the files listed in §0.
2. Produce a short written plan: how you'll structure `src/companion/`, what the `companion_memory` migration looks like, and how `CloudBoundary` + `redactor` will enforce the privacy boundary.
3. Confirm the IrregularityScreener guardrail approach (how banned diagnostic phrasing is prevented in code).
4. Wait for Ankita's approval on the plan before building Milestone 1.
