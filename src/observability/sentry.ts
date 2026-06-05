import Constants from 'expo-constants';

/**
 * Sentry wrapper that no-ops without a DSN. Set
 * `expo.extra.sentryDsn` in app.json (or as an env override via
 * eas.json) to enable.
 *
 * Lazy-loads @sentry/react-native — keeps the SDK out of bundles
 * where crash reporting is opted out.
 */

let initialized = false;

export function initSentry(): void {
  if (initialized) return;
  const dsn = (Constants.expoConfig?.extra ?? {})['sentryDsn'] as string | undefined;
  if (!dsn) return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Sentry = require('@sentry/react-native');
    Sentry.init({
      dsn,
      tracesSampleRate: 0.2,
      // Privacy: never auto-collect breadcrumbs that could include
      // cycle data. Logs are explicit-only via captureMessage below.
      enableAutoSessionTracking: true,
      attachStacktrace: true,
      beforeBreadcrumb: (b: any) => {
        // Drop any breadcrumb whose category is "console" — we
        // don't want stray cycle data in crash reports.
        if (b?.category === 'console') return null;
        return b;
      },
    });
    initialized = true;
  } catch {
    /* Sentry not bundled — fine. */
  }
}

export function captureException(err: unknown, context?: Record<string, string>): void {
  if (!initialized) return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Sentry = require('@sentry/react-native');
    Sentry.captureException(err, { tags: context });
  } catch {
    /* ignore */
  }
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
  if (!initialized) return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Sentry = require('@sentry/react-native');
    Sentry.captureMessage(message, level);
  } catch {
    /* ignore */
  }
}

export function isSentryEnabled(): boolean {
  return initialized;
}
