#!/usr/bin/env bash
# PATCH one event type so its location is Google Meet (a Meet link is created per booking).
# Requires: CALCOM_API_KEY, EVENT_TYPE_ID (from: npm run cal:meet after listing, or Cal.com URL).
#
set -euo pipefail

if [[ -z "${CALCOM_API_KEY:-}" || -z "${EVENT_TYPE_ID:-}" ]]; then
  echo "Usage:" >&2
  echo "  export CALCOM_API_KEY=cal_live_..." >&2
  echo "  export EVENT_TYPE_ID=12345" >&2
  echo "  npm run cal:meet-event" >&2
  exit 1
fi

BODY='{"locations":[{"type":"integration","integration":"google-meet"}]}'

if ! curl -sS -f -X PATCH "https://api.cal.com/v2/event-types/${EVENT_TYPE_ID}" \
  -H "Authorization: Bearer ${CALCOM_API_KEY}" \
  -H "cal-api-version: 2024-06-14" \
  -H "Content-Type: application/json" \
  -d "$BODY"; then
  echo "" >&2
  echo "Request failed. Ensure Google Meet is installed (App Store) and the event type id is correct." >&2
  exit 1
fi
echo ""
