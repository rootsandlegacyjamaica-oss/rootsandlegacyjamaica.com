Portlandia production-ready static website

Files included:
- index.html
- heritage.html
- land-legacy.html
- experiences.html
- about.html
- booking.html (Cal.com embed)
- contact.html
- styles.css
- script.js
- booking-config.js / booking.js
- contact-form.js
- package.json (Netlify Functions + Resend)
- netlify/functions/cal-booking-notification.mjs
- netlify/functions/contact-notification.mjs
- scripts/cal-setup-google-meet.sh, scripts/cal-patch-event-google-meet.sh (Google Meet via Cal.com CLI + API)
- assets/

Publishing:
1. Upload the folder contents to Netlify (recommended for functions + Resend).
2. Contact submissions use the Netlify function contact-notification (Resend), not Netlify Forms.
3. Point your domain to the deployed site.

Recommended:
- Replace any image later by swapping the file in /assets while keeping the same filename.
Added: pricing.html and Pricing nav link.


Contact form (Resend) + Analytics
---------------------------------
- Submissions POST to /.netlify/functions/contact-notification, which emails rootsandlegacyjamaica@gmail.com (override with CONTACT_NOTIFY_EMAIL) via Resend. Reply-To is the visitor’s email so you can reply in one click.
- A short confirmation is also sent to the visitor (disable with CONTACT_SEND_CONFIRMATION=false). Uses the same RESEND_API_KEY and RESEND_FROM as booking emails.
- Thank-you page: thank-you.html — also routed as /thank-you via netlify.toml.
- Google Analytics 4 (gtag.js) is included on every page (Measurement ID G-S02Q9D3HHQ).

Cal.com booking + Google Calendar
---------------------------------
1. Create or sign in at https://cal.com — use the same team/username you want on public links.
2. Connect Google Calendar: Cal.com dashboard → App Store (or Settings) → Google Calendar → Connect. Pick the calendar where new bookings should appear (usually your primary calendar).
3. Create an Event type (e.g. “Consultation”) with duration, availability, and buffers as you like. Save.
4. Open that event type → Share (or ⋮) → copy the public link (looks like https://cal.com/yourname/consultation).
5. In this project, open booking-config.js and set CAL_BOOKING_URL to that full URL (no need to add ?embed=true; booking.js appends it). Save and redeploy.
6. booking.html embeds Cal in an iframe. Styling: booking.js adds theme + brand color query params (CAL_EMBED_THEME, CAL_EMBED_BRAND_COLOR). For deeper control, use Cal.com → event type → ⋮ → Embed → “Embed Snippet Generator” (theme, layout, brand color, CSS variables). Replacing the whole UI with your own HTML would require the Cal.com API (availability + booking endpoints)—much more work than the embed.

Google Meet for every booking (Cal.com + CLI)
----------------------------------------------
Meet links are created by Cal.com when the event type uses Google Meet (not something the website code generates).

1. In Cal.com: App Store → install **Google Meet**. Connect **Google Calendar** (required for Meet on bookings).
2. From this repo (install deps once: `npm install`), set your API key and run:
     export CALCOM_API_KEY="cal_live_…"    # Settings → Developer → API keys
     npm run cal:meet
   That lists conferencing apps, sets **Google Meet** as your default conferencing app, and lists event types with ids.
3. Pin Meet on your “30 min” (or any) event type:
     export EVENT_TYPE_ID="<id from the list>"
     npm run cal:meet-event
   (Or in the UI: Event type → Location → Google Meet.)
4. New bookings then get a Meet URL in the calendar event and in Cal.com emails / webhooks.

If CAL_BOOKING_URL is empty, booking.html shows setup instructions instead of the calendar.

Booking emails (Resend + Cal.com webhook)
------------------------------------------
After deploy, your function URL is:
  https://YOUR_SITE/.netlify/functions/cal-booking-notification
(use your real domain, e.g. https://rootsandlegacyjamaica.com/.netlify/functions/cal-booking-notification)

In Netlify: Site settings → Environment variables — add:
  RESEND_API_KEY          = (from https://resend.com/api-keys — never commit to git)
  RESEND_FROM             = (optional) defaults in code to:
                            "Roots&LegacyJamaica" <bookings@my.rootsandlegacyjamaica.com>
                            That domain must be verified in Resend (DNS), including the mail subdomain if you use one.
  HOST_NOTIFY_EMAIL       = my.rootsandlegacyjamaica@gmail.com
  CAL_WEBHOOK_SECRET      = (optional) same random string you set on the webhook in Cal.com

Security: Do not paste API keys into the repo or chat. If keys were exposed, rotate them in Resend and Cal.com dashboards.

Cal.com cal_live_… API keys are for the Cal REST API. This site’s booking emails use webhooks only, so that key is not required for the Netlify function. You can store it in Netlify for future scripts, or leave unset.

In Cal.com: Event type (or team) → Webhooks → Add endpoint:
  Subscriber URL: the function URL above
  Event triggers: BOOKING_CREATED
  Secret: same as CAL_WEBHOOK_SECRET if you use signing

Redeploy the site after changing env vars.

If Cal.com also sends its own confirmation emails, you may get duplicates; adjust Cal.com notifications/workflows if you only want these branded emails.

Files: package.json, netlify/functions/cal-booking-notification.mjs
