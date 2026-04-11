import { Resend } from "resend";

const DEFAULT_FROM =
  '"Roots&LegacyJamaica" <bookings@my.rootsandlegacyjamaica.com>';

function escapeHtml(s) {
  if (s == null || s === "") return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function teamEmailHtml(data) {
  const rows = [
    ["Name", data.name],
    ["Email", data.email],
    ["Phone", data.phone || "—"],
    ["Location", data.location || "—"],
    ["Interest", data.interest || "—"],
    ["Message", data.message],
  ]
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px 8px 0;color:#55675e;font-size:13px;vertical-align:top;width:120px">${escapeHtml(k)}</td><td style="padding:8px 0;color:#173a2a;font-size:15px">${escapeHtml(v)}</td></tr>`
    )
    .join("");

  return `<!DOCTYPE html><html><body style="margin:0;padding:24px;font-family:Inter,system-ui,sans-serif;background:#faf7f2;color:#173a2a">
<table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e8e1d3;border-radius:16px;padding:24px">
<tr><td style="height:4px;background:linear-gradient(90deg,#009b3a,#fcd116,#111);border-radius:2px"></td></tr>
<tr><td style="padding-top:16px"><p style="margin:0 0 8px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#c8a96a;font-weight:700">New contact form</p>
<h1 style="margin:0 0 16px;font-size:20px;font-family:Georgia,serif">Inquiry from ${escapeHtml(data.name)}</h1>
<table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
<p style="margin:20px 0 0;font-size:13px;color:#55675e">Reply to this email to respond directly to the address they provided.</p>
</td></tr></table></body></html>`;
}

function visitorEmailHtml(data) {
  const first = escapeHtml((data.name || "there").split(/\s+/)[0]);
  return `<!DOCTYPE html><html><body style="margin:0;padding:24px;font-family:Inter,system-ui,sans-serif;background:#faf7f2;color:#173a2a">
<table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e8e1d3;border-radius:16px;padding:28px 24px">
<tr><td style="height:4px;background:linear-gradient(90deg,#009b3a,#fcd116,#111);border-radius:2px"></td></tr>
<tr><td style="padding-top:16px"><p style="margin:0 0 8px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#c8a96a;font-weight:700">Portlandia</p>
<h1 style="margin:0 0 12px;font-size:22px;font-family:Georgia,serif">We received your message, ${first}</h1>
<p style="margin:0;color:#55675e;font-size:15px;line-height:1.55">Thank you for reaching out to Roots and Legacy Jamaica. We’ll get back to you using the email or phone number you shared.</p>
</td></tr></table></body></html>`;
}

const emailOk = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || "").trim());

export const handler = async (event) => {
  const headers = { "Content-Type": "application/json" };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ ok: false, error: "Method not allowed" }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: "Invalid JSON" }) };
  }

  const bot = body["bot-field"] || body.botField;
  if (bot) {
    return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: "Bad request" }) };
  }

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const phone = String(body.phone || "").trim();
  const location = String(body.location || "").trim();
  const interest = String(body.interest || "").trim();
  const message = String(body.message || "").trim();

  if (!name || !email || !message) {
    return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: "Missing name, email, or message" }) };
  }

  if (!emailOk(email)) {
    return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: "Invalid email" }) };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || DEFAULT_FROM;
  const to = process.env.CONTACT_NOTIFY_EMAIL || "rootsandlegacyjamaica@gmail.com";
  const sendVisitorCopy = process.env.CONTACT_SEND_CONFIRMATION !== "false";

  if (!apiKey) {
    console.error("RESEND_API_KEY missing");
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: "Server misconfiguration" }) };
  }

  const resend = new Resend(apiKey);
  const data = { name, email, phone, location, interest, message };

  const teamSubject = `Contact inquiry — ${name}`;
  const tasks = [
    resend.emails.send({
      from,
      to: [to],
      replyTo: email,
      subject: teamSubject,
      html: teamEmailHtml(data),
    }),
  ];

  if (sendVisitorCopy) {
    tasks.push(
      resend.emails.send({
        from,
        to: [email],
        replyTo: to,
        subject: "We received your message — Portlandia / Roots and Legacy Jamaica",
        html: visitorEmailHtml(data),
      })
    );
  }

  try {
    const results = await Promise.all(tasks);
    const errs = results.filter((r) => r && r.error);
    if (errs.length) {
      console.error(errs);
      return { statusCode: 502, headers, body: JSON.stringify({ ok: false, error: "Email send failed" }) };
    }
  } catch (e) {
    console.error(e);
    return { statusCode: 502, headers, body: JSON.stringify({ ok: false, error: "Email send failed" }) };
  }

  return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
};
