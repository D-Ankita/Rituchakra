# RituChakra — Privacy Policy

**Effective Date:** [DATE — to be set at launch]
**Last Updated:** [DATE]
**Status:** DRAFT — for lawyer review before publication
**Legal basis:** India's Digital Personal Data Protection Act, 2023 (DPDP) · DPDP Rules 2025 · Consumer Protection Act, 2019 · Apple App Store Review Guidelines §5.1.1 · Google Play User Data policy.

---

## 1. About this Policy

This Privacy Policy describes how **[Company Legal Name]** (referred to as "we," "us," or "RituChakra") collects, uses, stores, shares, and protects your personal data when you use the RituChakra mobile application and related services (the "Service").

**You are the Data Principal.** We are the Data Fiduciary under the DPDP Act, 2023. This means: it's your data, we are responsible for it, and the law grants you specific rights over it, which are described in §8 below.

**Plain-English summary (in case you don't read the rest):**
- We collect what's needed to run a cycle-tracking and Ayurveda wellness app. Nothing more.
- Your cycle data stays in India (Supabase Mumbai region, `ap-south-1`).
- We never sell your data. We never use your health data for advertising.
- You can export or delete everything you've given us, anytime, from inside the app.
- If anything in this policy feels unclear, email us at **privacy@rituchakra.app** and we'll explain in plainer words.

---

## 2. Whose Data We Collect

We collect personal data from:
- People who create a RituChakra account (the "User" / "Data Principal").
- Visitors who sign up for our waitlist or newsletter (if applicable).

We do **not** knowingly collect data from anyone under the age of 18. Cycle tracking apps are lawful for minors in India when a verifiable parent consent is present; we do not support that flow at this time.

---

## 3. What Data We Collect

### 3.1 Data you give us directly

| Category | Examples | Why we need it |
|---|---|---|
| **Account data** | Email address, display name, profile avatar | Sign-in, account recovery, greeting you by name |
| **Cycle data** | Period start and end dates, cycle length, period length | Core purpose — tracking your menstrual cycle |
| **Daily entries** | Mood, symptoms, flow level, energy, sleep hours, digestive quality (*agni*), libido, free-text notes | Personalized phase insights and Ayurveda recommendations |
| **Settings & preferences** | Notification preferences, quiet hours, timezone, locale | Respecting your boundaries and context |
| **Saved content** | Rituals you save · articles you save | Your personal library |
| **Ritual completions** | Which rituals you mark complete and when | Pattern detection + streaks |

### 3.2 Data collected automatically

| Category | Examples | Why we need it |
|---|---|---|
| **Device metadata** | Device model, OS version, app version, language, timezone | Technical support · bug triage · compatibility |
| **Usage events** | Screen views, feature interactions (anonymized + aggregated) | Improving the app |
| **Crash logs** | Stack traces, device state at time of crash | Fixing bugs |

Analytics is handled by **PostHog** (self-hosted or EU-hosted — see §7). Crash reports by **Sentry**. We do not enable advertising SDKs.

### 3.3 Data from third parties
If you sign in with Google or Apple, we receive your email address, display name, and (optionally) profile picture from them. We do not receive contacts, photos, or any other data from these providers.

### 3.4 Data we do NOT collect
- We do **not** access your device's photo library, camera, contacts, microphone, or precise location unless you explicitly grant permission for a specific feature and we clearly explain why.
- We do **not** use HealthKit, Google Fit, or Samsung Health integrations at this time. If we add these in the future, it will be strictly opt-in.
- We do **not** use advertising identifiers (IDFA/AAID) for tracking.

---

## 4. How We Use Your Data (Purpose Limitation)

Under DPDP §4, we state every purpose explicitly. We use your data **only** for the following purposes:

1. **Run the Service** — track your cycle, detect phases, show you insights, deliver content.
2. **Personalize recommendations** — using your phase + logged symptoms + *dosha* profile to surface relevant Ayurveda articles and rituals.
3. **Communicate with you** — transactional emails (sign-in links, password resets, subscription receipts, phase change alerts if enabled).
4. **Support + troubleshoot** — responding to your questions or reports.
5. **Improve the product** — aggregated, anonymized usage patterns.
6. **Legal compliance** — when a valid court order, tax obligation, or consumer-law request arises.

We do **not** use your data for:
- Advertising, ad targeting, or marketing to third parties.
- Training external AI models. (If we ever add AI features, it will be done on de-identified data, with explicit notice and opt-out.)
- Health insurance risk assessment, employer reporting, or any secondary data-brokerage use.

---

## 5. Legal Basis for Processing

Under DPDP §4, we process your personal data on the following grounds:
- **Your consent** (§6 of the DPDP) — for creating your account, collecting health data, and sending optional notifications.
- **Certain legitimate uses** (§7) — for resolving payment disputes, responding to legal orders, and preventing fraud.

Consent is collected at onboarding in plain English, is itemized by purpose, and can be withdrawn at any time (see §8).

---

## 6. Sharing Your Data

We share personal data only in these limited circumstances:

| Who | What | Why | Where data sits |
|---|---|---|---|
| **Supabase** (our backend provider) | All account + cycle data | Storage, authentication, database | India — `ap-south-1` (Mumbai) region |
| **RevenueCat** (subscription management) | Your RevenueCat ID, store (App Store / Play Store), subscription status, purchase events | Managing your subscription entitlement across iOS and Android | United States · EU · contractual data-processing agreement in place |
| **Apple App Store / Google Play Store** | Payment details (processed by them — we never see your card or UPI) | Processing your subscription | Per Apple/Google's policies |
| **Sentry** (error tracking) | Crash reports, anonymized device info | Fixing bugs | EU (Frankfurt) |
| **PostHog** (analytics) | Anonymized usage events | Product improvement | EU or self-hosted |
| **Email provider** (e.g., Resend, Postmark) | Your email, message contents | Transactional emails only | To be selected — preference for India or EU region |
| **Legal / regulatory** | As required | Court orders, DPDP Board requests, tax obligations | India |

We do **not** sell your data. We do **not** share health data for advertising. We do **not** transfer data to data brokers.

---

## 7. International Transfers & Data Localization

- **Primary storage is in India** (Supabase Mumbai region) to comply with India-first data localization principles of the DPDP Act.
- Some sub-processors (Sentry, RevenueCat, PostHog) operate outside India under Standard Contractual Clauses and robust encryption-in-transit + at-rest.
- We will not transfer your data to any country that the Indian government notifies as restricted under DPDP §16.

---

## 8. Your Rights (Data Principal Rights — DPDP §11–14)

You can exercise all of the following from inside the app (**Settings → Privacy & Data**) or by emailing **privacy@rituchakra.app**:

- **Right to access** — get a copy of all personal data we hold about you, in CSV, JSON, or PDF.
- **Right to correction + updation** — fix or update your information.
- **Right to erasure** — delete your account; data is soft-deleted for 30 days then permanently wiped.
- **Right to withdraw consent** — at any time, as easily as it was given; withdrawal does not invalidate prior lawful processing.
- **Right to nominate** — designate another person to exercise your rights on your behalf in the event of death or incapacity.
- **Right to grievance redressal** — contact our Grievance Officer at **grievance@rituchakra.app**. We will respond within 30 days.

If you're dissatisfied with our response, you may file a complaint with India's Data Protection Board once it is operational.

---

## 9. Security

We employ industry-standard safeguards:
- **Encryption in transit** (TLS 1.2+)
- **Encryption at rest** (AES-256 at the database layer via Supabase)
- **Row-Level Security (RLS)** — your data is readable only by your authenticated session, at the database level
- **Least-privilege access** — our engineering team has scoped access via short-lived tokens
- **Breach notification within 72 hours** to affected users and the Data Protection Board, per DPDP §8(6)

No system is perfectly secure. If you suspect unauthorized access to your account, email **security@rituchakra.app** immediately.

---

## 10. Data Retention

| Data type | Retention |
|---|---|
| Account + cycle data | As long as your account is active |
| Soft-deleted data | 30 days, then permanently wiped |
| Anonymous analytics events | 2 years, then aggregated |
| Support correspondence | 3 years |
| Transaction records | 7 years (tax compliance) |

---

## 11. Children

RituChakra is intended for users aged 18 and older. We do not knowingly collect data from minors. If we learn we have inadvertently collected data from someone under 18, we will delete it.

---

## 12. Cookies & Tracking

The RituChakra mobile app does not use cookies (mobile apps don't). Our website (if launched) will use only **essential cookies** for session management. We do not use advertising cookies.

---

## 13. Changes to This Policy

If we make material changes, we will:
- Post the updated policy in-app at least 14 days before it takes effect.
- Notify you via email if the change requires fresh consent.

---

## 14. Contact Us

- **General privacy questions:** privacy@rituchakra.app
- **Grievance Officer (India):** grievance@rituchakra.app
- **Security incidents:** security@rituchakra.app
- **Postal address:** [to be filled in at launch]

---

## 15. Jurisdiction & Governing Law

This Policy is governed by the laws of India. Courts in [City, to be filled in — typically the city of registration, e.g., Bangalore or Mumbai] shall have exclusive jurisdiction over any disputes.

---

*Draft prepared by the RituChakra team on 2026-04-18. Intended for review by an Indian data-protection lawyer before publication. Placeholder fields marked in brackets must be completed before going live.*
