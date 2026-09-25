# Mobile E2E (Maestro on a physical Android device)

Smoke coverage for the core journey: **login → register a mood → logout**. Runs
on a real Android device over `adb` (no emulator), against a dev build of the
app talking to the normal local API

## What you need

1. **API up, with the seeded user.**: the app points at whichever API
   `EXPO_PUBLIC_API_BASE_URL` names

   ```sh
   docker compose up -d db valkey api
   cd api && npm run seed        # idempotent; creates e2e@example.com / e2e-password
   ```

2. **Metro serving the dev build**, with the device-reachable API URL baked in
   (`EXPO_PUBLIC_*` is inlined at bundle time, so Metro must be started *after*
   `frontend/.env.local` is set: see `npm run test:e2e:env`)

3. **The dev build installed** (`com.eletrotupi.orbit`) and the device visible in
   `adb devices`

4. **Maestro** on `PATH` (`https://get.maestro.mobile.dev`)

## Running

```sh
cd frontend
npm run test:e2e          # adb prep + the tagged smoke flows
npm run test:e2e:env      # print the EXPO_PUBLIC_* values Metro needs
```

A single flow, while iterating (a few minutes faster than the whole suite):

```sh
cd frontend
maestro test e2e/mood.yaml \
  --env HOST_IP=$(ip route get 1 | awk '/src/{for(i=1;i<=NF;i++) if($i=="src"){print $(i+1);exit}}') \
  --env PORT=8081 --env E2E_EMAIL=e2e@example.com --env E2E_PASSWORD=e2e-password
```

Three flows take roughly 8 minutes: every flow clears app state, so each one
pays for a cold bundle load and the dev-client startup dance

## How the flows are structured

Every flow is **self-contained and order-independent**: Maestro runs them in an
arbitrary order, so none may assume another ran first. Each starts with:

```yaml
- runFlow:
    file: helpers/_login.yaml
```

and `helpers/_login.yaml` does the whole reset-and-authenticate: `clearState`
=> deep-link the dev build => log in => dismiss the notification prompt. That
means `clearState` is what guarantees a logged-out start, which has three
consequences worth knowing:

- it resets **runtime permissions**, so the notification dialog shows up again
  and must be allowed (see copy matches below);
- it resets **expo-dev-client**, so its first-run overlays appear ("Continue",
  then the dev-menu panel's "Close");
- it discards the downloaded JS bundle, hence the cold start

The app is intentionally **not** launched with `exp://`: Expo Go owns that
scheme, and driving Expo Go while asserting on `com.eletrotupi.orbit` will fail
with "element not found" everywhere. The dev build owns
`orbit://expo-development-client/?url=...`, kinda hacky but I don't care

## testID convention

`id`s are English even though the UI is pt-BR. Flows only touch screens that
pass an explicit `testID`

Auto-derived fallbacks exist when a screen passes nothing: `Button` →
`button-<slug(title)>`, `Input`/`TextArea` → `input-<slug(label)>`,
`MoodSelector` → `mood-<id>`. The slug util lives in `Button.tsx` / `Input.tsx`
(NFD strip, lowercase, kebab-style)

Every flow file: **including subflows** — must declare `appId:
com.eletrotupi.orbit` in its config section. Maestro 2.x requires it per file;
the workspace `.maestro/config.yaml` cannot supply it

## The unavoidable copy matches

A handful of strings cannot be reached by `testID` because they belong to the
OS or to dev tooling. These are deliberate, and the only ones a flow may assert
on:

| Where | Selector | Why |
| --- | --- | --- |
| Logout confirm `Alert` | `^Sair$` with `index: 1` | RN native dialog, no ids, will be fixed eventually |
| History card annotation | `"e2e smoke register"` | the one *data* assertion; proves write-through |
| Notification permission | `com.android.permissioncontroller:id/permission_allow_button` | AOSP system dialog |
| expo-dev-client onboarding | `^Continue$` | dev tooling, not app UI |
| expo-dev-client dev menu | `^Close$` (content-desc) | dev tooling, not app UI |

Everything else is greeted via `testID`

## Known gotchas

- **The formSheet opens at its half detent.** `entry/mood-components` uses
  `sheetInitialDetentIndex: 1` of `[0.25, 0.5, 1]`, so only the first rows of
  the component list are mounted
- The soft keyboard covers `button-login`; the flow calls `hideKeyboard` first
