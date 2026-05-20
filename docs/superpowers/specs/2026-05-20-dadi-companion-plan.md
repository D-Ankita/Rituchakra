---
name: Dadi Companion — Implementation Plan (per spec §13)
date: 2026-05-20
status: AWAITING APPROVAL · do not start Milestone 1 until Ankita signs off
owner: Claude Code
spec: 2026-05-20-dadi-companion-spec.md
---

# Dadi Companion — Implementation Plan (response to §13)

This plan addresses the three items §13 of the spec asks for, no more. Nothing is being built yet.

## A. Pre-reads (§0 confirmation)

Files read before producing this plan:

- `src/engine/PredictionEngine.ts` — strategy selector; 4 strategies (Default/WMA/PersonalPattern/Manual). The companion's Brain will not re-implement any cycle math; the Oracle will read prediction output through this same engine.
- `src/engine/phaseCalculator.ts` — `calculatePhase(day, cycleLength)` + `getCycleDay(startDate)`. ContextBuilder consumes these directly.
- `src/engine/hormoneEstimator.ts` — `generateHormoneCurve()`. Read but not needed by the Brain; may be referenced by the Oracle for narrative ("estrogen rising today").
- `src/engine/PatternCorrelation.ts` — `generateInsightPatterns(logs, completedCycles)` returns `Pattern[]` after ≥3 cycles and ≥30 logs. The Brain will extend this with `IrregularityScreener`; the Oracle will surface 1–2 patterns per brief.
- `src/db/schema.ts` — Drizzle tables: `cycles`, `dailyLogs`, `predictions`, `phaseInsights`. The companion adds exactly one new table (`companion_memory`) and one optional table (`companion_settings`).
- `docs/PRD.md` (skimmed §6 onboarding, §9 cycle intelligence, §13 emotional mapping, §20 cultural intelligence, §22 privacy).
- `docs/superpowers/specs/2026-04-19-ai-coach-design.md` — read §3 (architecture), §4 (provider matrix), §5 (safety layers). The Dadi reuses this safety stack verbatim — input classifier, output classifier, red-flag routing, RAG grounding, refusal patterns. Not duplicated here.

No conflicts found between the existing engine surface and what the spec requires.

## B. Directory structure for `src/companion/` + `src/engine/screening/`

```
src/
├── engine/
│   └── screening/                          ← Milestone 1, no cloud
│       ├── IrregularityScreener.ts         ← core screener
│       ├── ScreeningResult.ts              ← shared type (per spec §4)
│       ├── bannedPhrases.ts                ← compile-time list of forbidden diagnostic strings
│       ├── outputValidator.ts              ← runtime guardrail; throws if any output matches bannedPhrases
│       ├── stats.ts                        ← stdDev, variability helpers (kept tiny, no deps)
│       └── __tests__/
│           ├── IrregularityScreener.test.ts
│           └── outputValidator.test.ts     ← the "banned phrasing cannot escape" guardrail test
│
└── companion/                              ← Milestone 2+
    ├── index.ts                            ← barrel; the ONLY public surface other tabs import
    ├── featureFlag.ts                      ← reads from useAppStore: companion on/off, cloud opt-in
    │
    ├── context/
    │   ├── ContextBuilder.ts               ← assembles privacy-safe packet (<1500 tokens target)
    │   ├── ContextPacket.ts                ← typed shape of what goes to cloud
    │   └── tokenBudget.ts                  ← cheap heuristic for packet size
    │
    ├── cloud/
    │   ├── CloudBoundary.ts                ← THE only file that talks to LLM/TTS/STT/avatar APIs
    │   ├── CloudBoundary.types.ts          ← interfaces: LLMProvider, TTSProvider, STTProvider, AvatarProvider
    │   ├── redactor.ts                     ← strips identifiers, caps history to summaries
    │   ├── providers/
    │   │   ├── anthropicLLM.ts             ← Claude Sonnet 4.6 (per AI coach §4)
    │   │   ├── geminiLLM.ts                ← free-tier fallback
    │   │   ├── elevenLabsTTS.ts            ← Milestone 3
    │   │   ├── expoSTT.ts                  ← device-native STT first
    │   │   └── nullProviders.ts            ← offline/no-opt-in stubs (used as default)
    │   └── __tests__/
    │       ├── redactor.test.ts            ← assert PII never reaches a provider
    │       └── CloudBoundary.test.ts       ← assert no other file imports providers directly
    │
    ├── oracle/
    │   ├── MorningBriefGenerator.ts        ← schedules + assembles + calls CloudBoundary
    │   ├── briefTemplates.ts               ← offline fallback briefs (template-driven, local-only)
    │   ├── briefCache.ts                   ← caches today's brief (AsyncStorage or sqlite kv)
    │   ├── rateLimit.ts                    ← screening nudge: at most once per cycle
    │   └── scheduler.ts                    ← wraps expo-notifications, default 6:30 AM
    │
    ├── dadi/
    │   ├── ConversationEngine.ts           ← turn manager; routes through safety classifier
    │   ├── personaPrompt.ts                ← parameterized system prompt (lang/region/name/address)
    │   ├── personaPrompt.versions.ts       ← versioned prompt templates for eval traceability
    │   ├── Memory.ts                       ← keyword + recency retrieval over companion_memory
    │   ├── memorySummarizer.ts             ← post-turn summarization (LLM-side, redacted)
    │   ├── safetyRouter.ts                 ← reuses AI-coach classifier surface (no duplication)
    │   └── __tests__/
    │       ├── personaPrompt.test.ts
    │       └── Memory.test.ts
    │
    ├── culture/
    │   ├── festivalCalendar.ts             ← static lookup; date → flag + reviewed-content slug
    │   ├── festivals.data.ts               ← curated dataset (Karva Chauth, Navratri, Ekadashi, …)
    │   ├── languageProfile.ts              ← user language + region + code-switch preference
    │   └── contentBridge.ts                ← reads only published=true articles from /content
    │
    ├── voice/                              ← Milestone 3
    │   ├── VoiceService.ts                 ← TTS facade over CloudBoundary
    │   └── SpeechInput.ts                  ← STT facade
    │
    ├── avatar/                             ← Milestone 3
    │   ├── AvatarView.tsx                  ← illustrated face + audio-driven lip-sync
    │   ├── AvatarFallback.tsx              ← static portrait + waveform
    │   └── lipsync.ts                      ← amplitude/viseme driver
    │
    └── ui/                                 ← Milestone 3
        ├── DadiScreen.tsx                  ← lives behind app/(tabs)/dadi.tsx
        ├── BriefCard.tsx
        ├── TranscriptView.tsx
        └── PrivacyExplainer.tsx            ← "what leaves my device" screen
```

Rules baked into the layout:

- **No file outside `cloud/providers/` imports an SDK that hits the network.** Enforced by a lint rule (added in Milestone 2) and by the `CloudBoundary.test.ts` smoke test.
- **`engine/screening/` has zero React Native imports.** Pure TypeScript so it ships in any context (CI eval runner, future server-side checks).
- The Brain (Milestone 1) lives in `engine/screening/` deliberately — it is engine work, parallel to PatternCorrelation, and must not depend on `companion/`.

## C. `companion_memory` migration

One table in Milestone 1 (created locally, no Supabase change since the working app is local-only SQLite):

```ts
// src/db/schema.ts (additions)

export const companionMemory = sqliteTable('companion_memory', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  createdAt: integer('created_at').notNull(),      // ms epoch
  cycleId: integer('cycle_id').references(() => cycles.id),
  cycleDay: integer('cycle_day'),                  // nullable: pre-onboarding chats allowed
  phase: text('phase'),                            // snapshot of phase at conversation time
  summary: text('summary').notNull(),              // 1–3 sentence summary of the turn/session
  salientTopics: text('salient_topics').notNull().default('[]'), // JSON: ['work-stress','sleep']
  sentiment: text('sentiment'),                    // 'positive'|'neutral'|'low'|'distressed'
  source: text('source').notNull().default('conversation'), // 'conversation'|'morning_brief'|'screening'
  redacted: integer('redacted', { mode: 'boolean' }).notNull().default(true),
});
```

Indexes (added in same migration):

- `idx_companion_memory_created_at` — recency retrieval.
- `idx_companion_memory_cycle_id` — "what did she tell me last cycle."

Optional second table (added in Milestone 2 only if needed; can also live in `useAppStore` persisted state):

```ts
export const companionSettings = sqliteTable('companion_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  personaName: text('persona_name').notNull().default('Dadi'),
  language: text('language').notNull().default('en'),    // 'hi'|'mr'|'en'|'hi-en'|'mr-en'
  region: text('region'),
  proactiveTimeMinutes: integer('proactive_time_minutes').notNull().default(390), // 6:30 AM
  voiceEnabled: integer('voice_enabled', { mode: 'boolean' }).notNull().default(false),
  cloudOptIn: integer('cloud_opt_in', { mode: 'boolean' }).notNull().default(false),
  updatedAt: integer('updated_at').notNull(),
});
```

Lifecycle:

- Both tables are created via Drizzle/`initializeDatabase()` next to existing tables. No Supabase migration needed for this build.
- Both tables are wiped by the existing one-tap data-wipe routine. I will add the two `DELETE` statements alongside the current wipe code and add a test that wipe truly removes companion data.

## D. How `CloudBoundary` + `redactor` enforce the privacy boundary

The boundary is **one file, one interface, one chokepoint**.

**Shape:**

```ts
// src/companion/cloud/CloudBoundary.types.ts
export interface LLMProvider {
  generate(req: RedactedLLMRequest): Promise<LLMResponse>;
}
export interface TTSProvider { synthesize(text: string, voice: VoiceId): Promise<AudioStream>; }
// … STTProvider, AvatarProvider

// src/companion/cloud/CloudBoundary.ts
export class CloudBoundary {
  constructor(
    private llm: LLMProvider,
    private tts: TTSProvider,
    private stt: STTProvider,
    private avatar: AvatarProvider,
    private optIn: () => boolean,         // reads featureFlag.ts
  ) {}

  async ask(packet: ContextPacket, userTurn: string): Promise<LLMResponse> {
    if (!this.optIn()) return offlineFallback(packet, userTurn);
    const redacted = redact(packet, userTurn);   // pure function
    assertNoIdentifiers(redacted);               // throws in dev, logs+strips in prod
    return this.llm.generate(redacted);
  }
}
```

**Enforcement, four mechanisms:**

1. **Static (lint).** An ESLint rule (added in Milestone 2) forbids any file outside `src/companion/cloud/providers/**` from importing `@anthropic-ai/sdk`, `@google/generative-ai`, `elevenlabs`, etc. The boundary becomes greppable.
2. **Structural.** `CloudBoundary` is the only thing exported from `cloud/index.ts`. Providers are constructed in one place (a `bootstrap()` called from `_layout.tsx`) and injected — feature code only sees the boundary.
3. **Runtime redactor.** Every outbound packet goes through `redact()`:
   - Strips raw `notes` (free-text logs may contain names, partners, doctors). Keeps a 1–2 word topic extract only.
   - Replaces user name with `{user}` placeholder; the persona prompt reconstructs the address locally if needed.
   - Caps history to **derived summaries** from `PatternCorrelation` + `IrregularityScreener` outputs — never raw `daily_logs` rows or dates outside the current cycle.
   - Drops `medications` field entirely from cloud packets (medication info stays on device).
   - Enforces total token budget (`tokenBudget.ts`) — truncates oldest memory summaries first.
4. **Tests.**
   - `redactor.test.ts`: feed packets containing fake names, phone numbers, email-shaped strings, raw notes — assert none of them appear in the output.
   - `CloudBoundary.test.ts`: import-graph assertion (Node script in test) that no source file outside `cloud/providers/**` imports a network SDK.
   - `featureFlag.test.ts`: when `cloudOptIn === false`, calling `CloudBoundary.ask` returns the offline fallback and never invokes the injected provider mock.

**Default state at install:** providers are the `nullProviders` (offline stubs). Real providers are only wired in when the user explicitly flips the cloud opt-in toggle. This makes "cloud is off by default" a code fact, not a policy promise.

## E. IrregularityScreener guardrail approach

The spec's hardest invariant: "never output a condition name as a conclusion." Approach is **defense in depth — three layers**, all in `src/engine/screening/`:

1. **The screener cannot construct condition names.**
   `IrregularityScreener.ts` does not have access to a list of conditions. It computes purely numeric features (variability, count out-of-range, luteal consistency, symptom-cluster scores) and emits a `signal` enum (`'none' | 'gentle' | 'notable'`) + `reasons: string[]` whose strings come from a fixed vocabulary of *pattern descriptions*, never condition names. Example allowed reasons:
   - `"4 of your last 6 cycles were longer than 35 days"`
   - `"Cycle length has varied by more than 10 days recently"`
   - `"Symptoms commonly noted alongside hormonal patterns appeared together this cycle"`
   The reasons are template strings parameterized only by numbers. No template contains a condition name.

2. **`bannedPhrases.ts` — explicit denylist.**
   A compile-time exported list:
   ```ts
   export const BANNED_PHRASES = [
     /\bPCOS\b/i, /\bPCOD\b/i, /\bendometriosis\b/i,
     /\bdiagnos(is|ed|tic)\b/i, /\byou have\b/i,
     /\bdisease\b/i, /\bdisorder\b/i, /\bsyndrome\b/i,
     /\binfertil/i, /\bcancer\b/i,
   ];
   ```
   Phrases like "this pattern is sometimes associated with PCOS" — which the spec explicitly *allows* — are only allowed to originate from the LLM/Dadi layer, never from the deterministic screener. The screener itself stays vocabulary-free; if context warrants surfacing the word "PCOS," that comes from Dadi's reviewed-content references, not the screener.

3. **`outputValidator.ts` — runtime gate, fail-closed.**
   ```ts
   export function validateScreeningText(text: string): void {
     for (const re of BANNED_PHRASES) {
       if (re.test(text)) throw new ScreeningGuardrailViolation(re.source);
     }
   }
   ```
   Every string the screener emits is run through `validateScreeningText` before it leaves the module. In production builds the violation is logged and the offending reason is dropped (fail-closed — better silence than a banned phrase). In dev/test it throws, so any regression breaks CI loudly.

4. **Guardrail test — proves layer 3 holds.**
   `outputValidator.test.ts` includes a fuzz-style test that mutates the screener's template strings and asserts the validator catches every banned variant. Also a test that feeds historical inputs designed to trigger the highest-confidence path, runs the full screener, and asserts the output passes the validator without modification.

5. **Confidence floor for `suggestSeeingDoctor`.**
   `suggestSeeingDoctor: true` requires `confidence !== 'low'` AND `signal === 'notable'`. Below that, the doctor suggestion is omitted; the reasons can still surface, just without the prompt to seek care. This prevents premature escalation on thin data.

The same `outputValidator` is reused by the Dadi `ConversationEngine` (Milestone 2) as a *second* defensive layer over LLM output — but the screener never depends on the LLM for safety.

## F. Open questions for Ankita before Milestone 1

These are intentionally small — yes/no on each unblocks Milestone 1 fully:

1. **Memory wipe semantics.** The spec says companion data participates in the one-tap wipe. Should there also be a *separate* "clear my conversations only" action in settings, distinct from full app wipe? (My default: yes, but only proposing.)
2. **`companion_settings` table vs. extending `useAppStore`.** Either works. AsyncStorage via `useAppStore` is simpler; SQLite is more consistent with the rest of the schema. (My default: extend `useAppStore` for Milestone 1, migrate to table only if it grows beyond ~10 fields.)
3. **Test runner.** Repo has no Jest/Vitest configured today. Milestone 1 needs tests — I'd add **Vitest** (lighter, faster, no RN bridge needed for pure TS engine code). OK to add? (Alternative: Jest with a minimal RN preset.)
4. **Naming.** "Brain" / "Oracle" / "Dadi" — the user-visible name is `Dadi`. Should the code-side modules use those exact names (`oracle/`, `dadi/`) as written above, or do you want a more neutral internal naming like `screening/`, `morningBrief/`, `companion/`? (My default: keep the spec's naming; it's more memorable and one-to-one with the spec.)

## G. What I will NOT do until you approve

- No new files in `src/engine/screening/` or `src/companion/`.
- No schema change to `src/db/schema.ts`.
- No new dependency in `package.json`.
- No notification scheduling changes.
- No commits beyond saving this plan + the spec to the docs folder.

Awaiting your sign-off on §B–§E and answers to §F. Once approved, I'll start Milestone 1 (the Brain), which is local-only, fully testable, and has zero cloud cost.
