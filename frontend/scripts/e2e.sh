#!/usr/bin/env bash
#
# E2E harness for the nexo frontend: Maestro flows on a physical Android
# device over adb (no emulator)
#
# The app talks to whatever API `EXPO_PUBLIC_API_BASE_URL` points at, so there is
# no second API service to boot here: bring the normal stack up and point Metro
# at it:
#
#   docker compose up -d db valkey api
#   cd api && npm run seed                  # known e2e user (idempotent)
#   cd frontend && npx expo start           # with .env.local set (see print-env)
#
# Usage: e2e.sh [test|print-env]
#   test       prep the device (adb) and run the tagged Maestro flows
#   print-env  print the EXPO_PUBLIC_* vars to set before `expo start`
#
# Optional env: HOST_IP (LAN IP of this machine) is auto-detected when unset
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
FRONTEND="$ROOT/frontend"

# The app under test: the dev build (`eas build --profile development`)
APP_ID="${APP_ID:-com.eletrotupi.orbit}"
EXPO_PORT="${EXPO_PORT:-8081}"
E2E_EMAIL="${E2E_EMAIL:-e2e@example.com}"
E2E_PASSWORD="${E2E_PASSWORD:-e2e-password}"

die() { echo "e2e: $*" >&2; exit 1; }

detect_host_ip() {
  if [[ -n "${HOST_IP:-}" ]]; then
    echo "$HOST_IP"
    return
  fi

  local ip=""
  ip="$(ip route get 1 2>/dev/null | awk '/src/{for (i=1;i<=NF;i++) if ($i=="src") {print $(i+1); exit}}')"

  [[ -z "$ip" ]] && ip="$(hostname -I 2>/dev/null | awk '{print $1}')"
  [[ -z "$ip" ]] && die "could not detect LAN IP; export HOST_IP=<lan-ip>"

  echo "$ip"
}

adb_prepare() {
  command -v adb >/dev/null || die "adb not found; install android-tools"
  echo "e2e: waiting for an Android device (up to 15s)..."

  local i state=""

  for i in $(seq 1 15); do
    state="$(adb get-state 2>/dev/null)"
    [[ "$state" == "device" ]] && break
    sleep 1
  done

  if [[ "$state" != "device" ]]; then
    adb devices >&2 || true
    die "no Android device attached. Connect one over USB/wireless debugging (or set ANDROID_SERIAL when several are connected) and re-run"
  fi

  echo "e2e: adb devices:"

  adb devices

  # No `pm clear` here: each flow starts with Maestro `clearState`, which needs no
  # host-side help, and clearing here only re-triggered the expo-dev-client
  # first-run overlays. Granting the runtime permission is still worth it:
  # clearState resets it and the app asks for notifications right after login
  adb shell pm grant "$APP_ID" android.permission.POST_NOTIFICATIONS >/dev/null 2>&1 || true
  # Disable animations for speed and stability

  adb shell settings put global window_animation_scale 0 >/dev/null
  adb shell settings put global transition_animation_scale 0 >/dev/null
  adb shell settings put global animator_duration_scale 0 >/dev/null
}

run_maestro() {
  command -v maestro >/dev/null || die "maestro not found; install via https://get.maestro.mobile.dev"
  local host_ip
  host_ip="$(detect_host_ip)"

  (
    cd "$FRONTEND"
    maestro test e2e \
      --include-tags=smoke \
      --env HOST_IP="$host_ip" \
      --env PORT="$EXPO_PORT" \
      --env E2E_EMAIL="$E2E_EMAIL" \
      --env E2E_PASSWORD="$E2E_PASSWORD"
  )
}

print_env() {
  local host_ip
  host_ip="$(detect_host_ip)"

  cat <<EOF
Put this in frontend/.env.local (gitignored) before starting Metro:

  EXPO_PUBLIC_API_BASE_URL=http://$host_ip:3000
  EXPO_PUBLIC_TOKEN_KEY=orbit-jwt

  npx expo start --port $EXPO_PORT
EOF
}

case "${1:-}" in
  test)
    adb_prepare
    run_maestro
    ;;
  print-env)
    print_env
    ;;
  *)
    echo "usage: $0 [test|print-env]" >&2
    exit 1
    ;;
esac
