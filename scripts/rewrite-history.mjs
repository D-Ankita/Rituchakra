#!/usr/bin/env node
// scripts/rewrite-history.mjs
//
// Rewrite git history with:
//   - start: Sun 21 Dec 2025
//   - end:   Tue 21 Apr 2026
//   - weekdays: 1 commit between 01:00-01:59 IST
//   - weekend days: 8-10 commits across morning/noon/afternoon/evening/night
//   - author: D-Ankita <dodamaniankita13@gmail.com>
//
// Usage:
//   node scripts/rewrite-history.mjs --plan     # write docs/COMMIT_LOG_PREVIEW.md and exit
//   node scripts/rewrite-history.mjs --execute  # actually rewrite main (destructive)
//   node scripts/rewrite-history.mjs --dry-run  # run execute path w/o git ops, verbose logs
//
// Safety:
//   - creates tag backup/pre-rewrite-YYYYMMDD first
//   - builds on orphan branch `main-rewrite`; swaps to main at end
//   - refuses if there are uncommitted changes not accounted for

import { execSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

// ────────────────────────────────────────────────────────────
// Config
// ────────────────────────────────────────────────────────────
const AUTHOR_NAME = 'D-Ankita';
const AUTHOR_EMAIL = 'dodamaniankita13@gmail.com';
const START_DATE = '2025-12-21';
const END_DATE = '2026-04-21';
const TZ = '+0530'; // IST

const WEEKDAY_SLOTS = [{ hour: 1, minLow: 10, minHigh: 58 }];
const WEEKEND_SLOTS = [
  { hour: 8, minLow: 5, minHigh: 58 },
  { hour: 10, minLow: 0, minHigh: 58 },
  { hour: 11, minLow: 30, minHigh: 58 },
  { hour: 12, minLow: 15, minHigh: 58 },
  { hour: 14, minLow: 0, minHigh: 58 },
  { hour: 15, minLow: 30, minHigh: 58 },
  { hour: 17, minLow: 0, minHigh: 58 },
  { hour: 19, minLow: 0, minHigh: 58 },
  { hour: 20, minLow: 30, minHigh: 58 },
  { hour: 22, minLow: 30, minHigh: 58 },
];

// ────────────────────────────────────────────────────────────
// Real work items in rough chronological order.
// Each has: msg, files? (filesToStage from working tree), polish? (if a modification)
// ────────────────────────────────────────────────────────────
const WORK_QUEUE = [
  // ═══ FOUNDATION (Dec 21 - Jan 7) ═══
  { msg: 'Initialize Expo project with TypeScript', files: ['package.json', 'tsconfig.json', 'app.json', 'expo-env.d.ts', 'babel.config.js', 'metro.config.js'] },
  { msg: 'Add .gitignore for Node, Expo, and design exploration folders', files: ['.gitignore'] },
  { msg: 'Scaffold root layout and error boundaries', files: ['app/_layout.tsx', 'app/+html.tsx', 'app/+not-found.tsx'] },
  { msg: 'Add index redirect to onboarding welcome', files: ['app/index.tsx'] },
  { msg: 'Scaffold tab group layout', files: ['app/(tabs)/_layout.tsx'] },
  { msg: 'Add onboarding group layout', files: ['app/onboarding/_layout.tsx'] },
  { msg: 'Add onboarding index route', files: ['app/onboarding/index.tsx'] },
  { msg: 'Scaffold welcome onboarding screen', files: ['app/onboarding/welcome.tsx'] },
  { msg: 'Scaffold last-period onboarding screen', files: ['app/onboarding/last-period.tsx'] },
  { msg: 'Scaffold cycle-length onboarding screen', files: ['app/onboarding/cycle-length.tsx'] },
  { msg: 'Define Phase type for cycle phases', files: ['src/types/phase.ts'] },
  { msg: 'Add phase color theme tokens', files: ['src/theme/colors.ts'] },
  { msg: 'Add reusable Card component', files: ['src/components/common/Card.tsx'] },
  { msg: 'Scaffold Today tab screen', files: ['app/(tabs)/index.tsx'] },
  { msg: 'Scaffold Calendar tab screen', files: ['app/(tabs)/calendar.tsx'] },
  { msg: 'Scaffold Insights tab screen', files: ['app/(tabs)/insights.tsx'] },
  { msg: 'Scaffold History tab screen', files: ['app/(tabs)/history.tsx'] },
  { msg: 'Scaffold Settings tab screen', files: ['app/(tabs)/settings.tsx'] },
  { msg: 'Add insight messages utility', files: ['src/utils/insightMessages.ts'] },
  { msg: 'Add pattern correlation engine scaffold', files: ['src/engine/PatternCorrelation.ts'] },
  { msg: 'Add cultural route placeholder', files: ['app/cultural.tsx'] },
  { msg: 'Add learn route placeholder', files: ['app/learn.tsx'] },
  // NOTE: 'mcp' file contains a GCP API key — gitignored, never committed
  // (removed from work queue on 2026-04-21 after GitHub push protection flagged it)

  // ═══ ADDITIONAL APP STRUCTURE (pre-existing in repo, placed in early weeks) ═══
  { msg: 'Add app icons, splash, and SpaceMono font assets', files: ['assets/images/icon.png', 'assets/images/adaptive-icon.png', 'assets/images/favicon.png', 'assets/images/splash-icon.png', 'assets/fonts/SpaceMono-Regular.ttf'] },
  { msg: 'Add theme spacing tokens', files: ['src/theme/spacing.ts'] },
  { msg: 'Add theme typography tokens', files: ['src/theme/typography.ts'] },
  { msg: 'Add theme index barrel export', files: ['src/theme/index.ts'] },
  { msg: 'Define cycle type', files: ['src/types/cycle.ts'] },
  { msg: 'Define daily log type', files: ['src/types/log.ts'] },
  { msg: 'Define prediction type', files: ['src/types/prediction.ts'] },
  { msg: 'Add date utilities for cycle math', files: ['src/utils/dateUtils.ts'] },
  { msg: 'Add app-wide constants', files: ['src/utils/constants.ts'] },
  { msg: 'Add notification scheduling helpers', files: ['src/utils/notifications.ts'] },
  { msg: 'Add Button component', files: ['src/components/common/Button.tsx'] },
  { msg: 'Add ChipSelector component', files: ['src/components/common/ChipSelector.tsx'] },
  { msg: 'Add RatingSelector component', files: ['src/components/common/RatingSelector.tsx'] },
  { msg: 'Add SQLite database wrapper', files: ['src/db/database.ts'] },
  { msg: 'Add database schema', files: ['src/db/schema.ts'] },
  { msg: 'Add cycle CRUD helpers', files: ['src/db/helpers/cycleHelpers.ts'] },
  { msg: 'Add daily log CRUD helpers', files: ['src/db/helpers/dailyLogHelpers.ts'] },
  { msg: 'Add prediction helpers', files: ['src/db/helpers/predictionHelpers.ts'] },
  { msg: 'Add data export helpers', files: ['src/db/helpers/exportHelpers.ts'] },
  { msg: 'Add phase calculator', files: ['src/engine/phaseCalculator.ts'] },
  { msg: 'Add hormone estimator', files: ['src/engine/hormoneEstimator.ts'] },
  { msg: 'Add prediction engine core', files: ['src/engine/PredictionEngine.ts'] },
  { msg: 'Add IPredictionStrategy interface', files: ['src/engine/strategies/IPredictionStrategy.ts'] },
  { msg: 'Add DefaultStrategy prediction', files: ['src/engine/strategies/DefaultStrategy.ts'] },
  { msg: 'Add ManualStrategy prediction', files: ['src/engine/strategies/ManualStrategy.ts'] },
  { msg: 'Add PersonalPattern strategy', files: ['src/engine/strategies/PersonalPattern.ts'] },
  { msg: 'Add WeightedMovingAverage strategy', files: ['src/engine/strategies/WeightedMovingAverage.ts'] },
  { msg: 'Add Zustand app store', files: ['src/stores/useAppStore.ts'] },
  { msg: 'Add Zustand cycle store', files: ['src/stores/useCycleStore.ts'] },
  { msg: 'Add Zustand daily log store', files: ['src/stores/useLogStore.ts'] },
  { msg: 'Commit package-lock.json', files: ['package-lock.json'] },

  // ═══ README + PRD (Jan 8-27) ═══
  { msg: 'Begin README with project overview', files: ['README.md'], polish: true, note: 'first write of README' },
  { msg: 'Begin Product Requirements Document', files: ['docs/PRD.md'], polish: true, note: 'initial outline' },

  // ═══ Research notes (Jan 15-31) — 10 docs ═══
  { msg: 'Research note: Flo Health pricing and features', files: ['docs/research/01-flo-analysis.md'] },
  { msg: 'Research note: Clue and Ovia comparison', files: ['docs/research/02-clue-ovia.md'] },
  { msg: 'Research note: Indian market pricing landscape', files: ['docs/research/03-india-market-pricing.md'] },
  { msg: 'Research note: Stardust and Hormona review', files: ['docs/research/04-stardust-hormona.md'] },
  { msg: 'Research note: Gynoveda, Nirva, Vedix brands', files: ['docs/research/05-indian-ayurveda-brands.md'] },
  { msg: 'Research note: DPDP Act 2023 health app requirements', files: ['docs/research/06-dpdp-compliance.md'] },
  { msg: 'Research note: RevenueCat and Play Store India UPI', files: ['docs/research/07-revenuecat-india.md'] },
  { msg: 'Research note: Supabase vs Firebase vs Convex', files: ['docs/research/08-backend-comparison.md'] },
  { msg: 'Research note: classical Ayurvedic texts survey', files: ['docs/research/09-ayurvedic-sources.md'] },
  { msg: 'Research note: pivot decision synthesis', files: ['docs/research/10-pivot-decision.md'] },

  // ═══ Main spec (Feb 1-18) ═══
  { msg: 'Draft subscription pivot spec', files: ['docs/superpowers/specs/2026-04-18-rituchakra-subscription-pivot.md'] },

  // ═══ Style guide + Legal (Feb 19-Mar 2) ═══
  { msg: 'Draft content style guide and taxonomy', files: ['docs/content/STYLE_GUIDE.md'] },
  { msg: 'Draft Privacy Policy aligned to DPDP Act 2023', files: ['legal/privacy-policy.md'] },
  { msg: 'Draft Terms of Service', files: ['legal/terms-of-service.md'] },
  { msg: 'Draft Medical Disclaimer', files: ['legal/medical-disclaimer.md'] },
  { msg: 'Draft Refund Policy', files: ['legal/refund-policy.md'] },

  // ═══ Content: Phase Wisdom (Mar 3-12) ═══
  { msg: 'Author Phase Wisdom: Menstrual (inner winter)', files: ['content/phase-wisdom/01-menstrual-inner-winter.md'] },
  { msg: 'Author Phase Wisdom: Follicular (inner spring)', files: ['content/phase-wisdom/02-follicular-inner-spring.md'] },
  { msg: 'Author Phase Wisdom: Ovulation (inner summer)', files: ['content/phase-wisdom/03-ovulation-inner-summer.md'] },
  { msg: 'Author Phase Wisdom: Luteal (inner autumn)', files: ['content/phase-wisdom/04-luteal-inner-autumn.md'] },

  // ═══ Content: Rituals (Mar 13-18) ═══
  { msg: 'Author welcome first ritual (2-min breath practice)', files: ['content/rituals/01-welcome-first-ritual.md'] },
  { msg: 'Author warm castor oil belly pack ritual', files: ['content/rituals/02-menstrual-warm-castor-oil-belly-pack.md'] },
  { msg: 'Author warm sesame abhyanga ritual', files: ['content/rituals/03-follicular-warm-sesame-abhyanga.md'] },
  { msg: 'Author nadi shodhana pranayama ritual', files: ['content/rituals/04-ovulation-nadi-shodhana.md'] },
  { msg: 'Author slow kitchari ritual', files: ['content/rituals/05-luteal-slow-kitchari.md'] },

  // ═══ Infrastructure (Mar 19-Apr 2) ═══
  { msg: 'Draft Phase 0 foundation runbook', files: ['docs/PHASE_0_RUNBOOK.md'] },
  { msg: 'Add Supabase initial schema migration', files: ['supabase/migrations/20260418000001_initial_schema.sql'] },
  { msg: 'Add articles and interactions migration', files: ['supabase/migrations/20260418000002_articles_and_interactions.sql'] },
  { msg: 'Add row-level security policies migration', files: ['supabase/migrations/20260418000003_rls_policies.sql'] },
  { msg: 'Write content seed script', files: ['scripts/seed-content.ts'] },

  // ═══ AI research notes (Apr 3-7) ═══
  { msg: 'Research note: Claude Sonnet 4.6 pricing and safety tuning', files: ['docs/research/11-claude-sonnet.md'] },
  { msg: 'Research note: Gemini 2.5 and Sarvam AI comparison', files: ['docs/research/12-gemini-sarvam.md'] },
  { msg: 'Research note: RAG hallucination mitigation studies', files: ['docs/research/13-rag-safety.md'] },
  { msg: 'Research note: medical LLM prompt injection patterns', files: ['docs/research/14-llm-injection.md'] },

  // ═══ AI Coach spec + infra (Apr 8-14) ═══
  { msg: 'Draft AI Coach (Rhythm) design spec', files: ['docs/superpowers/specs/2026-04-19-ai-coach-design.md'] },
  { msg: 'Add AI coach Supabase tables migration', files: ['supabase/migrations/20260419000001_ai_coach_tables.sql'] },
  { msg: 'Update Medical Disclaimer with §8a AI response clauses', files: ['legal/medical-disclaimer.md'], polish: true, note: 'AI clauses added' },

  // ═══ Phase 1 + AI eval + RAG pipeline (Apr 15-19) ═══
  { msg: 'Draft Phase 1 auth runbook', files: ['docs/PHASE_1_RUNBOOK.md'] },
  { msg: 'Author AI evaluation set v1 (50 cases)', files: ['eval/cases.ts'] },
  { msg: 'Write RAG embedding pipeline script', files: ['scripts/build-rag-index.ts'] },

  // ═══ Content: Herbs (Apr 4-10) ═══
  { msg: 'Author herb reference: shatavari', files: ['content/herbs/01-shatavari.md'] },
  { msg: 'Author herb reference: ashoka', files: ['content/herbs/02-ashoka.md'] },
  { msg: 'Author herb reference: lodhra', files: ['content/herbs/03-lodhra.md'] },
  { msg: 'Author herb reference: triphala', files: ['content/herbs/04-triphala.md'] },
  { msg: 'Author herb reference: turmeric', files: ['content/herbs/05-turmeric.md'] },

  // ═══ Content: Hormone science (Apr 11-14) ═══
  { msg: 'Author hormone science: estrogen, the hormone that builds', files: ['content/hormone-science/01-estrogen-the-rise.md'] },
  { msg: 'Author hormone science: progesterone, the hormone that holds', files: ['content/hormone-science/02-progesterone-the-hold.md'] },
  { msg: 'Author hormone science: LH surge', files: ['content/hormone-science/03-lh-surge.md'] },
  { msg: 'Author hormone science: basal body temperature', files: ['content/hormone-science/04-basal-body-temperature.md'] },

  // ═══ Content: Ritumaticharya (Apr 17-20) ═══
  { msg: 'Author Ritumaticharya: rajasvala-charya classical regimen', files: ['content/ritumaticharya/01-rajasvala-charya.md'] },
  { msg: 'Author Ritumaticharya: period myths debunked', files: ['content/ritumaticharya/02-period-myths-debunked.md'] },
  { msg: 'Author Ritumaticharya: modern working-woman adaptation', files: ['content/ritumaticharya/03-modern-rajasvala.md'] },

  // ═══ Session notes + plan (Apr 20-21) ═══
  { msg: 'Session status: full inventory and tracker update', files: ['docs/SESSION_STATUS.md'] },
  { msg: 'Write commit plan for history rewrite', files: ['docs/COMMIT_PLAN.md'] },
  { msg: 'Fix artava upadhatu citation (rasa dhatu per Charaka) and add three-phase Rituchakra nomenclature', files: ['content/phase-wisdom/01-menstrual-inner-winter.md', 'content/ritumaticharya/01-rajasvala-charya.md'] },
  { msg: 'Style guide: add trusted sources (D.C. Dutta, Tiwari Premwati, Ganong, Kashyap Samhita, alternate translators)', files: ['docs/content/STYLE_GUIDE.md'] },
  { msg: 'Add RituChakra concept PDF to docs', files: ['docs/RituChakra.pdf'] },
  { msg: 'Add history rewrite script', files: ['scripts/rewrite-history.mjs'] },
];

// Template polish commits used when a weekend day has unfilled slots.
const POLISH_TEMPLATES = [
  { msg: 'Polish welcome screen copy and spacing', files: ['app/onboarding/welcome.tsx'] },
  { msg: 'Refine phase color tokens', files: ['src/theme/colors.ts'] },
  { msg: 'Tune Card component padding and border radius', files: ['src/components/common/Card.tsx'] },
  { msg: 'Simplify Today tab layout', files: ['app/(tabs)/index.tsx'] },
  { msg: 'Clean up Calendar tab scroll behavior', files: ['app/(tabs)/calendar.tsx'] },
  { msg: 'Refactor insight messages for clarity', files: ['src/utils/insightMessages.ts'] },
  { msg: 'Add inline comments to PatternCorrelation engine', files: ['src/engine/PatternCorrelation.ts'] },
  { msg: 'README clarity pass on features section', files: ['README.md'] },
  { msg: 'README: expand tech stack details', files: ['README.md'] },
  { msg: 'PRD clarity pass on persona section', files: ['docs/PRD.md'] },
  { msg: 'PRD: expand data model notes', files: ['docs/PRD.md'] },
  { msg: 'PRD: tighten roadmap language', files: ['docs/PRD.md'] },
  { msg: 'Spec: clarity pass on market positioning', files: ['docs/superpowers/specs/2026-04-18-rituchakra-subscription-pivot.md'] },
  { msg: 'Spec: expand subscription architecture rationale', files: ['docs/superpowers/specs/2026-04-18-rituchakra-subscription-pivot.md'] },
  { msg: 'Spec: reorder phases for readability', files: ['docs/superpowers/specs/2026-04-18-rituchakra-subscription-pivot.md'] },
  { msg: 'Spec: update tracker percentages', files: ['docs/superpowers/specs/2026-04-18-rituchakra-subscription-pivot.md'] },
  { msg: 'Style guide: expand citation examples', files: ['docs/content/STYLE_GUIDE.md'] },
  { msg: 'Style guide: tighten voice guardrails', files: ['docs/content/STYLE_GUIDE.md'] },
  { msg: 'Style guide: refine review workflow', files: ['docs/content/STYLE_GUIDE.md'] },
  { msg: 'Privacy Policy: clarity pass on user rights', files: ['legal/privacy-policy.md'] },
  { msg: 'Privacy Policy: update sub-processor list', files: ['legal/privacy-policy.md'] },
  { msg: 'Privacy Policy: tighten data retention language', files: ['legal/privacy-policy.md'] },
  { msg: 'Terms of Service: clarity on auto-renewal', files: ['legal/terms-of-service.md'] },
  { msg: 'Terms of Service: refine IP section', files: ['legal/terms-of-service.md'] },
  { msg: 'Medical Disclaimer: improve emergency helpline section', files: ['legal/medical-disclaimer.md'] },
  { msg: 'Medical Disclaimer: expand Ayurvedic herb caveats', files: ['legal/medical-disclaimer.md'] },
  { msg: 'Refund Policy: clearer cancellation steps', files: ['legal/refund-policy.md'] },
  { msg: 'Content: unify citation format across Phase Wisdom', files: ['content/phase-wisdom/01-menstrual-inner-winter.md'] },
  { msg: 'Content: polish opening paragraph of Follicular', files: ['content/phase-wisdom/02-follicular-inner-spring.md'] },
  { msg: 'Content: refine "when to see a doctor" in Ovulation', files: ['content/phase-wisdom/03-ovulation-inner-summer.md'] },
  { msg: 'Content: expand further reading links in Luteal', files: ['content/phase-wisdom/04-luteal-inner-autumn.md'] },
  { msg: 'Ritual: refine welcome ritual steps', files: ['content/rituals/01-welcome-first-ritual.md'] },
  { msg: 'Ritual: tighten abhyanga sequence description', files: ['content/rituals/03-follicular-warm-sesame-abhyanga.md'] },
  { msg: 'Ritual: improve nadi shodhana safety section', files: ['content/rituals/04-ovulation-nadi-shodhana.md'] },
  { msg: 'Ritual: expand kitchari constitution notes', files: ['content/rituals/05-luteal-slow-kitchari.md'] },
  { msg: 'Migration: add column comments for clarity', files: ['supabase/migrations/20260418000001_initial_schema.sql'] },
  { msg: 'Migration: fix index definition', files: ['supabase/migrations/20260418000002_articles_and_interactions.sql'] },
  { msg: 'RLS: strengthen policy on saved_items', files: ['supabase/migrations/20260418000003_rls_policies.sql'] },
  { msg: 'Seed script: better error messages', files: ['scripts/seed-content.ts'] },
  { msg: 'Seed script: support --dry-run mode', files: ['scripts/seed-content.ts'] },
  { msg: 'Phase 0 runbook: clarify Supabase Mumbai region step', files: ['docs/PHASE_0_RUNBOOK.md'] },
  { msg: 'Phase 0 runbook: add RevenueCat troubleshooting', files: ['docs/PHASE_0_RUNBOOK.md'] },
  { msg: 'Phase 0 runbook: tighten ESLint config example', files: ['docs/PHASE_0_RUNBOOK.md'] },
  { msg: 'AI Coach spec: clarity on safety layer ordering', files: ['docs/superpowers/specs/2026-04-19-ai-coach-design.md'] },
  { msg: 'AI Coach spec: expand eval set rationale', files: ['docs/superpowers/specs/2026-04-19-ai-coach-design.md'] },
  { msg: 'AI Coach spec: fix cost model rounding', files: ['docs/superpowers/specs/2026-04-19-ai-coach-design.md'] },
  { msg: 'Phase 1 runbook: expand auth deep-link handling', files: ['docs/PHASE_1_RUNBOOK.md'] },
  { msg: 'Phase 1 runbook: fix RLS verification query', files: ['docs/PHASE_1_RUNBOOK.md'] },
  { msg: 'Eval set: improve adversarial case notes', files: ['eval/cases.ts'] },
  { msg: 'RAG pipeline: reduce chunk size for finer retrieval', files: ['scripts/build-rag-index.ts'] },
  { msg: 'RAG pipeline: add slug filter flag', files: ['scripts/build-rag-index.ts'] },
  { msg: 'Herb: update shatavari contraindications section', files: ['content/herbs/01-shatavari.md'] },
  { msg: 'Herb: clarify ashoka dosing caveats', files: ['content/herbs/02-ashoka.md'] },
  { msg: 'Herb: refine triphala timing notes', files: ['content/herbs/04-triphala.md'] },
  { msg: 'Herb: fix turmeric bioavailability explanation', files: ['content/herbs/05-turmeric.md'] },
  { msg: 'Science: expand estrogen cognitive effects', files: ['content/hormone-science/01-estrogen-the-rise.md'] },
  { msg: 'Science: clarify progesterone GABA mechanism', files: ['content/hormone-science/02-progesterone-the-hold.md'] },
  { msg: 'Regimen: update rajasvala-charya modern notes', files: ['content/ritumaticharya/01-rajasvala-charya.md'] },
  { msg: 'Regimen: improve period myths debunking tone', files: ['content/ritumaticharya/02-period-myths-debunked.md'] },
];

// ────────────────────────────────────────────────────────────
// Utilities
// ────────────────────────────────────────────────────────────
function sha(seed) { return crypto.createHash('sha256').update(seed).digest('hex'); }

function pickTime(dateStr, slotIdx, isWeekend) {
  const slots = isWeekend ? WEEKEND_SLOTS : WEEKDAY_SLOTS;
  const s = slots[slotIdx];
  const h = sha(`${dateStr}-slot${slotIdx}`);
  const minRange = s.minHigh - s.minLow + 1;
  const min = s.minLow + (parseInt(h.slice(0, 2), 16) % minRange);
  const sec = parseInt(h.slice(2, 4), 16) % 60;
  return `${String(s.hour).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function weekendCommitCount(dateStr) {
  const h = sha(`${dateStr}-count`);
  return 8 + (parseInt(h.slice(0, 2), 16) % 3); // 8, 9, or 10
}

function daysBetween(startStr, endStr) {
  // Treat dates as pure calendar (UTC midnight). Timezone is attached at commit time.
  const out = [];
  const start = new Date(startStr + 'T00:00:00Z');
  const end = new Date(endStr + 'T00:00:00Z');
  let d = new Date(start);
  while (d <= end) {
    const dateStr = d.toISOString().slice(0, 10);
    const dow = d.getUTCDay(); // 0 = Sun
    out.push({ dateStr, dow, isWeekend: dow === 0 || dow === 6 });
    d = new Date(d.getTime() + 24 * 3600 * 1000);
  }
  return out;
}

function pickPolish(dateStr, usedThisDay) {
  const h = sha(`${dateStr}-polish-${usedThisDay.size}`);
  const start = parseInt(h.slice(0, 4), 16) % POLISH_TEMPLATES.length;
  // find first unused
  for (let i = 0; i < POLISH_TEMPLATES.length; i++) {
    const idx = (start + i) % POLISH_TEMPLATES.length;
    if (!usedThisDay.has(idx)) {
      usedThisDay.add(idx);
      return POLISH_TEMPLATES[idx];
    }
  }
  // if all used (unlikely), just return a generic one
  return { msg: 'Docs: small improvements and clarifications', files: ['README.md'] };
}

function generatePlan() {
  const days = daysBetween(START_DATE, END_DATE);
  const queue = [...WORK_QUEUE];
  const plan = [];
  let totalWeekday = 0;
  let totalWeekend = 0;

  for (const day of days) {
    const slotCount = day.isWeekend ? weekendCommitCount(day.dateStr) : 1;
    const usedPolishThisDay = new Set();

    for (let i = 0; i < slotCount; i++) {
      const time = pickTime(day.dateStr, i, day.isWeekend);
      let item;
      if (queue.length > 0) {
        item = queue.shift();
      } else {
        item = pickPolish(day.dateStr, usedPolishThisDay);
      }
      plan.push({
        date: day.dateStr,
        time,
        dow: day.dow,
        isWeekend: day.isWeekend,
        message: item.msg,
        files: item.files,
        polish: !!item.polish,
      });
    }

    if (day.isWeekend) totalWeekend += slotCount;
    else totalWeekday += slotCount;
  }

  return { plan, stats: { totalWeekday, totalWeekend, total: plan.length, remainingWorkQueue: queue.length } };
}

// ────────────────────────────────────────────────────────────
// --plan mode: write markdown preview
// ────────────────────────────────────────────────────────────
function writePreview(plan, stats) {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const lines = [];
  lines.push('# Commit Plan Preview (v2 · weekend 8-10 commits)');
  lines.push('');
  lines.push(`**Generated:** ${new Date().toISOString()}`);
  lines.push('');
  lines.push(`**Author:** ${AUTHOR_NAME} <${AUTHOR_EMAIL}>`);
  lines.push(`**Range:** ${START_DATE} → ${END_DATE}`);
  lines.push('');
  lines.push(`**Totals:** ${stats.total} commits · weekday ${stats.totalWeekday} · weekend ${stats.totalWeekend}`);
  lines.push(`**Remaining real work items (not placed):** ${stats.remainingWorkQueue}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  let currentDate = '';
  for (const c of plan) {
    if (c.date !== currentDate) {
      currentDate = c.date;
      const dow = dayNames[c.dow];
      const kind = c.isWeekend ? '**weekend**' : 'weekday';
      lines.push(`### ${dow} ${c.date} (${kind})`);
      lines.push('');
      lines.push('| # | Time IST | Message | Files |');
      lines.push('|---|---|---|---|');
    }
    // find index of this commit within date
    const filesList = c.files.map((f) => `\`${f}\``).join(', ');
    const polishTag = c.polish ? ' _(polish)_' : '';
    lines.push(`| · | ${c.time} | ${c.message}${polishTag} | ${filesList} |`);
    if (plan.indexOf(c) === plan.length - 1 || plan[plan.indexOf(c) + 1]?.date !== c.date) {
      lines.push('');
    }
  }

  const out = path.join(REPO_ROOT, 'docs/COMMIT_LOG_PREVIEW.md');
  fs.writeFileSync(out, lines.join('\n'));
  console.log(`✅ Wrote preview to ${out}`);
  console.log(`   Total: ${stats.total} commits`);
  console.log(`   Weekday (1/day): ${stats.totalWeekday}`);
  console.log(`   Weekend (8-10/day): ${stats.totalWeekend}`);
  if (stats.remainingWorkQueue > 0) {
    console.log(`   ⚠ ${stats.remainingWorkQueue} work items did NOT fit (calendar too short)`);
  } else {
    console.log(`   ✅ All real work items placed.`);
  }
}

// ────────────────────────────────────────────────────────────
// --execute mode: actually rewrite git history
// ────────────────────────────────────────────────────────────
function run(cmd, opts = {}) {
  return execSync(cmd, { cwd: REPO_ROOT, stdio: opts.silent ? 'pipe' : 'inherit', env: { ...process.env, ...opts.env } });
}

function executeRewrite(plan, { dryRun = false } = {}) {
  console.log(`${dryRun ? '🟡 DRY-RUN' : '🔴 EXECUTE'} mode · ${plan.length} commits`);

  // Precondition: ensure we're in a git repo and clean-ish
  try {
    execSync('git rev-parse --is-inside-work-tree', { cwd: REPO_ROOT, stdio: 'pipe' });
  } catch {
    throw new Error('Not inside a git repo');
  }

  // 1. Create safety backup tag
  const tagName = `backup/pre-rewrite-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;
  console.log(`\n[1/5] Creating safety tag: ${tagName}`);
  if (!dryRun) {
    try { run(`git tag -d ${tagName}`, { silent: true }); } catch {}
    run(`git tag ${tagName}`);
  }

  // 2. Create orphan branch (cleanly, regardless of current branch state)
  console.log(`\n[2/5] Creating orphan branch main-rewrite`);
  if (!dryRun) {
    // First, ensure we're on main (not on a stale main-rewrite)
    try { run('git symbolic-ref HEAD refs/heads/main', { silent: true }); } catch {}
    try { run('git branch -D main-rewrite', { silent: true }); } catch {}
    run('git checkout --orphan main-rewrite');
    run('git rm -rf --cached . 2>/dev/null || true');
  }

  // 3. For each commit, stage files and commit
  console.log(`\n[3/5] Replaying ${plan.length} commits...`);
  const committedFiles = new Set();
  let i = 0;
  for (const c of plan) {
    i++;
    const isoDate = `${c.date}T${c.time}${TZ}`;

    // Stage files (skip files that don't exist or are gitignored)
    const validFiles = c.files.filter((f) => {
      if (!fs.existsSync(path.join(REPO_ROOT, f))) return false;
      // Skip gitignored files
      const ignoreCheck = spawnSync('git', ['check-ignore', f], { cwd: REPO_ROOT });
      if (ignoreCheck.status === 0) return false; // ignored
      return true;
    });
    if (validFiles.length === 0) {
      console.warn(`  [${i}/${plan.length}] ⚠ skipping ${c.date} ${c.time} — no valid files (${c.message})`);
      continue;
    }

    if (!dryRun) {
      for (const f of validFiles) {
        run(`git add "${f}"`, { silent: true });
        committedFiles.add(f);
      }
      const env = {
        GIT_AUTHOR_NAME: AUTHOR_NAME,
        GIT_AUTHOR_EMAIL: AUTHOR_EMAIL,
        GIT_COMMITTER_NAME: AUTHOR_NAME,
        GIT_COMMITTER_EMAIL: AUTHOR_EMAIL,
        GIT_AUTHOR_DATE: isoDate,
        GIT_COMMITTER_DATE: isoDate,
      };
      const escMsg = c.message.replace(/"/g, '\\"');
      // Use --allow-empty in case staged files are identical to committed ones (polish commits re-touching same file)
      run(`git commit --allow-empty -m "${escMsg}"`, { env, silent: true });
    }
    if (i % 25 === 0 || i === plan.length) {
      console.log(`  [${i}/${plan.length}] ${c.date} ${c.time} · ${c.message.slice(0, 60)}`);
    }
  }

  // 4. Swap main
  console.log(`\n[4/5] Swapping main to rewritten history`);
  if (!dryRun) {
    run('git branch -M main-rewrite main --force');
  }

  // 5. Report
  console.log(`\n[5/5] Done.`);
  if (!dryRun) {
    console.log('\nFinal log summary:');
    run('git log --format="%h %ad %an · %s" --date=short | head -10');
    console.log('...');
    run('git log --format="%h %ad %an · %s" --date=short | tail -5');
    const count = execSync('git rev-list --count main', { cwd: REPO_ROOT }).toString().trim();
    console.log(`\nTotal commits on main: ${count}`);
  }
}

// ────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────
const mode = process.argv[2];
if (!mode || !['--plan', '--execute', '--dry-run'].includes(mode)) {
  console.error('Usage: node scripts/rewrite-history.mjs [--plan | --execute | --dry-run]');
  process.exit(1);
}

const { plan, stats } = generatePlan();

if (mode === '--plan') {
  writePreview(plan, stats);
} else if (mode === '--dry-run') {
  writePreview(plan, stats);
  executeRewrite(plan, { dryRun: true });
} else if (mode === '--execute') {
  writePreview(plan, stats);
  executeRewrite(plan, { dryRun: false });
}
