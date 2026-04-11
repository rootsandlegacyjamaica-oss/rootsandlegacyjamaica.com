import crypto from "crypto";
import { Resend } from "resend";

/** Default sender (override with RESEND_FROM in Netlify). Quoted display name for special characters. */
const DEFAULT_RESEND_FROM =
  '"Roots&LegacyJamaica" <bookings@my.rootsandlegacyjamaica.com>';

const GREEN = "#1f4d3a";
const GOLD = "#c8a96a";
const TEXT = "#173a2a";
const MUTED = "#55675e";
const BG = "#faf7f2";
const CARD = "#ffffff";
const LINE = "#e8e1d3";

function escapeHtml(s) {
  if (s == null || s === "") return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatInZone(iso, timeZone) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
      timeZone: timeZone || "America/Jamaica",
    }).format(new Date(iso));
  } catch {
    return new Date(iso).toUTCString();
  }
}

function bookingDetailRows(payload) {
  const org = payload.organizer || {};
  const attendees = payload.attendees || [];
  const primary = attendees[0] || {};
  const videoUrl =
    payload.metadata?.videoCallUrl ||
    payload.videoCallData?.url ||
    null;
  const tz = org.timeZone || "America/Jamaica";
  const start = formatInZone(payload.startTime, tz);
  const end = formatInZone(payload.endTime, tz);
  const title = escapeHtml(payload.eventTitle || payload.title || "Consultation");
  const notes = escapeHtml(payload.additionalNotes || "").trim();

  let rows = `
    <tr><td style="padding:8px 0;color:${MUTED};font-size:13px;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;">When</td></tr>
    <tr><td style="padding:0 0 12px;color:${TEXT};font-size:16px;line-height:1.5;"><strong>Starts:</strong> ${escapeHtml(start)}<br/><strong>Ends:</strong> ${escapeHtml(end)}</td></tr>
    <tr><td style="padding:8px 0;color:${MUTED};font-size:13px;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;">Meeting</td></tr>
    <tr><td style="padding:0 0 12px;color:${TEXT};font-size:17px;font-family:Georgia,'Times New Roman',serif;">${title}</td></tr>
  `;
  if (notes) {
    rows += `<tr><td style="padding:8px 0;color:${MUTED};font-size:13px;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;">Notes</td></tr>
    <tr><td style="padding:0 0 12px;color:${TEXT};font-size:15px;line-height:1.55;">${notes}</td></tr>`;
  }
  if (videoUrl) {
    rows += `<tr><td style="padding:12px 0 0;"><a href="${escapeHtml(videoUrl)}" style="display:inline-block;background:${GREEN};color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:700;font-size:14px;">Join video call</a></td></tr>`;
  }
  rows += `<tr><td style="padding:16px 0 0;color:${MUTED};font-size:14px;line-height:1.5;"><strong style="color:${TEXT};">Guest:</strong> ${escapeHtml(primary.name || "Guest")}<br/><span style="word-break:break-all;">${escapeHtml(primary.email || "")}</span></td></tr>`;

  return rows;
}

function brandCard(innerContent) {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
    <tr><td style="height:5px;background:linear-gradient(90deg,#009b3a,#fcd116,#111111);border-radius:3px 3px 0 0;"></td></tr>
    <tr><td style="background:${CARD};padding:28px 28px 24px;border:1px solid ${LINE};border-top:none;border-radius:0 0 28px 28px;">
      <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:${GOLD};font-weight:700;">Portlandia</p>
      <p style="margin:0 0 20px;font-size:15px;color:${MUTED};">Roots and Legacy Jamaica</p>
      <table width="100%" cellpadding="0" cellspacing="0">${innerContent}</table>
    </td></tr>
  </table>`;
}

function wrapEmail(innerTable) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/></head>
<body style="margin:0;padding:24px 12px;background:${BG};color:${TEXT};">
  ${innerTable}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:16px auto 0;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:12px;color:${MUTED};text-align:center;">
    <tr><td>Portlandia · Roots and Legacy Jamaica · Portland, Jamaica heritage &amp; legacy</td></tr>
  </table>
</body></html>`;
}

function hostEmailHtml(payload) {
  const attendees = payload.attendees || [];
  const primary = attendees[0] || {};

  const headline = `You have a new booking${
    primary.name ? ` — ${escapeHtml(primary.name)}` : ""
  }`;

  const block = `
    <tr><td style="padding:0 0 16px;">
      <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:${GOLD};font-weight:700;">Host notification</p>
      <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:${TEXT};font-family:Georgia,'Times New Roman',serif;line-height:1.2;">${headline}</h1>
      <p style="margin:0;color:${MUTED};font-size:15px;line-height:1.55;">Someone booked a consultation through your Cal.com page. Details below.</p>
    </td></tr>
    ${bookingDetailRows(payload)}
  `;

  return wrapEmail(brandCard(block));
}

function guestEmailHtml(payload) {
  const org = payload.organizer || {};
  const attendees = payload.attendees || [];
  const primary = attendees[0] || {};
  const first = escapeHtml((primary.firstName || primary.name || "there").split(" ")[0]);

  const block = `
    <tr><td style="padding:0 0 16px;">
      <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:${GOLD};font-weight:700;">Thank you</p>
      <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:${TEXT};font-family:Georgia,'Times New Roman',serif;line-height:1.15;">Your consultation is confirmed, ${first}</h1>
      <p style="margin:0 0 0;color:${MUTED};font-size:15px;line-height:1.55;">We’re looking forward to speaking with you. Here’s a summary of your booking with <strong style="color:${TEXT};">${escapeHtml(org.name || "Portlandia")}</strong>.</p>
    </td></tr>
    ${bookingDetailRows(payload)}
    <tr><td style="padding:20px 0 0;border-top:1px solid ${LINE};color:${MUTED};font-size:14px;line-height:1.55;">Questions before we meet? Reply to this email or reach us through our website.</td></tr>
  `;

  return wrapEmail(brandCard(block));
}

function verifyCalSignature(rawBody, signatureHeader, secret) {
  if (!secret) return true;
  if (!signatureHeader) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  const received = String(signatureHeader).replace(/^sha256=/i, "").trim();
  if (received.length !== expected.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(received, "hex"));
  } catch {
    return expected === received;
  }
}

export const handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ ok: false, error: "Method not allowed" }) };
  }

  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body, "base64").toString("utf8")
    : event.body || "";

  const secret = process.env.CAL_WEBHOOK_SECRET || "";
  const sig = event.headers["x-cal-signature-256"] || event.headers["X-Cal-Signature-256"];
  if (secret && !verifyCalSignature(rawBody, sig, secret)) {
    return { statusCode: 401, headers, body: JSON.stringify({ ok: false, error: "Invalid signature" }) };
  }

  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: "Invalid JSON" }) };
  }

  if (body.triggerEvent !== "BOOKING_CREATED") {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, skipped: body.triggerEvent }) };
  }

  const payload = body.payload;
  if (!payload || !payload.startTime) {
    return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: "Missing payload" }) };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || DEFAULT_RESEND_FROM;
  const hostEmail = process.env.HOST_NOTIFY_EMAIL || "my.rootsandlegacyjamaica@gmail.com";

  if (!apiKey) {
    console.error("RESEND_API_KEY is not set");
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: "Server misconfiguration" }) };
  }

  const resend = new Resend(apiKey);
  const org = payload.organizer || {};
  const attendees = payload.attendees || [];
  const eventTitle = payload.eventTitle || payload.title || "Consultation";

  const hostSubject = `New booking: ${eventTitle} — ${attendees[0]?.name || "Guest"}`;

  const guestSubject = `You’re booked — ${eventTitle} · Portlandia`;

  const tasks = [];

  tasks.push(
    resend.emails.send({
      from,
      to: [hostEmail],
      replyTo: attendees[0]?.email || undefined,
      subject: hostSubject,
      html: hostEmailHtml(payload),
    })
  );

  const seen = new Set();
  for (const a of attendees) {
    const em = a?.email;
    if (!em || seen.has(em)) continue;
    seen.add(em);
    tasks.push(
      resend.emails.send({
        from,
        to: [em],
        replyTo: org.email || hostEmail,
        subject: guestSubject,
        html: guestEmailHtml({ ...payload, attendees: [a] }),
      })
    );
  }

  try {
    const results = await Promise.all(tasks);
    const errs = results.filter((r) => r && r.error);
    if (errs.length) {
      console.error("Resend errors:", errs);
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ ok: false, errors: errs.map((e) => e.error) }),
      };
    }
  } catch (e) {
    console.error(e);
    return { statusCode: 502, headers, body: JSON.stringify({ ok: false, error: String(e.message || e) }) };
  }

  return { statusCode: 200, headers, body: JSON.stringify({ ok: true, sent: tasks.length }) };
};
