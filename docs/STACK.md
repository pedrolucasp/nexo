# nexo / orbit — Stack Overview

> **nexo** (repo `/orbit`, app slug `orbit`) is an academic (TCC/monografia) mood- and
> bipolar-disorder (TAB) tracker. Users log moods, sleep, triggers, medicine regimens and
> "care actions"; the backend produces auto-generated insights, sends push/email reminders
> and generates clinician-ready PDF reports.
>
> The repository is the **online/academic** version. It is a client–server app; the
> "final, offline" app is planned for a separate repo.

> **Visual:** open `docs/architecture.excalidraw` (excalidraw.com / tldraw import) for a
> component-and-flow diagram of the whole stack.

---

## Repository layout

```
nexo/
├── api/            # Backend — Node.js + Express REST API (all business logic)
├── frontend/       # Mobile app — React Native (Expo) source code
├── monografia/     # LaTeX thesis (auto-compiled to PDF by CI)
├── ansible/        # One-shot VPS provisioning (bootstrap, docker, deploy user)
├── .github/workflows/  # CI/CD: test → build → deploy; thesis PDF publishing
├── docker-compose.yml  # Local/dev infra: Postgres + Valkey + API
├── etc/valkey.conf     # Valkey configuration mounted by compose
└── docs/              # misc (this file, class notes)
```

---

## docker-compose.yml — local/dev infrastructure

| Service | Image | Port | Purpose |
|---|---|---|---|
| `db` | `postgres:17-alpine` | host `5430` → `5432` | Relational database, health-gated |
| `valkey` | `valkey/valkey:9.0-alpine` | `6379` | Redis-compatible server: BullMQ job broker + repeatable schedules |
| `api` | `./api` (dev Dockerfile) | `3000` | Backend with `nodemon` hot reload; bind-mounts `./api` and `api/.env.development` |

Notes:
- `api` only starts after `db` and `valkey` report healthy.
- The mobile app (`frontend`) is **not** part of compose — it's an Expo app run/devved
  separately and reaches the API over `EXPO_PUBLIC_API_BASE_URL`.

---

## API — `api/`

**Stack:** Node.js 24 · TypeScript 6 · Express 5 · Prisma 7 · PostgreSQL 17 · BullMQ +
Valkey · zod · pino · Resend · AWS S3 SDK · @react-pdf/renderer · Vitest.

### Architecture (layered)
```
routes/      → thin HTTP wiring (path → controller fn)
controllers/ → parse/validate request, call services, shape responses
services/    → business logic & persistence
schemas/     → zod input validation (auth, mood, trigger, medicine, etc.)
middleware/  → requireAuth (JWT), errorHandler
lib/         → prisma client, jwt, mail, s3, queue registries, push
reports/     → React-PDF report generation (JSX document + router)
```

- **Context of data:** every resource is scoped to `req.userId` set by `requireAuth`
  (Bearer JWT). Passwords hashed with `bcryptjs`.
- **Errors:** domain error classes map to HTTP statuses; middleware also handles Prisma
  errors (`P2025` → 404, `P2002` → 409); fallback 500. Validation errors returned with a
  `fields` map.
- **Validation:** zod schemas + `zod-validation-error`; report endpoint enforces
  date-range ≤ 90 days.
- **Logging:** `pino` + `pino-http` structured logs (pretty in dev via `pino-pretty`).

### Data model (Prisma, PostgreSQL)
- `users` — profile, encrypted password, activation code, push token, notification prefs,
  daily reminder time, avatar (S3 key/URL).
- `moods` + `mood_components` — mood rating (enum `SAD/NEUTRAL/GOOD/GREAT/ANGRY`) with
  anxiety/stress/energy levels + optional emotion components w/ intensity.
- `triggers` + `trigger_mood_links` — trigger events (category enum) optionally linked to
  moods with a perceived impact.
- `medicine_regimens` + `medicine_logs` — medication schedule (times of day, cadence enum)
  and "taken" logs.
- `care_actions` (+ `appointments`, `activities`, `medicine_logs`) — self-care events with
  type enum (MEDICINE/APPOINTMENT/ACTIVITY).
- `sleep_records` — daily hours of sleep + annotations.
- `insights` — generated analysis rows (type/period enums, human-readable body + JSON metadata).

### Background jobs (BullMQ on Valkey) — 4 queues
- **`mail`** (concurrency 10) — welcome, activation, password-reset emails via **Resend**.
- **`insights`** (concurrency 5) — weekly fan-out every **Monday 03:00** cron:
  `MOOD_TREND`, `ENERGY_SLEEP_CORRELATION`, `TRIGGER_PATTERN` (+ `DAILY_ENERGY`,
  `DAILY_SLEEP`) are computed per active user and upserted into `insights`.
- **`medicine-reminders`** (5) — per-regimen recurring cron jobs (created/removed by
  `syncMedicineReminderJobs`); sends Expo push "time to take medicine".
- **`daily-reminders`** (5) — per-user daily check-in push at `dailyReminderTime`
  (managed by `syncDailyReminderJob`).

Default job policy: 3 attempts, exponential backoff, cleanup of completed/failed jobs.

### Notifications & email
- **Push:** Expo Push API (`exp.host/--/api/v2/push/send`) using stored device push tokens.
- **Email:** Resend (activation code, welcome, password reset).

### Files & object storage
- **Avatars:** `multer` + `multer-s3` upload to an S3-compatible store (configurable
  endpoint/region → MinIO/R2 style); delete via `DeleteObjectCommand`.
- **PDF reports:** `@react-pdf/renderer` renders a React document from period data;
  endpoint `POST /reports` returns an `application/pdf` attachment.

### Root static site
The API also serves `src/static/` (a Tailwind/CDN marketing landing page + link to the
published thesis PDF). This is the "web/academic" face of the project.

### Tests & CI
- **Vitest + supertest** against a disposable Postgres (`DATABASE_URL` pointed at an
  `orbit_test` DB; `TRUNCATE users CASCADE` between tests). Files: auth, users, moods,
  triggers, sleep, medicines, care-actions, jobs (mail, mood-trend, push).
- CI (GitHub Actions) runs the suite on a Postgres 17 service container.

### Docker / deploy
- Dev `Dockerfile`: node:24-alpine, installs `postgresql-client`/`valkey-cli`, runs `dev`
  (`prisma generate && migrate deploy && nodemon`).
- `Dockerfile.production`: multi-stage build → runtime stage runs
  `npx prisma migrate deploy && node dist/index.js` (migrations auto-apply on boot).
- CI workflow (`deploy.yml`) on `master`: test → build & push image to **GHCR** (latest +
  short SHA tag) → SSH into the VPS → `docker compose pull && up -d --force-recreate api`.
- `ansible/provision.yml` bootstraps the VPS: packages, Docker Engine, deploy user + SSH
  key, `/srv/app/production`. `thesis.yml` compiles `monografia.tex` → PDF → SCP to
  `/srv/static/`.

---

## Frontend — `frontend/`

**Stack:** Expo SDK 57 · React Native 0.86 · React 19 · TypeScript 6.0 · expo-router
(file-based, typed routes) · TanStack Query v5 · Zustand · MMKV · expo-secure-store ·
expo-notifications · Reanimated/gesture-handler.

### Startup / routing
- `app/_layout.tsx` sets up `QueryClientProvider` → navigation `ThemeProvider` →
  `ToastProvider` → `AuthProvider` → Stack navigator, plus a notification observer.
- `app/index.tsx` redirects: loading spinner → `/auth/login`; logged-in →
  `(tabs)/new`, or `/auth/activate` if the account isn't active.
- `(tabs)/` — 5 tabs: **Histórico** (history), **Jornada** (insights), **Novo** (new
  entry flow), **Ações** (care actions), **Ajustes** (settings).
- Auth screens (`auth/`): login, signup, activate, forgot/reset password.
- Detail/flow screens: entry, sleep CRUD, triggers CRUD, medicine regimens, care actions
  (medicine / appointment / activity), notifications, report, profile.

### Data layer — TanStack Query + offline cache
- `lib/queryClient.ts`: persisted client backed by **MMKV** (`react-native-mmkv`) via
  `createSyncStoragePersister` (throttled 1s, cache survives 24h). 5-min staleTime,
  10-min GC, `retry: 1`, no refetch-on-window-focus.
- Per-domain hooks in `hooks/*.queries.ts` use typed query keys, `useInfiniteQuery`
  pagination, and **optimistic updates** (create/delete mood entries roll back on error and
  invalidate insight queries after a short delay).
- `hooks/useHistoryFeed.ts` merges mood/sleep/trigger/care-action entries into one feed.

### API client
- `lib/api/client.ts` — single `ApiClient` (fetch) for all endpoints: auth, users, moods,
  sleep, triggers, insights, medicine regimens, care actions, trigger↔mood linking, and PDF
  report (`ArrayBuffer`). JWT stored in **expo-secure-store**; a 401 handler force-logs-out.
- `lib/api/types.ts` holds shared payload/response types mirroring the backend.

### State & context
- **Zustand** `stores/moodEntry.ts` — locally composes a mood entry (mood + components +
  intensities) before submit; `stores/careActionLink.ts` for linking.
- **AuthContext** — session state, bootstrap `verifyToken`+`getMe` (with 10s timeout),
  login/signup/activate/logout; logout clears Query cache + MMKV.
- **ToastContext** — app-wide notifications/toasts.

### Notifications (push)
- `useRegisterPushToken.ts` — checks device/permission, sets Android channel, obtains the
  Expo push token (via EAS projectId) and registers it with the backend.
- `useNotificationObserver.ts` — handles cold-launch and foreground pushes, deep-linking to
  the route named in `data.screen` via `router.replace/push`.

### UI
- Custom kit under `components/ui/` (Button, Input, Cards, sections, sliders, datetime/
  time pickers, chips, empty states, toast, haptic tab). Inter font bundled via expo-font;
  theme tokens in `constants/theme.ts`; `misc/` has haptics, parallax, themed views.
- Shared UI constants reflect the backend enums: `moods.ts`, `mood-components.ts`,
  `trigger-categories.ts`, `care-action-categories.ts`.

### Builds & updates
- `eas.json` — development (dev client), preview (internal), production (auto-increment).
  `app.json` — package `com.eletrotupi.orbit`, `google-services.json` for push/FCM,
  `newArchEnabled: true`, expo-updates configured (OTA over `u.expo.dev`), typed routes +
  React Compiler experiments.

### E2E (Maestro on a physical Android device — no emulator)
- **Tooling:** Maestro drives whatever `adb devices` sees (a real phone via USB/wireless
  debugging). Host needs **Java 17+** and **adb** only — no GUI, no Android Studio.
  - Arch: `sudo pacman -S android-tools jre-openjdk-headless`
  - Alpine: `sudo apk add android-tools openjdk17`
  - then `curl -fsSL https://get.maestro.mobile.dev | bash` and add `~/.maestro/bin` to PATH.
- **Flows:** `frontend/e2e/*.yaml` (login, mood, logout — tagged `smoke`, share
  `helpers/_login.yaml`); config `frontend/.maestro/config.yaml` (appId + env defaults).
  UI `Button`/`Input`/`TextArea` and `MoodSelector` derive stable `testID`s from their
  label/title (`button-entrar`, `input-email`, `mood-great`, ...), so flows mostly use ids.
- **Backend under test:** `docker-compose.e2e.yml` adds an `api-e2e` service on host port
  **3001**, pointed at an isolated `orbit_e2e` database. On boot it runs `prisma migrate
  deploy`, then `api/scripts/seed-e2e.mjs` (TRUNCATEs `users` and inserts a known active
  user `e2e@example.com` / `e2e-password`), then the API. Activation-by-email is deliberately
  skipped — the seeded user is already `active`.
- **Run** (from `frontend/`):
  - `npm run test:e2e:all` → boots the stack, seeds, preps the device, runs the flows.
  - `npm run test:e2e:up` / `test:e2e:down` / `test:e2e` — the individual steps
    (`frontend/scripts/e2e.sh up|down|test|all`).
  - `npm run test:e2e -- print-env`-style: `bash scripts/e2e.sh print-env` prints the
    `EXPO_PUBLIC_*` vars to export before `expo start`.
- **Device connectivity:** the phone must reach this machine on the LAN:
  - API → `EXPO_PUBLIC_API_BASE_URL=http://<lan-ip>:3001` (bundler-time env);
  - Metro → flows deep-link the app via `exp://<lan-ip>:8081` (Expo Go / dev client).
  `HOST_IP` is auto-detected by the script and can be overridden via env.
- **Expo Go runtime (SDK 57):** the Play-Store Expo Go only ships SDK 54, so on a store
  installation the app won't load after the upgrade. Install an SDK 57 Expo Go APK from
  `expo start`/`eas go` on the test device (or match the runtime), otherwise Maestro flows
  will fail at launch.
- **Notes:** each run does `adb shell pm clear` on the app (fresh SecureStore/MMKV),
  pre-grants `POST_NOTIFICATIONS` and disables animations for deterministic runs. For a
  dev-client build the appId is `com.eletrotupi.orbit` — change it in `.maestro/config.yaml`
  and `APP_ID` when running the script.

---

## How it works end-to-end

1. **Onboarding** — user signs up with name/email/password → backend creates the account,
   stores a bcrypt hash, enqueues a welcome email + a 6-digit **activation code** (valid
   5 min) → user activates via `/auth/activate` → session issued.
2. **Session** — every request carries a 7-day JWT; on app boot the stored token is
   verified (`/auth/verify`) and refreshed user data fetched (`/users/me`).
3. **Daily use** — user records moods (with components and intensities), sleep, triggers,
   medicine intakes and care actions. The app writes I/O through TanStack Query mutations
   with optimistic UI; everything is cached in MMKV so history renders offline and
   revalidates later. Entries can link triggers to moods to model cause/effect.
4. **Scheduled work** — BullMQ cron jobs on Valkey:
   - daily/medicine push reminders per user preference;
   - weekly insight fan-out (Monday 03:00) computing mood trends, energy–sleep
     correlation, trigger patterns; daily energy/sleep summaries.
   Insights land in the `insights` table and surface in the **Jornada** tab.
5. **Reporting** — the user picks a period (≤ 90 days) and gets a **PDF** generated by the
   API (`@react-pdf/renderer`) summarizing mood, sleep, triggers and medicines — meant to
   be shared with the doctor/therapist.
6. **Deploy** — push to `master` → CI tests → GHCR image → SSH deploy → container boots and
   applies Prisma migrations before listening on :3000.

---

## Core architecture decisions & patterns

### Backend layering — Controller / Service (light repositories)
- Routes are thin. **Controllers** parse + validate (`zod`) and shape HTTP responses;
  **Services** hold business logic and persist directly through the Prisma client
  (`lib/prisma.ts`). There is **no explicit Repository/DAO layer** — the Prisma client is
  the single data-access gateway, made pluggable via driver adapters (`PrismaPg` for
  Postgres, `better-sqlite3` adapter already in deps for the future offline build).
- This is a **Service/Command-style** design: operations are plain async functions that
  take inputs and return domain results; there's no command bus or unit-of-work wrapper.
  Multi-step flows (e.g. signup → create user + store activation code + enqueue welcome
  email) are composed at the controller/service boundary.
- **Domain errors** (`lib/errors/base.ts`) are raised inside services and mapped to HTTP
  by the single `errorHandler` middleware (incl. Prisma `P2025`→404 / `P2002`→409), so
  services never leak framework concerns.

### Background processing — Queue/Worker (producer–consumer) with fan-out
- API code only **enqueues** jobs; dedicated BullMQ **Workers** consume each queue with
  per-queue concurrency (`QueueRegistry`/`WorkerRegistry`). Queues are independent, so long
  tasks run **truly in parallel** and can be scaled horizontally without sticky state.
- **Insights** use a **fan-out** pattern: one repeatable cron job (Monday 03:00) enqueues
  a per-user compute job for each active user. Results are written **idempotently** via a
  composite unique key (`@@unique([userId, type, periodStart])`) + `prisma.insight.upsert`,
  so re-runs never duplicate rows.
- Recurring per-user schedules (daily check-in, medicine times) are modeled as BullMQ
  **repeatable jobs** keyed by `jobId`; dedicated "sync" services reconcile them on any
  change (delete stale jobs, re-add current ones), so schedule state can't drift.

### Auth — stateless JWT
- No server-side session store: a 7-day signed JWT (userId/email) is validated by the
  `requireAuth` middleware. Passwords are bcrypt-hashed; activation and password reset use
  short-lived single-use codes. The API stays horizontally scalable (no sticky sessions).

### Database — schema-lived Prisma, migrations as code
- `prisma/schema.prisma` is the single source of truth; migrations are committed to the
  repo and applied via `prisma migrate deploy` on container boot / CI, making each deploy
  self-migrating and idempotent.

### Client — offline-first data access
- All server state is owned by **TanStack Query hooks** with typed query keys, persisted to
  **MMKV** (24h) and **optimistically mutated** with rollback + controlled invalidation.
  The server cache is treated as local source-ish during a session, not re-fetched on every
  focus. JWT lives in **expo-secure-store**; a global 401 handler signs the session out.

### Typing discipline
- Prisma generates the API's domain types; frontend DTO types in `lib/api/types.ts` mirror
  them and shared enums are duplicated in `constants/*` with `XXX: keep in sync` notes
  (no OpenAPI/codegen — a conscious trade-off for this size).

---

## One-paragraph summary

`nexo/orbit` is a TypeScript monorepo-style academic project: an **Express 5 + Prisma 7**
REST API over **PostgreSQL 17** with **BullMQ/Valkey** for cron-driven background work
(insights, push and email reminders via Expo Push and Resend), S3-compatible object storage
for avatars, and React-PDF for clinician reports; and an **Expo (React Native 0.81)**
client using **expo-router** file routing, **TanStack Query persisted to MMKV** for
offline-first UX, secure JWT storage, and push-notification deep linking. Everything is
containerized for local dev via docker-compose and shipped to a VPS through GitHub Actions
+ GHCR + Ansible provisioning.