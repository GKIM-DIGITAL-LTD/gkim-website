// POST /api/submit
// Receives intake form data, sends prospect acknowledgement and internal briefing via Resend.

import sgMail from '@sendgrid/mail';

const FROM_EMAIL = 'GKIM Digital <no-reply@gkim.digital>';
const INTERNAL_EMAILS = ['ian@gkim.digital', 'sales@gkim.digital'];

// ── Rate limiting (in-memory, resets per cold-start) ──
const rateMap = new Map();
function isRateLimited(ip) {
  const now = Date.now();
  const window = 60 * 60 * 1000; // 1 hour
  const max = 3;
  const hits = (rateMap.get(ip) || []).filter(t => now - t < window);
  if (hits.length >= max) return true;
  hits.push(now);
  rateMap.set(ip, hits);
  return false;
}

// ── Input validation ──
function validate(body) {
  const required = ['name', 'email', 'company', 'designing', 'buildType'];
  for (const f of required) {
    if (!body[f] || !String(body[f]).trim()) return `Missing required field: ${f}`;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) return 'Invalid email address';
  if (body.name.length > 120 || body.company.length > 120) return 'Input too long';
  if (body.designing.length > 2000) return 'Response too long (designing)';
  return null;
}


// ── Format booking date for email ──
function formatBookingLine(startTime, timezone) {
  if (!startTime) return null;
  try {
    const d = new Date(startTime);
    const opts = timezone ? { timeZone: timezone } : {};
    const day  = d.toLocaleDateString('en-GB', { weekday: 'long', ...opts });
    const date = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', ...opts });
    const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', ...opts });
    const tz   = timezone ? ` · ${timezone.replace('_', ' ')}` : '';
    return `${day}, ${date} at ${time}${tz}`;
  } catch (e) { return null; }
}

// ── Email: prospect acknowledgement ──
function prospectEmailHtml(data) {
  const firstName = data.name.split(' ')[0];
  const bookingLine = formatBookingLine(data.startTime, data.timezone);

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>You're booked — GKIM Discovery Call</title>
</head>
<body style="margin:0;padding:0;background:#F2F2F2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F2F2F2;padding:40px 0">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #E0E0E0;max-width:600px;width:100%">

      <!-- Header -->
      <tr>
        <td style="background:#0A0A09;padding:28px 40px">
          <p style="margin:0;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#888888">GKIM Discovery Session</p>
        </td>
      </tr>
      <tr><td style="background:#FFDD00;height:3px;font-size:0;line-height:0">&nbsp;</td></tr>

      <!-- Body -->
      <tr>
        <td style="padding:40px 40px 0">
          <h1 style="margin:0 0 28px;font-size:28px;font-weight:700;color:#0A0A09;line-height:1.2">You're booked, ${firstName}.</h1>

          <p style="margin:0 0 20px;font-size:15px;color:#404040;line-height:1.65">
            Your discovery call with Ian is confirmed. Here are the details:
          </p>

          <!-- Booking details -->
          <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:28px;border:1px solid #E8E8E8">
            ${bookingLine ? `<tr>
              <td style="padding:12px 16px;border-bottom:1px solid #F0F0F0;font-size:13px;color:#0A0A09">${bookingLine}</td>
            </tr>` : ''}
            <tr>
              <td style="padding:12px 16px;border-bottom:1px solid #F0F0F0;font-size:13px;color:#0A0A09">30 minutes</td>
            </tr>
            <tr>
              <td style="padding:12px 16px;border-bottom:1px solid #F0F0F0;font-size:13px;color:#0A0A09">Video call — link in your calendar invitation</td>
            </tr>
            <tr>
              <td style="padding:12px 16px;font-size:13px;color:#0A0A09">With Ian Morrison, Founder &amp; CEO of GKIM</td>
            </tr>
          </table>

          <p style="margin:0 0 16px;font-size:15px;color:#404040;line-height:1.65">
            Ian will read through what you shared before the call. Come ready to talk about your business, not ours.
          </p>
          <p style="margin:0 0 28px;font-size:15px;color:#404040;line-height:1.65">
            If anything comes up and you need to reschedule, you can do that below.
          </p>

          <table cellpadding="0" cellspacing="0" style="margin-bottom:40px">
            <tr>
              <td style="background:#0A0A09;padding:0">
                <a href="https://cal.com/ian-morrison-ri6tnc/gkim-discovery-session"
                   style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.02em">
                  Reschedule &rarr;
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Divider -->
      <tr><td style="padding:0 40px"><div style="height:1px;background:#E8E8E8"></div></td></tr>

      <!-- Signature -->
      <tr>
        <td style="padding:28px 40px 32px">
          <p style="margin:0 0 4px;font-size:14px;color:#666666">See you soon,</p>
          <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#0A0A09">Ian Morrison</p>
          <p style="margin:0;font-size:13px;color:#888888">Founder, GKIM · Design &amp; Operating Partner</p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#F7F7F7;padding:16px 40px;border-top:1px solid #E8E8E8">
          <p style="margin:0;font-size:11px;color:#999999;line-height:1.6">
            This email was sent because you booked a discovery call at
            <a href="https://gkim.digital" style="color:#666666;text-decoration:none">gkim.digital</a>.
            You're receiving this from a no-reply address — to reach Ian directly, email
            <a href="mailto:ian@gkim.digital" style="color:#666666;text-decoration:none">ian@gkim.digital</a>.
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body></html>`;
}

// ── Email: internal briefing ──
function briefingEmailHtml(data, submissionId) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>GKIM Discovery Intake: ${data.name}</title></head>
<body style="margin:0;padding:0;background:#F2F2F2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F2F2F2;padding:32px 0">
  <tr><td align="center">
    <table width="680" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #E0E0E0;max-width:680px;width:100%">

      <!-- Header -->
      <tr>
        <td style="background:#0A0A09;padding:20px 32px">
          <p style="margin:0;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#AAAAAA">GKIM Internal — Discovery Intake</p>
        </td>
      </tr>
      <tr><td style="background:#FFDD00;height:3px;font-size:0;line-height:0">&nbsp;</td></tr>

      <!-- Lead card -->
      <tr>
        <td style="padding:28px 32px 20px">
          <h2 style="margin:0 0 4px;font-size:20px;font-weight:700;color:#0A0A09">${data.name}</h2>
          <p style="margin:0 0 20px;font-size:14px;color:#666666">${data.company} &nbsp;·&nbsp; <a href="mailto:${data.email}" style="color:#0A0A09">${data.email}</a></p>

          <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:24px">
            <tr>
              <td style="padding:10px 14px;background:#F7F7F7;border:1px solid #E8E8E8;font-size:12px;color:#666666;width:30%">Where in process</td>
              <td style="padding:10px 14px;background:#F7F7F7;border:1px solid #E8E8E8;font-size:13px;color:#0A0A09;font-weight:500">${data.buildType}</td>
            </tr>
          </table>

          <div style="margin-bottom:20px">
            <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#999999">What they're trying to build</p>
            <p style="margin:0;font-size:14px;color:#0A0A09;line-height:1.65">${data.designing}</p>
          </div>

          <p style="margin:20px 0 0;font-size:11px;color:#BBBBBB">Submission ID: ${submissionId}&nbsp;·&nbsp;${new Date().toUTCString()}</p>
        </td>
      </tr>

      <tr>
        <td style="background:#0A0A09;padding:16px 32px">
          <p style="margin:0;font-size:11px;color:#555555">GKIM Digital &nbsp;·&nbsp; Internal &nbsp;·&nbsp; Not for distribution</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

// ── Main handler ──
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many submissions. Please try again later.' });
  }

  const body = req.body;

  // Validate
  const validationError = validate(body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  // Sanitise
  Object.keys(body).forEach(k => {
    if (typeof body[k] === 'string') body[k] = body[k].slice(0, 2000);
  });

  const submissionId = `gkim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // Check required env vars up front
  const missingEnv = ['SENDGRID_API_KEY'].filter(k => !process.env[k]);
  if (missingEnv.length) {
    console.error('submit.js: missing env vars:', missingEnv.join(', '));
    return res.status(500).json({ error: `Configuration error: missing ${missingEnv.join(', ')}` });
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  try {
    // 1. Send prospect acknowledgement email
    try {
      await sgMail.send({
        from: FROM_EMAIL,
        to: body.email,
        subject: `Your GKIM Discovery Session — ${body.name.split(' ')[0]}, we're ready`,
        html: prospectEmailHtml(body),
      });
    } catch (err) {
      console.error('submit.js: prospect email failed:', err?.message || err);
      throw err;
    }

    // 2. Send internal briefing email
    try {
      await sgMail.send({
        from: FROM_EMAIL,
        to: INTERNAL_EMAILS,
        subject: `Discovery intake: ${body.name} — ${body.company}`,
        html: briefingEmailHtml(body, submissionId),
      });
    } catch (err) {
      console.error('submit.js: internal briefing email failed:', err?.message || err);
      throw err;
    }

    return res.status(200).json({ ok: true, submissionId });

  } catch (err) {
    console.error('submit.js: unhandled error:', err?.message || err);
    return res.status(500).json({ error: 'Something went wrong on our end. Please try again.' });
  }
}
