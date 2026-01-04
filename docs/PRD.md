# RituChakra — Product Requirements Document

**Version:** 1.0
**Last Updated:** March 2026
**Product Name:** RituChakra
**Tagline:** The rhythm of seasons within you.
**Platform:** iOS & Android (React Native / Expo)

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [Target Audience](#2-target-audience)
3. [Core Philosophy & Principles](#3-core-philosophy--principles)
4. [Branding & Identity](#4-branding--identity)
5. [Visual Design System](#5-visual-design-system)
6. [Onboarding Experience](#6-onboarding-experience)
7. [Home Screen](#7-home-screen)
8. [Calendar & Daily Logging](#8-calendar--daily-logging)
9. [Cycle Intelligence Engine](#9-cycle-intelligence-engine)
10. [Hormone & Energy Visualization](#10-hormone--energy-visualization)
11. [Insights & Pattern Recognition](#11-insights--pattern-recognition)
12. [Cycle History & Analytics](#12-cycle-history--analytics)
13. [Emotional & Cognitive Mapping](#13-emotional--cognitive-mapping)
14. [Lifestyle Intelligence](#14-lifestyle-intelligence)
15. [Medication & Event Intelligence](#15-medication--event-intelligence)
16. [Advanced Pattern Awareness](#16-advanced-pattern-awareness)
17. [Education Library](#17-education-library)
18. [Mental Health Integration](#18-mental-health-integration)
19. [Long-Term Body Literacy Dashboard](#19-long-term-body-literacy-dashboard)
20. [Cultural Intelligence](#20-cultural-intelligence)
21. [Settings & Customization](#21-settings--customization)
22. [Privacy & Data Architecture](#22-privacy--data-architecture)
23. [Notifications](#23-notifications)
24. [Community Layer](#24-community-layer)
25. [Ayurveda + Science: The Two-Layer Model](#25-ayurveda--science-the-two-layer-model)
26. [Data Model](#26-data-model)
27. [Success Metrics](#27-success-metrics)
28. [Guiding Constraint](#28-guiding-constraint)

---

## 1. Product Vision

RituChakra is not a period tracker. It is a **cycle intelligence system** — a personal hormone diary, a body awareness tool, and a calm digital companion.

The vision is to help every user build **body literacy**: the ability to understand, predict, and work with their body's natural rhythms rather than against them.

After sustained use, a RituChakra user should be able to say:
- "I know which days I'll feel low energy and I plan around them."
- "I understand why I feel this way today."
- "I trust this app because it never asked for my data and never told me what's wrong with me."

**What RituChakra is NOT:**
- Not a fertility tracker (though the biology overlaps)
- Not a medical diagnostic tool
- Not a clinical charting system
- Not a social platform

---

## 2. Target Audience

**Primary:** Women and menstruating individuals aged 18–40 who want to understand their cycle beyond just period dates.

**Segments:**
- First-time trackers who find clinical apps intimidating
- Experienced trackers frustrated by data-hungry apps that monetize their health data
- Users interested in Ayurvedic or holistic wellness perspectives alongside science
- Working professionals who want to align their schedule with their energy patterns
- Users in India and South Asia who want cultural sensitivity around menstruation

---

## 3. Core Philosophy & Principles

### Privacy Is Non-Negotiable
All data stays on the user's device. No accounts. No cloud sync. No analytics. No ads. No third-party SDKs that phone home. Health apps win on trust — and trust is earned by architecture, not promises.

### Wellness Over Clinical
The app uses warm, human language. It says "your body is renewing" instead of "you are menstruating." It says "some people find..." instead of "you should." It never diagnoses. It surfaces patterns and lets the user draw conclusions.

### Insight Over Advice
The app does not tell users what to do. It shows them what their body has been doing. "Your sleep dips 2 days before menstruation consistently" is more powerful and respectful than "Sleep more before your period."

### Depth Over Width
A deeply accurate phase engine, a solid pattern recognizer, and a trusted tone are worth more than 100 shallow features.

### Science + Tradition, Respected Separately
Science is the default layer. Ayurvedic/traditional wisdom is an optional, clearly labeled layer the user can toggle on. Neither undermines the other. The phrasing is always "some people find..." — never "this will cure..."

---

## 4. Branding & Identity

**Name:** RituChakra
- *Ritu* = Season (Sanskrit)
- *Chakra* = Cycle / Wheel (Sanskrit)
- Together: "The rhythm of seasons within you."

**Why this name works:**
- Biologically accurate — the menstrual cycle is a repeating seasonal rhythm of hormones, energy, and mood
- Culturally rooted — deeply Indian without being exclusionary
- Feels like a system, not a novelty app
- Does not sound medical, clinical, or childish

**Brand positioning options:**
- "RituChakra — Understand Your Inner Seasons."
- "RituChakra — Clarity in Every Phase."
- "RituChakra — Cycle Awareness. Rooted & Real."

**App identifiers:**
- iOS Bundle ID: `com.rituchakra.app`
- Android Package: `com.rituchakra.app`
- Orientation: Portrait only
- Tablet support: No (phone-first experience)

---

## 5. Visual Design System

### Philosophy
The design should feel warm, inviting, and human. No sterile medical blues. No overly playful pinks. A grounded, nature-inspired palette that maps to the four cycle phases.

### Color Palette

**Phase Colors (Primary):**

| Phase | Color | Hex | Feel |
|-------|-------|-----|------|
| Menstrual | Dusty Rose | `#C7556F` | Warm, grounding, rest |
| Follicular | Warm Amber | `#E8956A` | Rising energy, optimism |
| Ovulation | Golden Yellow | `#F5C26B` | Peak, confidence, warmth |
| Luteal | Sage Green | `#7B9E6B` | Quiet, inward, nature |

**Phase Colors (Light / Background):**

| Phase | Hex |
|-------|-----|
| Menstrual | `#F5D5DD` |
| Follicular | `#FDE8D8` |
| Ovulation | `#FFF3D6` |
| Luteal | `#D4E5CD` |

**Base Colors:**

| Role | Hex | Usage |
|------|-----|-------|
| Background | `#FFF8F5` | App background (warm cream) |
| Surface | `#FFFFFF` | Cards, modals |
| Surface Alt | `#FFF0EB` | Alternate card backgrounds |
| Text Primary | `#2D2226` | Headings, body text |
| Text Secondary | `#6B5A5F` | Subtitles, labels |
| Text Tertiary | `#A3929A` | Hints, placeholders |
| Text Inverse | `#FFFFFF` | Text on dark backgrounds |
| Border | `#E8DCD8` | Card borders |
| Divider | `#F0E6E2` | Section dividers |
| Error | `#D84315` | Destructive actions, errors |
| Success | `#558B2F` | Confirmations |
| Predicted | `#D4C5BF` | Predicted/estimated data |

### Layout Principles
- Card-based UI with rounded corners (6px, 12px, 16px radius options)
- Generous whitespace — the app should breathe
- Spacing scale: 8px (small), 12px (medium), 16px (large)
- Safe area compliance for notch/dynamic island devices
- No visual clutter — every element earns its space

### Typography
- Hierarchy: h1, h2, h3, body, caption, label
- System fonts (no custom font downloads)
- Warm, readable sizing with clear hierarchy

### Iconography
- FontAwesome icon set
- Tab bar icons: home, calendar, chart-line, list, cog
- Consistent icon weight throughout

---

## 6. Onboarding Experience

The onboarding should feel like a gentle introduction, not a medical intake form. Two steps. Under one minute.

### Screen 1: Welcome

**Content:**
- App logo / name: "RituChakra"
- Tagline: "The rhythm of seasons within you"
- Description: "Understand your cycle with clarity and care. Track patterns, discover insights, and tune into your body's natural rhythm."
- Privacy callout box: "Your privacy matters — Everything stays on your device. No accounts, no cloud, no tracking. Your data is yours alone."
- CTA: "Begin"

**Purpose:** Establish brand, communicate value, build trust immediately with privacy commitment.

### Screen 2: Last Period Date (Step 1 of 2)

**Content:**
- Header: "When did your last period start?"
- Subtitle: "This helps us understand where you are in your cycle."
- UI: Grid calendar showing the last 35 days
- Default selection: 14 days ago
- Escape hatch: "I don't remember" — defaults to today

**Behavior:**
- Tapping a date highlights it in the menstrual phase color
- Today's date has a distinct border
- Continue button navigates to Step 2

### Screen 3: Cycle Length (Step 2 of 2)

**Content:**
- Header: "How long is your typical cycle?"
- Subtitle: "Count from the first day of one period to the first day of the next. Most cycles are 21–35 days."
- UI: Horizontal scrolling number picker (21–40 days)
- Large centered display of selected number
- Default: 28 days
- Escape hatch: "I'm not sure (use 28 days)"

**On completion:**
- Creates the initial cycle record in the database
- Calculates current cycle day and phase
- Marks onboarding as complete
- Navigates to the main app

---

## 7. Home Screen

The home screen is the daily dashboard — the first thing the user sees. It should answer three questions instantly:
1. What phase am I in today?
2. When is my next period?
3. What should I know about today?

### Phase Display Card
- Current phase name (Menstrual / Follicular / Ovulation / Luteal)
- Current day within that phase (e.g., "Day 3 of Follicular Phase")
- Phase-colored background
- Phase duration context

### Period Tracking Actions
- "Period Started" button — logs the start of menstruation with confirmation dialog
- "Period Ended" button — logs the end of menstruation with confirmation dialog
- These are the most important interactions and should be prominent

### Next Period Prediction
- Predicted date or date range
- Confidence indicator: Low / Moderate / High
- Format: "Predicted window: 12th–14th (moderate confidence)" — not just a single date

### Daily Insight
- One contextual wellness message based on current phase and cycle day
- Rotates through 5 messages per phase (20 total)
- Tone: warm, educational, supportive

**Menstrual phase messages:**
1. "Your body is renewing. Rest is productive during this phase."
2. "Iron-rich foods like spinach and lentils may help replenish what your body needs."
3. "Gentle stretching or a slow walk can ease discomfort more than staying still."
4. "This is a great time for reflection and planning rather than high-intensity tasks."
5. "Warmth — a cup of chai, a warm compress — can be your best friend right now."

**Follicular phase messages:**
1. "Estrogen is rising — many people feel more creative and energetic now."
2. "Your brain may be especially sharp. Good time for learning or problem-solving."
3. "This phase often brings a natural boost in motivation and social energy."
4. "Your body tends to recover faster from exercise during this phase."
5. "Planning ahead? This is when many people feel most optimistic and forward-looking."

**Ovulation phase messages:**
1. "Energy and confidence tend to peak around ovulation for many people."
2. "You may feel more social and communicative — a natural strength of this phase."
3. "This is typically when estrogen reaches its highest point in the cycle."
4. "Your body temperature may rise slightly — this is completely normal."
5. "Many people find this is their most productive time. Channel it well."

**Luteal phase messages:**
1. "Progesterone is rising. Your body is shifting toward a quieter rhythm."
2. "Cravings are common and normal — your body may need more fuel right now."
3. "Focus and deep work can still be strong early in this phase."
4. "As the phase progresses, prioritize rest and gentle routines."
5. "Magnesium-rich foods like dark chocolate and nuts may help with comfort."

### Quick Log Button
- Floating or prominent button to open the daily log modal
- Low friction — the user should be able to log in under 30 seconds

---

## 8. Calendar & Daily Logging

### Calendar View
- Month-at-a-glance grid
- Navigate between months (previous/next)
- Each day cell is background-colored by its cycle phase
- Period days show a distinct dot/marker
- Today has a highlighted border
- Tapping a day opens the daily log modal for that date

### Mark Period Days Mode
- A toggle mode that lets users quickly tap multiple days to mark them as period days
- Faster than opening individual day modals
- Visual feedback on each tap

### Phase Legend
- Visual reference strip showing all four phases with their colors and labels
- Always visible on the calendar screen

### Daily Log Modal

The daily log is the primary data input surface. It should be comprehensive but not overwhelming. Every field is optional.

**Flow Level:**
- None / Light / Medium / Heavy
- Visual selector (not a dropdown)

**Symptoms (multi-select, 12 options):**
- Cramps
- Headache
- Bloating
- Acne
- Fatigue
- Back pain
- Breast tenderness
- Nausea
- Dizziness
- Mood swings
- Cravings
- Insomnia

**Mood (single-select, 8 options):**
- Calm
- Happy
- Anxious
- Irritable
- Sad
- Energetic
- Sensitive
- Focused

**Energy Level:**
- 1–5 scale (visual selector)

**Sleep Quality:**
- 1–5 scale (visual selector)

**Sleep Hours:**
- Numeric input

**Medications:**
- Free-form text input for medication names
- Stored as a list

**Notes:**
- Free-form text area for anything the user wants to record

**Behavior:**
- If a log already exists for a date, it loads the existing data for editing
- Save updates the record; no duplicate entries per day
- All timestamps normalized to midnight for consistency

---

## 9. Cycle Intelligence Engine

This is the biological foundation of the app. It must be extremely strong and accurate.

### Phase Calculation Model

The menstrual cycle is divided into four phases. The model uses these constants:

- Luteal phase length: **14 days** (most biologically consistent across individuals)
- Menstrual phase length: **5 days** (fixed)
- Ovulation window: **3 days**

**Phase boundaries (for a given cycle length):**

| Phase | Start Day | End Day | Duration |
|-------|-----------|---------|----------|
| Menstrual | 1 | 5 | 5 days (fixed) |
| Follicular | 6 | Ovulation Day - 1 | Variable |
| Ovulation | Ovulation Day | Ovulation Day + 2 | 3 days |
| Luteal | Ovulation Day + 3 | Cycle Length | ~14 days |

**Ovulation Day** = Cycle Length - 14

Example for a 28-day cycle:
- Menstrual: Days 1–5
- Follicular: Days 6–13
- Ovulation: Days 14–16
- Luteal: Days 17–28

Example for a 35-day cycle:
- Menstrual: Days 1–5
- Follicular: Days 6–20
- Ovulation: Days 21–23
- Luteal: Days 24–35

### Prediction Engine

The prediction engine uses a **strategy pattern** that automatically upgrades as the user accumulates more data:

**Strategy 1: Default (0–2 completed cycles)**
- Uses the user's stated cycle length or defaults to 28 days
- Confidence: Always **Low**
- Message: "Insufficient data — using standard estimate"

**Strategy 2: Weighted Moving Average (3–5 completed cycles)**
- Weights recent cycles more heavily: most recent (3x), second most recent (2x), older (1x)
- Confidence: **Moderate** if standard deviation ≤ 2 days, otherwise **Low**
- Shows factors: number of cycles analyzed, weighted average, variation range

**Strategy 3: Personal Pattern (6+ completed cycles)**
- Uses exponential decay weighting (decay factor: 0.85) — heavily favors recent patterns
- Detects trends (cycles getting longer or shorter over time)
- Calculates weighted standard deviation
- Confidence: **High** if stdDev ≤ 2, **Moderate** if ≤ 4, **Low** otherwise

**Manual Override Strategy:**
- User sets fixed cycle and period lengths in settings
- Predictions use these fixed values regardless of tracked data
- Available at any time as a user preference

### Prediction Display Format
Not: "Next period: March 12th"
But: "Predicted window: March 12–14 (moderate confidence)"

The confidence label communicates transparency. The user should always know how much the app is guessing.

**Confidence labels:**
- Low confidence
- Moderate confidence
- High confidence

---

## 10. Hormone & Energy Visualization

Educational hormone charts that help users understand the invisible biology behind how they feel. These are **not medical-grade** — they are interpretive visualizations.

### Estrogen Curve (normalized 0–1)
- Days 1–5: Low (0.1 → 0.2), rising slowly
- Days 6 to ovulation: Exponential rise to peak (0.9)
- Post-ovulation: Sharp drop
- Mid-luteal: Secondary rise (~0.7)
- Late luteal: Gradual decline back to baseline

### Progesterone Curve (normalized 0–1)
- Days 1 to ovulation: Basal level (0.05)
- Luteal phase: Bell curve (Gaussian distribution, spread 0.3)
- Peak at ~60% through the luteal phase (0.9)
- Drops before menstruation

### Energy Curve (normalized 0–1)
- Days 1–3: Low (0.3)
- Days 4–5: Slightly rising (0.4)
- Follicular through ovulation: Rises to peak (0.9)
- Post-ovulation: Maintains moderate-high (0.7)
- Luteal decline: Gradual drop from 0.7 → 0.3

### Visual Presentation
- Smooth gradient-filled curves rendered with canvas (Skia)
- Color-coded: Estrogen (dusty rose), Progesterone (sage green), Energy (warm amber)
- Current-day marker (circle indicator on the curve)
- All curves adapt to the user's actual cycle length
- Clear disclaimer: "These are educational estimates, not medical data."

### Cycle Phase Progress Bar
- Horizontal bar showing all four phases proportionally
- Active phase in full color, inactive phases in lighter tones
- Ovulation phase shown as a narrower segment (3 days)

---

## 11. Insights & Pattern Recognition

### Personal Patterns (unlocks after 3 completed cycles)
- Before unlock: Progress indicator showing "Track X more cycles to unlock personal insights"
- After unlock: Phase-specific personal averages
  - Common symptoms per phase
  - Common moods per phase
  - Average phase durations
  - Personalized messages based on the user's own data

### The Power of Personal Patterns
Not generic: "During luteal phase you may feel..."
Instead: "Based on your past 6 cycles, you usually report low energy on days 24–26."

This is the differentiator. Generic phase descriptions are available on any website. Personalized, data-driven observations based on the user's own body are what make RituChakra indispensable.

---

## 12. Cycle History & Analytics

### Symptom Frequency Analysis
- Top 8 most common symptoms ranked by frequency
- Percentage bars showing how often each symptom appears across all logged data
- Based on complete tracking history

### Cycle History List
- Chronological list of all completed cycles
- Each entry shows: start date, end date, cycle length
- Ongoing (current) cycle shown separately
- Visual indicator of whether cycle was longer/shorter than average

### Empty State
- New users see guidance: "Start logging to see your patterns here"
- Encouraging, not clinical

---

## 13. Emotional & Cognitive Mapping

This layer is a key differentiator. It maps emotional and cognitive patterns to the cycle.

### Mood Pattern Mapping
- Track mood per cycle day across multiple cycles
- Identify recurring anxiety days
- Identify productivity spikes
- Emotional summary per month/cycle
- Goal insight: "Your focus tends to peak mid-follicular phase."

### Productivity Sync
- Suggest lighter tasks during low-energy days
- Suggest deep work windows during high-energy phases
- Not mandatory — optional integration with the user's workflow
- Tone: suggestion, not prescription

---

## 14. Lifestyle Intelligence

Balanced science + tradition. Practical, not preachy.

### Phase-Based Nutrition Suggestions
Not a rigid diet plan. Gentle, phase-appropriate reminders:
- Menstrual: Iron-rich food reminders (spinach, lentils)
- Mid-cycle: Hydration reminders
- Luteal: Magnesium-rich foods (dark chocolate, nuts)
- Traditional warm food suggestions (optional, via Ayurveda toggle)
- Tone: "Some women find..." — never prescriptive

### Movement Guidance
- Menstrual: Gentle stretching, slow walks
- Follicular: Strength training, learning new movements
- Ovulation: Social exercise, high-energy activities
- Luteal: Moderate movement, winding down
- Heavy flow days: Rest encouragement
- No medical claims

### Sleep Pattern Overlay
- Connect cycle phase to sleep quality trends
- Goal insight: "Your sleep dips 2 days before menstruation consistently."
- Insight over advice — show the pattern, let the user decide

---

## 15. Medication & Event Intelligence

Handled safely and responsibly. No dosage logic. No medical advice.

### Emergency Contraception Impact Awareness
- User logs the date of emergency contraception
- App shows expected disruption window for the current cycle
- Tracks variability in the next cycle
- Provides educational explanation of how EC can affect cycle timing
- No guidance on taking it — only tracking and awareness

### Hormonal Medication Tracker
- Log ongoing medications: thyroid medication, PCOS medication, birth control pills, etc.
- No dosage tracking or adherence reminders
- Correlation awareness: helps the user see if medication changes align with cycle changes

---

## 16. Advanced Pattern Awareness

After enough data accumulates, the app surfaces pattern observations. Never diagnoses.

### Irregularity Trend Detection
- Sudden cycle length changes
- Very short luteal phase trends
- Frequently missed cycles
- Framed as: "Pattern observation" → "Consider discussing with a professional."

### Symptom Clustering Awareness
- Detects recurring symptom combinations:
  - Acne + irregular cycles
  - Heavy bleeding + fatigue
  - Severe cramps + nausea recurring
- Never labels a disease
- Only surfaces the pattern with a gentle suggestion to consult a healthcare provider if concerned

---

## 17. Education Library

This is the long-term trust builder. Structured, responsible, and thorough.

### Modules:
1. Understanding your 4 phases
2. What is ovulation really?
3. What affects cycle regularity?
4. Stress and hormones
5. PCOS basics (educational, not diagnostic)
6. Thyroid and the menstrual cycle
7. Emergency contraception facts
8. Myths vs. reality
9. Ayurveda and menstrual care traditions

### Content Principles:
- Written in plain language
- Reviewed for accuracy
- No medical claims or diagnoses
- Always directs users to professionals for concerns
- Available offline (bundled, not fetched from servers)

---

## 18. Mental Health Integration

Cycle-linked emotional support. Not therapy — support.

### PMS Emotional Care Section
- Journaling prompts tied to cycle phase
- Affirmations for difficult days
- Breathing exercises with guided timing
- Anxiety grounding tools (5-4-3-2-1 technique, etc.)

### Tone
Gentle. Not condescending. Acknowledges that PMS-related emotional shifts are real, valid, and manageable. Does not minimize or over-medicalize.

---

## 19. Long-Term Body Literacy Dashboard

Unlocks after 12 months of consistent tracking. This is the payoff for long-term users.

### Dashboard Metrics:
- Average cycle length (with trend)
- Most symptomatic phase
- Most productive phase
- Stress correlation trends
- Medication correlation trends
- Cycle stability score (presented in neutral, non-judgmental language)

### Presentation
This is powerful data. Present it cleanly, with context. Not as a "health report card" — as a personal body literacy summary.

---

## 20. Cultural Intelligence

Features designed for real life — especially for users in India and South Asia.

### A. Period + Travel Planning
- Trip date overlay on cycle calendar
- Phase-aware preparedness checklist (comfort products, pain relief, spare clothing)
- Jet lag + sleep + hydration nudges
- Emergency comfort tips ("If cramps hit while out: warm drink, gentle stretches, heat patch")
- All travel planning stays on-device

### B. Period + Festival Awareness
- Festival calendar overlay (India-first, user selects region/state)
- Energy and social load guidance for festival days
- Phase-aware comfort planning for long days of standing, fasting, or heavy meals
- Discreet planning tools and checklists
- Cultural sensitivity: no judgment, just "choose what feels right for you"

### C. Period + Fasting Awareness
- Fasting type selector: full fast, fruits only, one meal, no fast
- Phase-aware safety nudges (non-medical):
  - Heavy flow days: "Some people feel weaker; consider modified fasting or extra hydration."
  - Luteal phase: "Blood sugar dips can worsen irritability; keep light snacks if your fast allows."
- Hydration and electrolyte reminders
- Food suggestions within fasting rules
- **Critical tone rule:** Never say "don't fast." Say: "Many women choose a modified version when needed."

### D. Period + Wedding Planning
- Event timeline overlay: wedding dates, functions, travel days
- Phase-aware comfort planning for multi-day events
- Skin and mood tendency windows (acne flare predictions, low-energy windows)
- Wardrobe suggestions (dark colors, backup comfort items)
- Emergency contraception tracking if logged (education-only, no guidance on taking it)

### E. Workplace Cycle Awareness
- Workload planner overlay: user marks heavy meeting days, presentations, travel
- Phase-informed work style suggestions:
  - Menstrual: "Lighter schedule, buffer time"
  - Follicular: "Planning and learning"
  - Ovulation: "Communication, social confidence"
  - Luteal: "Wrap-up and deep focus"
- Discreet symptom tools: quick relief guide at desk, silent reminders
- Workplace privacy pack checklist

---

## 21. Settings & Customization

### Cycle Settings
- View current cycle length

### Prediction Mode
- Toggle between Auto (intelligent, data-driven) and Manual (user-defined fixed lengths)
- Manual mode controls:
  - Cycle length: 21–45 days (adjustable with +/- buttons)
  - Period length: 2–10 days (adjustable with +/- buttons)

### Notifications
- Daily reminder toggle
- Default time: 9:00 PM local time
- Label: "Get a gentle nudge to log your day"

### Wellness
- Ayurvedic Wisdom toggle
- When enabled: shows traditional wellness suggestions alongside science-based insights
- Label: "Optional traditional wellness suggestions"

### Data & Privacy
- Privacy statement: "All your data is stored locally on this device. Nothing is sent to any server."
- Export Data: Download all data as a JSON file
- Delete All Data: Permanent deletion with destructive confirmation dialog

### About
- App name and version
- Tagline display

---

## 22. Privacy & Data Architecture

### Principles
- **Local-only storage** — SQLite database on the user's device
- **No accounts** — no registration, no login, no email collection
- **No cloud sync** — nothing leaves the device
- **No analytics SDKs** — no Firebase Analytics, no Mixpanel, no Amplitude
- **No ad networks** — no tracking pixels, no ad identifiers
- **Transparent data usage** — the app tells the user exactly what it stores and why

### Data Export
- User can export all their data as a JSON file at any time
- Shared via the device's native share sheet

### Data Deletion
- One-tap permanent deletion of all data
- Confirmation dialog warns this is irreversible
- No soft delete — data is truly removed from the database

### Future: Optional Encrypted Backup
- Optional local encrypted backup for users who want to protect against data loss
- Encryption key stays with the user — not recoverable by the app developer
- Still no cloud component

### Future: Exportable PDF Report
- Generate a cycle summary report as a PDF
- Useful for sharing with a healthcare provider
- User-initiated only

---

## 23. Notifications

### Daily Reminder
- Toggleable in settings
- Default: enabled
- Time: 9:00 PM local time
- Tone: gentle, not nagging
- Example: "How was your day? Take a moment to log."
- Notification accent color: `#C7556F` (menstrual phase color — brand recognition)

### Future Notification Types
- Period prediction alerts (3 days before predicted start)
- Phase transition notifications ("You're entering your follicular phase today")
- Cycle milestone celebrations ("You've tracked 6 complete cycles!")

---

## 24. Community Layer

**Status: Optional and requires extreme care.**

If implemented, it should be:
- Anonymous story snippets (no profiles, no DMs)
- Educational Q&A with expert-reviewed content
- Moderated carefully — no medical claims allowed
- No open forum dynamics

What it should NOT be:
- A social network
- A place for medical advice
- Unmoderated

This feature is optional and heavy. It should only be built after the core product is excellent.

---

## 25. Ayurveda + Science: The Two-Layer Model

This is how RituChakra makes traditional wisdom credible without being dismissive of science.

### Layer 1: Science (always present, default)
- Phase explanations grounded in hormone biology (in simple terms)
- Common symptoms and what's biologically typical
- Neutral "common vs. check-in needed" framing (no diagnosis)

### Layer 2: Traditional Wisdom (optional toggle in settings)
- Activated via "Traditional Wellness Suggestions" switch
- Shows: warm food suggestions, gentle movement practices, rest traditions, oil massage practices
- **Never** uses words like "cure" or "guarantee"
- **Always** phrased as "some people find..."
- Clearly labeled as traditional wellness, not medical advice

### Why Two Layers
This avoids the "Ayurveda vs. science" debate entirely. The user chooses. Both are presented respectfully. Neither undermines the other.

---

## 26. Data Model

### Cycles Table
| Field | Type | Description |
|-------|------|-------------|
| id | Integer (PK) | Auto-incrementing unique ID |
| startDate | Integer | Timestamp (ms) of cycle start |
| endDate | Integer (nullable) | Timestamp (ms) of cycle end |
| length | Integer (nullable) | Calculated cycle length in days |
| isPredicted | Boolean | Whether this cycle was auto-predicted |
| createdAt | Integer | Creation timestamp |
| updatedAt | Integer | Last update timestamp |

### Daily Logs Table
| Field | Type | Description |
|-------|------|-------------|
| id | Integer (PK) | Auto-incrementing unique ID |
| date | Integer | Timestamp (ms), normalized to midnight |
| cycleId | Integer (FK) | Reference to cycles table |
| cycleDay | Integer | Day number within the cycle |
| phase | Text | menstrual / follicular / ovulation / luteal |
| flowLevel | Text | none / light / medium / heavy |
| symptoms | Text (JSON) | Array of symptom strings |
| mood | Text (nullable) | Single mood value |
| energy | Integer (nullable) | 1–5 scale |
| sleepQuality | Integer (nullable) | 1–5 scale |
| sleepHours | Real (nullable) | Decimal hours |
| notes | Text (nullable) | Free-form text |
| medications | Text (JSON) | Array of medication strings |
| createdAt | Integer | Creation timestamp |
| updatedAt | Integer | Last update timestamp |

### Predictions Table
| Field | Type | Description |
|-------|------|-------------|
| id | Integer (PK) | Auto-incrementing unique ID |
| cycleId | Integer (FK, nullable) | Reference to cycles table |
| predictedStart | Integer | Predicted start timestamp (ms) |
| predictedEnd | Integer | Predicted end timestamp (ms) |
| confidence | Text | low / moderate / high |
| factors | Text (JSON) | Array of explanation strings |
| createdAt | Integer | Creation timestamp |

### Phase Insights Table
| Field | Type | Description |
|-------|------|-------------|
| id | Integer (PK) | Auto-incrementing unique ID |
| phase | Text | Phase name |
| avgDuration | Real | Average duration of this phase |
| commonSymptoms | Text (JSON) | Most frequent symptoms |
| commonMoods | Text (JSON) | Most frequent moods |
| personalizedMessage | Text (nullable) | Generated insight message |
| cycleCount | Integer | Number of cycles analyzed |
| updatedAt | Integer | Last update timestamp |

---

## 27. Success Metrics

### Engagement
- Daily active users who log at least once
- Average logs per cycle (target: 15+ days logged per cycle)
- Cycle completion rate (users who track full cycles, not just period days)

### Retention
- 30-day retention rate
- 3-cycle retention rate (the point where personal insights unlock)
- 6-cycle retention rate (the point where the best prediction strategy activates)

### Trust
- Data export usage (users who export are confident in the app)
- Zero cloud-related privacy complaints
- App store reviews mentioning privacy/trust

### Depth
- Percentage of users who log symptoms (not just flow)
- Percentage of users who log mood and energy
- Percentage of users who view the insights screen regularly

---

## 28. Guiding Constraint

> In 2 years you can build 50 features. But **depth > width.**
>
> If by year 2:
> - Your phase explanations are deeply accurate
> - Your pattern engine is solid
> - Your tone is trusted
>
> That's better than 100 shallow features.

RituChakra should feel like a system you trust — not an app you tolerate.

---

*RituChakra — Because understanding your cycle should feel natural, not clinical.*
