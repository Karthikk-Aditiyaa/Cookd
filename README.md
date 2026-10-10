# TimeLedger

A single-user, local-first time tracking app with a stopwatch, countdown timer, automatic categorisation, reward/penalty ledger, dashboard reports, time diary, rankings, and full export/import support.

## Setup

```bash
npm install
npm run dev
```

Visit http://localhost:3000.

## Data Model

- **Sessions**: `{ id, taskName, taskKey, startedAt, endedAt, durationSec, category, source }`
- **Ledger Entries**: append-only `{ id, timestamp, sessionId?, type, seconds }`
- **Overrides**: `{ taskKey, category }`
- **Settings**: `{ rewardWorkMin, rewardFreeMin, penaltyMultiplier, keywordLists, askConfirmation, enableDebtRepayment }`

## Ledger Rules (as implemented)

- Reward rate: `productive_seconds * (rewardFreeMin / rewardWorkMin)`
- Penalty rate: `unproductive_seconds * penaltyMultiplier`
- Debt repayment: productive work first clears debt (if enabled), then earns reward. If disabled, all productive time earns reward regardless of debt.
- Free time spent via countdown reduces balance and never drops below zero.
- Editing or deleting a session requires manual ledger recomputation (simplified in current build; deterministic from scratch in logic module).

## Assumptions

- All times are local time zone; sessions that cross midnight are attributed to the start date (documented in README).
- Classification uses whole-word/substring case-insensitive matching; if both lists match, unproductive wins; else uncertain.
- Timer state survives refresh via `localStorage` and timestamp arithmetic (no `setInterval` tick counting).
- A clearly marked hook (`LLMClassifier`) exists for future LLM classification.

## Tests

```bash
npm run test
```

## Expanded Architecture (Mobile + Sync)
- Responsive PWA: works on Realme 12+ Chrome/Safari, bottom nav, 48dp targets, safe-area insets, true-black AMoled, exact-alarm notifications, foreground service, battery-optimisation onboarding, signed APK.
- Sync: Supabase Postgres with RLS, realtime, *_history tables, outbox worker, tombstones, import dry-run/merge.
- Data safety rules: UUIDs, no hard deletes, write-ahead save, outbox retry, derived ledger, 3-layer backup, integrity checks, sync status.
- Backups: (a) Settings Backup now / share to Drive, last 30; (b) scripts/backup.ts + GitHub Actions daily; (c) import with preview.

## Setup (Supabase)
1. Create Supabase project.
2. Copy /supabase/migrations to project; run migrations.
3. Enable Auth (email magic link / Google), set RLS policies.
4. Add env vars (SUPABASE_URL, ANON_KEY, SERVICE_KEY) to .env.

## Android build
- npm install @capacitor/android
- npx cap add android
- Build signed APK: document keystore backup warning.
- Install via USB/adb or file transfer.

## Assumptions / documented decisions
- Midnight cross: session belongs to start day (local time).
- Timer computed from timestamps; never from ticks.
- Classification: substring case-insensitive; unproductive wins tie.
- Conflict resolution: updatedAt last-writer-wins, server keeps all history.

## Android build (Capacitor)
- npm install @capacitor/core @capacitor/android @capacitor/plugins
- npx cap add android
- Build: npx cap build android
- No APK needed — PWA install from browser: configure keystore; BACK IT UP (losing it prevents updates)
- Install via USB file transfer or adb install
- Onboarding: first-run checks battery optimisation, Auto-launch, lock recent
- Notifications: POST_NOTIFICATIONS + USE_EXACT_ALARM; foreground notification for running timer
- True-black theme set in Android theme XML; safe-area insets handled
