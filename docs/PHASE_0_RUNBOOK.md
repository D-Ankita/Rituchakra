# Phase 0 Runbook — Foundation & Setup

**Goal:** get all infrastructure accounts created, SDKs installed, design tokens ported from Figma to code. Nothing user-facing gets built yet — this is the foundation.

**Total weight in tracker:** 10%
**Estimated time:** 4-6 hours of focused work, spread across 2-3 sessions (some steps involve waiting for account verifications)

---

## Before you start — checklist

- [ ] Credit card ready (for Apple $99 and some infra)
- [ ] Laptop with Xcode installed (for iOS) — or plan for Android-only launch
- [ ] GitHub account (if not using an existing one for this repo)
- [ ] ~30 minutes of uninterrupted time per sub-task

---

## Task 0.1 — Supabase project (15 min) · weight 1%

### Steps

1. Go to **https://supabase.com** → Sign up (or sign in) with GitHub.
2. Click **New project**.
3. Fill in:
   - **Organization:** create a new org called **RituChakra** (free tier).
   - **Project name:** `rituchakra-prod` (or `rituchakra-dev` if you want dev/prod separation now — recommended).
   - **Database password:** strong, 20+ chars, save in password manager.
   - **Region:** **South Asia (Mumbai) · ap-south-1** ← critical for DPDP compliance.
   - **Pricing plan:** Free — upgrade later when you hit limits.
4. Wait ~2 min for provisioning.
5. **Copy these into your password manager:**
   - Project URL (format: `https://xxxxx.supabase.co`)
   - `anon` public key (Settings → API → Project API keys → anon)
   - `service_role` key (same page — **never expose this in the mobile app**)
6. In Settings → General, note the Project Reference ID.

### Confirmation

You should be able to open your project dashboard and see the Home page with "0 rows" for tables. That's the signal Phase 0.1 is done.

---

## Task 0.2 — RevenueCat project (20 min) · weight 1%

### Steps

1. Go to **https://app.revenuecat.com** → Sign up with Google or email.
2. Click **+ New project**. Name it `RituChakra`.
3. Add two apps inside the project:
   - **iOS app:** bundle ID `app.rituchakra.ios` (or your preferred format — must match App Store Connect)
   - **Android app:** package name `app.rituchakra.android`
4. In **Products** (left sidebar):
   - Create product **rituchakra_premium_monthly** · price ₹199/mo
   - Create product **rituchakra_premium_annual** · price ₹1,499/yr · with 7-day trial
5. In **Entitlements**: create entitlement `premium` and attach both products to it.
6. In **Offerings**: create the default offering `standard` with both products.
7. **Copy the public API keys** (one per platform — iOS and Android) into your password manager.

### Note: cannot fully complete until 0.3 done
Step 4 requires products to also be created in App Store Connect + Google Play Console with matching IDs. You can save and return.

---

## Task 0.3 — Apple Developer + Google Play Console accounts (varies · wait time included)

### Apple Developer — $99/yr

1. Go to **https://developer.apple.com/programs/** → Enroll.
2. Choose **Individual** (simpler, faster — can upgrade to Organization later).
   - Organization path requires a DUNS number (takes ~2 weeks) and a legal business entity.
3. Complete enrollment with Apple ID, payment ($99).
4. Verification takes 24–48 hours typically.
5. Once approved, go to **App Store Connect** (https://appstoreconnect.apple.com) → My Apps → `+` → Add New App:
   - Platform: iOS
   - Name: RituChakra
   - Bundle ID: `app.rituchakra.ios` (must match RevenueCat)
   - SKU: `rituchakra_ios_01`
6. Navigate to the new app → **Subscriptions** → create group **Premium** → create two subscriptions matching RevenueCat product IDs.

### Google Play Console — ₹2,000 one-time

1. Go to **https://play.google.com/console/signup**.
2. Pay ₹2,000, complete account setup. Near-instant.
3. Create app:
   - App name: RituChakra
   - Default language: English (India)
   - App or game: App
   - Free/Paid: Free (with in-app subscriptions)
4. In the app → **Monetize** → Products → **Subscriptions** → create both subscription products matching RevenueCat.

### Time to complete
- Apple: 2-3 days end-to-end due to verification
- Google: ~1 hour
- This is your longest-waiting item; start it first.

---

## Task 0.4 — Sentry + PostHog (15 min) · weight 0.5%

### Sentry (error tracking)

1. **https://sentry.io** → Sign up free tier.
2. Create Organization: `rituchakra`.
3. Create two projects:
   - `rituchakra-ios` (platform: React Native)
   - `rituchakra-android` (platform: React Native)
4. Copy each project's **DSN** (Settings → Client Keys).
5. Free tier gives you 5k errors/month — fine for launch.

### PostHog (analytics)

1. **https://posthog.com/signup** → EU cloud (for GDPR alignment).
2. Create Project: `rituchakra`.
3. Copy the **Project API key**.
4. In Project Settings → Privacy: enable "Anonymize IPs," disable session recording unless explicitly desired.
5. Free tier gives 1M events/month — ample for launch.

---

## Task 0.5 — Environment variables (10 min) · weight 0.5%

Create `.env.example` in repo root:

```sh
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx

# RevenueCat
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxxxx
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_xxxxx

# Sentry
EXPO_PUBLIC_SENTRY_DSN_IOS=https://xxxxx@sentry.io/xxxxx
EXPO_PUBLIC_SENTRY_DSN_ANDROID=https://xxxxx@sentry.io/xxxxx

# PostHog
EXPO_PUBLIC_POSTHOG_API_KEY=phc_xxxxx
EXPO_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com

# Environment
EXPO_PUBLIC_ENV=development
```

Then:
- Copy to `.env.local` and fill real values.
- Add `.env.local` to `.gitignore` (it likely already is — verify).
- Commit `.env.example` to git.

---

## Task 0.6 — Install SDKs (15 min) · weight 1.5%

From the repo root:

```bash
# Supabase
npx expo install @supabase/supabase-js react-native-url-polyfill

# RevenueCat
npx expo install react-native-purchases

# Sentry
npx expo install @sentry/react-native sentry-expo

# PostHog
npx expo install posthog-react-native

# Secure storage for auth tokens
npx expo install expo-secure-store

# Deep linking (for auth magic links)
npx expo install expo-linking
```

After install, check `package.json` shows these in `dependencies`. Run `npx expo doctor` to verify no conflicts.

---

## Task 0.7 — Port Figma color tokens to React Native theme (30 min) · weight 2%

This is the heart of the phase-reactive theme system.

### What to create/update

**`src/theme/colors.ts`** — replace existing file with:

```typescript
// RituChakra color tokens — synced to Figma Design System variables (2026-04-18)

export const phasePalettes = {
  menstrual: {
    dominant: '#E64064',      // cherry
    dominantSoft: '#FFB5C0',  // rose blush
    dominantDeep: '#7B1A2E',  // deep wine
    text: '#FAF3EB',          // cream on dark
    textMid: '#FAB5C0',
    navBg: '#4D0C1A',
    ringA: '#F54E73',
    ringB: '#FF9FB8',
    ringC: '#D93359',
    ringD: '#8C1F33',
  },
  follicular: {
    dominant: '#6BCD52',      // spring leaf
    dominantSoft: '#D9F08A',  // lime mint
    dominantDeep: '#1F5930',  // forest deep
    text: '#1A3F1F',
    textMid: '#385A33',
    navBg: '#1A3F1F',
    ringA: '#6BCD52',
    ringB: '#D9F08A',
    ringC: '#FFC8DC',
    ringD: '#1F5930',
  },
  ovulation: {
    dominant: '#FA8C2E',      // sun
    dominantSoft: '#FFD96B',  // golden
    dominantDeep: '#A53914',  // deep ember
    text: '#6B260D',
    textMid: '#944316',
    navBg: '#52200D',
    ringA: '#FA8C2E',
    ringB: '#FFC752',
    ringC: '#FFEB8C',
    ringD: '#A53914',
  },
  luteal: {
    dominant: '#A56B38',      // earth clay
    dominantSoft: '#D9A062',  // warm tan
    dominantDeep: '#4D2E18',  // deep soil
    text: '#FAF3E0',
    textMid: '#F2D9B3',
    navBg: '#2D1A0D',
    ringA: '#A56B38',
    ringB: '#E0A861',
    ringC: '#6B4026',
    ringD: '#C7855C',
  },
} as const;

export const coreColors = {
  cream: '#FAF3EB',
  creamWarm: '#F7EDD9',
  white: '#FFFFFF',
  inkPrimary: '#262220',
  inkMid: '#6B615A',
  inkSoft: '#A69F8F',

  // Standalone phase anchors (independent of mode)
  cherry: '#E64064',
  cherrySoft: '#FFB5C0',
  cherryDeep: '#7B1A2E',
  spring: '#6BCD52',
  springSoft: '#D9F08A',
  springDeep: '#1F5930',
  sun: '#FA8C2E',
  sunSoft: '#FFD96B',
  sunDeep: '#A53914',
  earth: '#A56B38',
  earthSoft: '#D9A062',
  earthDeep: '#4D2E18',
} as const;

export type Phase = keyof typeof phasePalettes;
export type PhasePalette = typeof phasePalettes[Phase];
```

### Create `src/theme/ThemeProvider.tsx`

```typescript
import React, { createContext, useContext } from 'react';
import { phasePalettes, coreColors, Phase, PhasePalette } from './colors';

type ThemeContextValue = {
  phase: Phase;
  palette: PhasePalette;
  core: typeof coreColors;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  phase,
  children,
}: {
  phase: Phase;
  children: React.ReactNode;
}) {
  const palette = phasePalettes[phase];
  return (
    <ThemeContext.Provider value={{ phase, palette, core: coreColors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>');
  return ctx;
}
```

Wrap the app in `<ThemeProvider phase={currentPhase}>` — `currentPhase` is derived from the user's cycle data (see Phase 1 task 2.7).

---

## Task 0.8 — Port Figma text styles to typography tokens (15 min) · weight 1%

**`src/theme/typography.ts`**:

```typescript
import { TextStyle } from 'react-native';

export const fonts = {
  serif: {
    light: 'Fraunces_300Light',
    regular: 'Fraunces_400Regular',
    semiBold: 'Fraunces_600SemiBold',
    italic: 'Fraunces_400Regular_Italic',
  },
  sans: {
    light: 'Outfit_300Light',
    regular: 'Outfit_400Regular',
    medium: 'Outfit_500Medium',
    semiBold: 'Outfit_600SemiBold',
    bold: 'Outfit_700Bold',
  },
};

export const textStyles: Record<string, TextStyle> = {
  displayBrand: { fontFamily: fonts.serif.light, fontSize: 72, lineHeight: 78 },
  displayXL: { fontFamily: fonts.serif.light, fontSize: 56, lineHeight: 62 },
  displayL: { fontFamily: fonts.serif.light, fontSize: 44, lineHeight: 50 },
  displayM: { fontFamily: fonts.serif.light, fontSize: 38, lineHeight: 44 },
  displaySansXL: { fontFamily: fonts.sans.light, fontSize: 44, lineHeight: 50 },
  displaySansL: { fontFamily: fonts.sans.light, fontSize: 38, lineHeight: 44 },
  headingXL: { fontFamily: fonts.serif.semiBold, fontSize: 38, lineHeight: 44 },
  headingL: { fontFamily: fonts.serif.semiBold, fontSize: 28, lineHeight: 34 },
  headingM: { fontFamily: fonts.serif.semiBold, fontSize: 22, lineHeight: 28 },
  headingS: { fontFamily: fonts.serif.semiBold, fontSize: 18, lineHeight: 22 },
  bodyL: { fontFamily: fonts.sans.regular, fontSize: 16, lineHeight: 24 },
  bodyM: { fontFamily: fonts.sans.regular, fontSize: 14, lineHeight: 20 },
  bodyS: { fontFamily: fonts.sans.regular, fontSize: 12, lineHeight: 18 },
  accentItalicL: { fontFamily: fonts.serif.italic, fontSize: 22, lineHeight: 28 },
  accentItalicM: { fontFamily: fonts.serif.italic, fontSize: 16, lineHeight: 22 },
  accentItalicS: { fontFamily: fonts.serif.italic, fontSize: 13, lineHeight: 19 },
  labelCapsL: { fontFamily: fonts.sans.medium, fontSize: 12, lineHeight: 16, letterSpacing: 2.16 },
  labelCapsM: { fontFamily: fonts.sans.medium, fontSize: 11, lineHeight: 14, letterSpacing: 2.2 },
  labelCapsS: { fontFamily: fonts.sans.medium, fontSize: 10, lineHeight: 14, letterSpacing: 2.2 },
  labelMeta: { fontFamily: fonts.sans.medium, fontSize: 11, lineHeight: 14, letterSpacing: 0.88 },
  buttonPrimary: { fontFamily: fonts.serif.semiBold, fontSize: 18, lineHeight: 22 },
  buttonSecondary: { fontFamily: fonts.sans.semiBold, fontSize: 14, lineHeight: 18 },
};
```

Also install font packages via Expo:

```bash
npx expo install @expo-google-fonts/fraunces @expo-google-fonts/outfit
```

And in root `app/_layout.tsx`:

```typescript
import { useFonts, Fraunces_300Light, Fraunces_400Regular, Fraunces_600SemiBold, Fraunces_400Regular_Italic } from '@expo-google-fonts/fraunces';
import { Outfit_300Light, Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';

// In the layout component:
const [fontsLoaded] = useFonts({
  Fraunces_300Light, Fraunces_400Regular, Fraunces_600SemiBold, Fraunces_400Regular_Italic,
  Outfit_300Light, Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold,
});
if (!fontsLoaded) return null;
```

---

## Task 0.9 — Spacing + radius tokens (5 min) · weight 0.5%

**`src/theme/spacing.ts`**:

```typescript
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  xxxxl: 64,
} as const;
```

**`src/theme/radius.ts`**:

```typescript
export const radius = {
  sm: 12,
  md: 20,
  lg: 28,
  xl: 40,
  xxl: 48,
  pill: 9999,
} as const;
```

---

## Task 0.10 — ESLint + Prettier + TS strict (20 min) · weight 1%

### Install

```bash
npx expo install eslint prettier eslint-config-expo eslint-plugin-prettier --dev
```

### `.eslintrc.js`

```js
module.exports = {
  extends: ['expo', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
  },
};
```

### `.prettierrc`

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true
}
```

### `tsconfig.json` — ensure:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Package.json scripts

```json
"scripts": {
  "lint": "eslint . --ext .ts,.tsx",
  "lint:fix": "eslint . --ext .ts,.tsx --fix",
  "format": "prettier --write \"**/*.{ts,tsx,md,json}\"",
  "typecheck": "tsc --noEmit"
}
```

Run `npm run typecheck` to see current TS errors. Expected: many in the existing app/ files — we'll fix as we rewrite them in Phase 1-2.

---

## Phase 0 completion checklist

- [ ] 0.1 Supabase project created, keys saved
- [ ] 0.2 RevenueCat project + products created
- [ ] 0.3 Apple + Google Developer accounts approved + apps registered
- [ ] 0.4 Sentry + PostHog projects created, DSN/API keys saved
- [ ] 0.5 `.env.example` + `.env.local` set up
- [ ] 0.6 All SDKs installed
- [ ] 0.7 `src/theme/colors.ts` + `ThemeProvider` ready
- [ ] 0.8 `src/theme/typography.ts` + font loading
- [ ] 0.9 Spacing + radius tokens
- [ ] 0.10 ESLint + Prettier + strict TS

Update tracker in spec §12: **Phase 0 = 10%** complete when all ten boxes checked.

---

## Common pitfalls

- **Apple Developer enrollment stuck in review**: sometimes 4-5 days. Don't panic. Use the time to complete everything else.
- **Play Console rejects app name**: "RituChakra" might conflict. Use the dev name `app.rituchakra.android` for now.
- **Supabase free tier shuts down after 7 days inactivity**: pinging a simple health endpoint daily keeps it warm. Not a problem once you're developing.
- **RevenueCat products "invalid"**: product IDs must match *exactly* between RevenueCat, App Store Connect, and Play Console. Triple-check.
- **Font loading flicker on first launch**: solved by hiding splash until `fontsLoaded === true`.

---

## What comes after Phase 0

Phase 1 — Auth + Data Model. First task: writing Supabase migrations for the schema in spec §9. You'll have Supabase CLI set up, write 6–8 migration files, apply them, verify RLS policies. Then auth screens + magic-link flow. Estimated 1-2 weeks of focused work depending on hours/day.

---

*Runbook drafted 2026-04-18. Version 1.*
