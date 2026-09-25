#!/bin/sh
#
# E2E harness for the nexo frontend: Maestro flows on a physical Android
# device over adb (no emulator)
#
# POSIX sh on purpose: this runs on Debian/Ubuntu and on Alpine (busybox ash),
# so keep it free of bashisms and of GNU-only tools
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
set -eu

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
ROOT=$(cd "$SCRIPT_DIR/../.." && pwd)
FRONTEND="$ROOT/frontend"

# The app under test: the dev build (`eas build --profile development`)
APP_ID=${APP_ID:-com.eletrotupi.orbit}
API_PORT=${API_PORT:-3000}
EXPO_PORT=${EXPO_PORT:-8081}
E2E_EMAIL=${E2E_EMAIL:-e2e@example.com}
E2E_PASSWORD=${E2E_PASSWORD:-e2e-password}

ANIMATION_KEYS="window_animation_scale transition_animation_scale animator_duration_scale"
animation_state=""

die() { echo "e2e: $*" >&2; exit 1; }

# True for a plausible, non-loopback IPv4 address
is_ipv4() {
  case "$1" in
    ""|127.*|0.0.0.0) return 1 ;;
  esac
  printf '%s\n' "$1" | awk -F. '
    NF == 4 { for (i = 1; i <= 4; i++) if ($i !~ /^[0-9]+$/ || $i > 255) exit 1; exit 0 }
    { exit 1 }
  '
}

detect_host_ip() {
  if [ -n "${HOST_IP:-}" ]; then
    echo "$HOST_IP"
    return 0
  fi

  addr=""

  # iproute2 (Debian/Ubuntu): `ip route get` names the interface the default
  # route leaves through
  if command -v ip >/dev/null 2>&1; then
    addr=$(ip route get 1 2>/dev/null | awk '/src/{for (i = 1; i <= NF; i++) if ($i == "src") {print $(i + 1); exit}}')
    if ! is_ipv4 "$addr"; then
      addr=$(ip -4 -o addr show scope global 2>/dev/null | awk '$4 ~ /\./ {sub(/\/.*/, "", $4); print $4; exit}')
    fi
  fi

  # busybox (Alpine): its `ip` has no `route get`, so fall back to ifconfig
  if ! is_ipv4 "$addr" && command -v ifconfig >/dev/null 2>&1; then
    addr=$(ifconfig 2>/dev/null | awk '/inet (addr:)?[0-9]/ {sub(/addr:/, "", $2); print $2; exit}')
  fi

  # GNU `hostname -I` / busybox `hostname -i`
  if ! is_ipv4 "$addr" && command -v hostname >/dev/null 2>&1; then
    for candidate in $(hostname -I 2>/dev/null) $(hostname -i 2>/dev/null); do
      if is_ipv4 "$candidate"; then
        addr=$candidate
        break
      fi
    done
  fi

  is_ipv4 "$addr" || die "could not detect LAN IP; export HOST_IP=<lan-ip>"
  echo "$addr"
}

# `settings put global` writes to the persisted settings provider, so animation
# scales stay turned off across reboots and reinstalls. Remember what was there
# first, and put it back on the way out
remember_animations() {
  animation_state=""
  for key in $ANIMATION_KEYS; do
    value=$(adb shell settings get global "$key" 2>/dev/null | tr -d '[:space:]')
    animation_state="$animation_state $key=$value"
  done
}

restore_animations() {
  for entry in $animation_state; do
    key=${entry%%=*}
    value=${entry#*=}
    case "$value" in
      ""|null) adb shell settings delete global "$key" >/dev/null 2>&1 || true ;;
      *) adb shell settings put global "$key" "$value" >/dev/null 2>&1 || true ;;
    esac
  done
}

adb_wait_device() {
  i=0
  while [ "$i" -lt 15 ]; do
    if [ "$(adb get-state 2>/dev/null)" = "device" ]; then
      return 0
    fi
    sleep 1
    i=$((i + 1))
  done
  return 1
}

adb_prepare() {
  command -v adb >/dev/null 2>&1 || die "adb not found; install android-tools (Linux) or platform-tools"
  echo "e2e: waiting for an Android device (up to 15s)..."

  if ! adb_wait_device; then
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

  # Disable animations for speed and stability, then put them back on exit
  remember_animations
  trap restore_animations EXIT HUP INT TERM
  for key in $ANIMATION_KEYS; do
    adb shell settings put global "$key" 0 >/dev/null
  done
}

run_maestro() {
  command -v maestro >/dev/null 2>&1 || die "maestro not found; install via https://get.maestro.mobile.dev"
  host_ip=$(detect_host_ip)

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
  host_ip=$(detect_host_ip)

  cat <<EOF
Put this in frontend/.env.local (gitignored) before starting Metro:

  EXPO_PUBLIC_API_BASE_URL=http://$host_ip:$API_PORT
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
