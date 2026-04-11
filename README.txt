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
- package.json (Netlify Functions + Resend)
- netlify/functions/cal-booking-notification.mjs
- assets/

Publishing:
1. Upload the folder contents to Netlify, Vercel, or any static host.
2. Netlify Forms is already configured on contact.html.
3. Point your domain to the deployed site.

Recommended:
- Replace any image later by swapping the file in /assets while keeping the same filename.
Added: pricing.html and Pricing nav link.


Netlify Forms + Analytics
-------------------------
- The contact form is now configured for Netlify Forms.
- A thank-you page has been added at thank-you.html.
- Google Analytics 4 (gtag.js) is included on every page (Measurement ID G-S02Q9D3HHQ).

Cal.com booking + Google Calendar
---------------------------------
1. Create or sign in at https://cal.com — use the same team/username you want on public links.
2. Connect Google Calendar: Cal.com dashboard → App Store (or Settings) → Google Calendar → Connect. Pick the calendar where new bookings should appear (usually your primary calendar).
3. Create an Event type (e.g. “Consultation”) with duration, availability, and buffers as you like. Save.
4. Open that event type → Share (or ⋮) → copy the public link (looks like https://cal.com/yourname/consultation).
5. In this project, open booking-config.js and set CAL_BOOKING_URL to that full URL (no need to add ?embed=true; booking.js appends it). Save and redeploy.
6. booking.html embeds Cal in an iframe. The Cal.com CLI is optional and mainly used for self-hosted Cal.com development; for cal.com cloud, the web UI is enough.

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
