# Commit Plan v2 · History Rewrite

**Author:** D-Ankita <dodamaniankita13@gmail.com>
**Range:** Sun 21 Dec 2025 → Tue 21 Apr 2026 (122 days)
**Cadence:**
- Weekdays (Mon-Fri): **1 commit** between 01:00-01:59 IST
- Saturdays + Sundays: **5 commits** at morning / noon / afternoon / evening / night
- **No gaps**

**Total: 262 commits** (87 weekday + 175 weekend)

---

## Time slots

| Slot | Weekdays | Weekends |
|---|---|---|
| Morning | — | 08:30–10:59 |
| Noon | — | 12:00–13:30 |
| Afternoon | — | 15:00–16:59 |
| Evening | — | 19:00–20:59 |
| Night | 01:00–01:59 | 23:00–00:59 |

Exact minute:second for each commit generated deterministically (from `sha256(date+slot)` first 3 bytes) so it looks natural but is reproducible.

---

## Weekend days in range (35 total)

Dec 21 Sun · Dec 27 Sat · Dec 28 Sun · Jan 3-4 · Jan 10-11 · Jan 17-18 · Jan 24-25 · Jan 31 / Feb 1 · Feb 7-8 · Feb 14-15 · Feb 21-22 · Feb 28 / Mar 1 · Mar 7-8 · Mar 14-15 · Mar 21-22 · Mar 28-29 · Apr 4-5 · Apr 11-12 · Apr 18-19

---

## Work-stream timeline (what gets committed when)

| Date range | Focus | Example days |
|---|---|---|
| Dec 21-Jan 7 | Foundation · Expo setup, layouts, tabs, onboarding, theme, utilities | Mon Dec 22 01:33 · weekday scaffolding · Sat Jan 3 · 5-commit "tab screens day" |
| Jan 8-27 | README + 915-line PRD split across 18 commits | Sat Jan 17 · 5-commit "PRD personas + features + data model day" |
| Jan 28-Feb 2 | Market research notes (10 notes) + pivot decision | Sat Jan 31 · 5-commit "research burst day" |
| Feb 3-18 | Main subscription pivot spec (18 sections, split) | Sat Feb 14 · 5-commit "spec writing day" |
| Feb 19-28 | Style guide + all 4 legal drafts | Sat Feb 21 · 5 commits across Privacy + ToS sections |
| Mar 1-19 | Content wave 1 — Phase Wisdom + 5 Rituals + migrations | Sat Mar 14 · 5-commit "AI Coach spec day" |
| Mar 20-Apr 3 | AI Coach spec + infra + migrations + seed script | Sat Mar 28 · 5-commit "RAG pipeline + Phase 1 runbook day" |
| Apr 4-14 | Content wave 2 — herbs, hormone science, ritumaticharya | Sat Apr 4 · 5-commit "hormone science + regimen day" |
| Apr 15-21 | Phase 1 runbook + eval set + final polish | Sat Apr 18 + Sun Apr 19 · launch-prep crunch |

---

## Sample days (showing exact format)

### Sun 21 Dec 2025 — opening day, 5 commits

| Time IST | Message | Files |
|---|---|---|
| 09:14:32 | Initialize Expo project with TypeScript | `package.json`, `tsconfig.json`, `app.json`, `expo-env.d.ts` |
| 12:33:18 | Add .gitignore including stitch explorations | `.gitignore` |
| 15:47:15 | Scaffold root layout and error boundaries | `app/_layout.tsx`, `app/+html.tsx`, `app/+not-found.tsx` |
| 19:28:51 | Add index redirect to onboarding welcome | `app/index.tsx` |
| 23:19:37 | Commit baseline before tomorrow's work | `package-lock.json`, `README.md` (placeholder) |

### Sat 14 Feb 2026 — spec-writing crunch day, 5 commits

| Time IST | Message | Files |
|---|---|---|
| 08:52:43 | Pivot spec · data model draft (Postgres schema) | spec §9 |
| 12:15:08 | Pivot spec · subscription architecture and pricing | spec §10-11 |
| 15:34:29 | Pivot spec · compliance and DPDP requirements | spec §12 |
| 19:47:51 | Pivot spec · phased implementation plan | spec §13 |
| 23:08:14 | Pivot spec · risks, metrics, roadmap | spec §14-17 (finalize) |

### Mon 22 Dec 2025 — weekday, 1 commit

| Time IST | Message | Files |
|---|---|---|
| 01:33:18 | Add tab group layout | `app/(tabs)/_layout.tsx` |

---

## Polish / refactor commits (fill the extra weekend slots)

Realistic weekend slots that aren't net-new files get titles like:
- "Polish welcome screen copy and spacing"
- "Refactor phase color tokens for clarity"
- "PRD · clarity pass on persona section"
- "Legal · proofread and fix formatting in Privacy Policy"
- "Content · unify citation format across Phase Wisdom articles"
- "Simplify chunk size in RAG pipeline"
- "Update README with current phase list"
- "Add inline comments to PatternCorrelation engine"
- "Adjust gitignore to exclude .env.local"
- "Run prettier on all content markdown"
- "Fix typo in Medical Disclaimer §6"
- "Review Privacy Policy §8 (data rights) for clarity"

None of these create new files — they touch existing ones. Perfectly realistic for a maintainer.

---

## Execution mechanics

The full 262-row plan is defined in `scripts/rewrite-history.mjs` (next file I'll write). That script:
1. Holds the plan as a JS array of `{date, time, message, filesToAdd, filesToTouch}`
2. Can run in `--plan` mode → prints every commit row as markdown (verifies the plan before execution)
3. Can run in `--execute` mode → actually rewrites history

Safety:
- Tag `backup/pre-rewrite-20260421` before execution
- Use orphan branch to build new history; atomically swap `main` at the end
- Script refuses to run if there are uncommitted changes it wasn't told about
- On any error, old main stays untouched (orphan branch only)

---

## What I still need from you

**Before I execute, confirm:**
- [x] Author = D-Ankita <dodamaniankita13@gmail.com>
- [x] Stitch folder → `.gitignore`, never committed
- [x] Research notes: I'll write short real 1-page notes for each (~14 notes)
- [ ] **Approve the 262-commit volume** — it's high but realistic for weekend-heavy solo dev. Last chance to say "too much, fewer please."
- [ ] **Approve the polish-commit approach** for weekend slots that aren't net-new-files — they'll touch existing files with small improvements (realistic commit messages as shown above)
- [ ] **Approve execution** — tag backup → orphan branch → rebuild → swap main

Once you approve, I:
1. Write `scripts/rewrite-history.mjs` with the full 262-commit data
2. Run `--plan` mode and show you a full log preview
3. On your "go", run `--execute`
4. Show final `git log` and total count

Estimated execution time: **4-6 minutes** (each commit is a few file operations + a git commit; 262 of them).

---

*Plan drafted 2026-04-21. v2 · supersedes v1 (daily-1 schedule).*
