#!/usr/bin/env bash
# Prerequisites (Cal.com web UI):
#   1. Settings → App Store → install "Google Meet" and connect it.
#   2. Settings → Calendars → connect Google Calendar (Meet links attach to calendar events).
#
# Then run (from repo root):
#   export CALCOM_API_KEY="cal_live_..."
#   npm run cal:meet
#
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -z "${CALCOM_API_KEY:-}" ]]; then
  echo "Set CALCOM_API_KEY (Cal.com → Settings → Developer → API keys)." >&2
  exit 1
fi

CLI=(npx --yes calcom-cli --api-key "$CALCOM_API_KEY")

echo "== Conferencing apps connected to your account =="
"${CLI[@]}" conferencing list --pretty

echo ""
echo "== Setting default conferencing to Google Meet (new bookings use Meet when the event type follows this default) =="
"${CLI[@]}" conferencing set-default --app-slug google-meet --pretty

echo ""
echo "== Your event types (note the numeric id for your meeting, e.g. 30 min) =="
"${CLI[@]}" event-types list --pretty

echo ""
echo "Next: pin Google Meet on the \"30 min\" (or any) event type:"
echo "  export EVENT_TYPE_ID=<id-from-list-above>"
echo "  npm run cal:meet-event"
