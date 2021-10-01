// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs"

// eslint-disable-next-line no-undef
const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN
Sentry.init({
  dsn: SENTRY_DSN,
  // eslint-disable-next-line no-undef
  org: process.env.SENTRY_ORG,
  // eslint-disable-next-line no-undef
  project: process.env.SENTRY_PROJECT,
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 0.2,
  // eslint-disable-next-line no-undef
  token: process.env.SENTRY_AUTH_TOKEN,
  // ...
  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps
})
