#!/bin/sh
#
# Point the device's localhost at this machine, so a development build can
# reach Metro and the API without a LAN IP
#
#   adb reverse tcp:8081 tcp:8081   # Metro
#   adb reverse tcp:3000 tcp:3000   # the API
#
# With this in place `npx expo start --localhost` is accurate, and the app
# derives its API base URL as http://localhost:3000 (no LAN IP in .env.local)
#
# adb tears these tunnels down when the device disconnects, so re-run this
# after reconnecting. A wireless-debugging session is enough; no cable needed
#
# Usage: adb-reverse.sh
set -eu

METRO_PORT=${METRO_PORT:-8081}
API_PORT=${API_PORT:-3000}

command -v adb >/dev/null 2>&1 || {
  echo "adb-reverse: adb not found; install android-tools (Linux) or platform-tools" >&2
  exit 1
}

if [ "$(adb get-state 2>/dev/null)" != "device" ]; then
  adb devices >&2 || true
  echo "adb-reverse: no device ready; connect over USB or enable wireless debugging" >&2

  exit 1
fi

for port in "$METRO_PORT" "$API_PORT"; do
  adb reverse "tcp:$port" "tcp:$port"
done

echo "adb-reverse: device localhost now reaches this machine"
adb reverse --list

echo
echo "Next: npx expo start --localhost"
