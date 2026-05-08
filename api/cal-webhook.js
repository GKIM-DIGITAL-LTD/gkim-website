// POST /api/cal-webhook
// Receives Cal.com booking events via webhook.
// Looks up the matching intake submission by email, updates the Sheets row,
// and sends the branded GKIM booking confirmation email.
//
// Configure in Cal.com: Settings → Developer → Webhooks → Add webhook
// URL: https://gkim.digital/api/cal-webhook
// Events: BOOKING_CREATED
// Secret: set CAL_WEBHOOK_SECRET in Vercel env vars and paste same value in Cal.com

import crypto from 'crypto';
import { Resend } from 'resend';
import { google } from 'googleapis';

const resend = new Resend(process.env.RESEND_API_KEY);
const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const FROM_EMAIL = 'Ian Morrison <ian@gkim.digital>';
const INTERNAL_EMAILS = ['ian@gkim.digital', 'sales@gkim.digital'];

// ── Verify Cal.com webhook signature ──
function verifySignature(rawBody, signature) {
  const secret = process.env.CAL_WEBHOOK_SECRET;
  if (!secret) return true; // skip if not configured (dev only)
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature || ''));
}

// ── Sheets: find row by email and update booking columns ──
async function updateSheetWithBooking(email, bookingId, bookedAt, meetLink) {
  try {
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    // Read column D (email, 0-indexed col 3) to find the matching row
    const read = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Leads!D:D',
    });
    const rows = read.data.values || [];
    const rowIndex = rows.findIndex(r => r[0] === email);
    if (rowIndex < 0) return; // no matching intake found

    // Columns AE, AF, AG = booking_id, booked_at, meet_link (1-indexed: 31, 32, 33)
    const sheetRow = rowIndex + 1;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Leads!AE${sheetRow}:AG${sheetRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[bookingId, bookedAt, meetLink]] },
    });
  } catch (err) {
    console.error('Sheet booking update failed:', err);
  }
}

// ── Format date nicely ──
function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    timeZone: 'UTC',
  });
}
function formatTime(isoString, tz) {
  const d = new Date(isoString);
  return d.toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit',
    timeZone: tz || 'UTC', timeZoneName: 'short',
  });
}

// ── Booking confirmation email HTML ──
function confirmationEmailHtml(booking) {
  const {
    attendeeName, attendeeEmail, startTime, endTime,
    timeZone, meetLink, uid, rescheduleLink, cancelLink,
  } = booking;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>GKIM Discovery Session Confirmed</title>
</head>
<body style="margin:0;padding:0;background:#F2F2F2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F2F2F2;padding:40px 0">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #E0E0E0;max-width:600px;width:100%">

      <!-- Header -->
      <tr>
        <td style="background:#0A0A09;padding:32px 40px">
          <svg width="120" height="66" viewBox="0 0 359 197" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M94.7954 132.433C94.7954 132.703 94.6055 132.973 94.3205 133.153C92.5158 133.784 90.901 134.324 89.5712 134.774C88.1465 135.225 86.7217 135.675 85.3919 136.035C84.0621 136.395 82.1624 136.936 79.5978 137.476C75.3234 138.377 71.0491 139.097 66.7747 139.638C62.5004 140.088 58.0361 140.358 53.2868 140.358C43.7883 140.358 34.9546 138.737 26.7859 135.405C18.7121 132.073 12.2531 126.939 7.31388 120.005C2.37463 113.07 0 104.605 0 94.518C0 88.0338 1.23481 81.6396 3.79942 75.3355C6.26904 69.0314 10.1634 63.9881 15.2926 60.2957C19.567 57.1436 23.8413 54.8021 28.2107 53.091C32.58 51.4699 36.8543 50.2991 41.0337 49.7588C45.2131 49.2184 49.7723 48.9482 54.8066 48.9482C63.0703 48.9482 69.9093 49.5787 75.3234 50.7494C80.5476 51.9202 86.2467 53.3611 92.5158 55.2524C92.8007 55.3424 93.0857 55.6126 93.0857 55.9728V75.2454C93.0857 75.7858 92.4208 76.146 91.9459 75.8759C88.0515 73.8045 83.8721 72.0033 79.5978 70.5624C74.8485 68.9413 68.9594 68.2208 61.8355 68.2208C53.6667 68.2208 47.1128 69.6618 42.1735 72.6337C37.2343 75.6057 33.8148 79.118 31.9151 83.1706C30.0154 87.2233 29.0655 91.1859 29.0655 94.9683C29.0655 99.4713 30.2054 103.614 32.39 107.396C34.5747 111.179 37.9942 114.241 42.4585 116.492C46.9228 118.744 52.337 119.915 58.701 119.915C62.1204 119.915 65.8249 119.464 69.6243 118.654C70.0042 118.564 70.1942 118.294 70.1942 117.933V108.747C70.1942 108.387 69.8143 108.027 69.4343 108.027H58.0361C57.6561 108.027 57.2762 107.667 57.2762 107.306V90.8256C57.2762 90.4654 57.6561 90.1052 58.0361 90.1052H94.0355C94.4155 90.1052 94.7954 90.4654 94.7954 90.8256V132.433Z" fill="white"/>
            <path d="M202.699 139.277H170.024C169.834 139.277 169.549 139.187 169.454 139.007L135.069 99.1109C134.594 98.5706 133.739 98.9308 133.739 99.5612V138.557C133.739 138.917 133.359 139.277 132.979 139.277H106.193C105.814 139.277 105.434 138.917 105.434 138.557V50.8394C105.434 50.4791 105.814 50.1189 106.193 50.1189H132.979C133.359 50.1189 133.739 50.4791 133.739 50.8394V87.9436C133.739 88.6641 134.689 88.9343 135.069 88.3939L167.554 50.3891C167.744 50.209 167.934 50.1189 168.124 50.1189H196.999C197.664 50.1189 198.044 50.8394 197.569 51.2897L163.945 91.3659C163.755 91.6361 163.755 91.9963 163.945 92.2665L203.269 138.016C203.648 138.557 203.269 139.277 202.699 139.277Z" fill="white"/>
            <path d="M235.374 139.277H212.483C211.248 139.277 210.203 138.197 210.203 136.846V52.5507C210.203 51.1998 211.248 50.1191 212.483 50.1191H235.374C236.609 50.1191 237.654 51.1998 237.654 52.5507V136.846C237.559 138.197 236.609 139.277 235.374 139.277Z" fill="white"/>
            <path d="M357.905 139.277H331.119C330.739 139.277 330.359 138.917 330.359 138.557V89.655C330.359 88.9345 329.409 88.6643 329.029 89.2047L305.568 116.673C305.093 117.213 304.428 117.483 303.763 117.483C303.098 117.483 302.433 117.213 301.958 116.673L278.402 89.2047C277.927 88.6643 277.072 88.9345 277.072 89.655V138.557C277.072 138.917 276.692 139.277 276.312 139.277H250.286C249.906 139.277 249.526 138.917 249.526 138.557V50.8396C249.526 50.4794 249.906 50.1191 250.286 50.1191H274.887C275.077 50.1191 275.362 50.2092 275.457 50.3893L303.573 82.9006C303.858 83.2608 304.428 83.2608 304.713 82.9006L332.924 50.3893C333.114 50.2092 333.303 50.1191 333.493 50.1191H358.095C358.475 50.1191 358.855 50.4794 358.855 50.8396V138.557C358.665 138.917 358.285 139.277 357.905 139.277Z" fill="white"/>
          </svg>
        </td>
      </tr>
      <tr><td style="background:#FFDD00;height:3px;font-size:0;line-height:0">&nbsp;</td></tr>

      <!-- Confirmed badge -->
      <tr>
        <td style="padding:32px 40px 0">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="background:#1a7a3a;padding:5px 14px">
              <span style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#ffffff">&#10003; Confirmed</span>
            </td>
          </tr></table>
        </td>
      </tr>

      <!-- Main content -->
      <tr>
        <td style="padding:20px 40px 32px">
          <h1 style="margin:0 0 24px;font-size:22px;font-weight:700;color:#0A0A09;line-height:1.25">
            Your discovery session is booked,<br>${attendeeName.split(' ')[0]}
          </h1>

          <!-- Session details card -->
          <div style="background:#F7F7F7;border:1px solid #E8E8E8;padding:24px;margin-bottom:28px">
            <p style="margin:0 0 16px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#999999">Session details</p>
            <table cellpadding="0" cellspacing="0" style="width:100%">
              <tr>
                <td style="padding:6px 0;font-size:12px;color:#999999;width:30%;vertical-align:top">Event</td>
                <td style="padding:6px 0;font-size:14px;font-weight:600;color:#0A0A09">GKIM Discovery Session</td>
              </tr>
              <tr>
                <td style="padding:6px 0;font-size:12px;color:#999999;vertical-align:top">Date</td>
                <td style="padding:6px 0;font-size:14px;color:#0A0A09">${formatDate(startTime)}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;font-size:12px;color:#999999;vertical-align:top">Time</td>
                <td style="padding:6px 0;font-size:14px;color:#0A0A09">${formatTime(startTime, timeZone)} — ${formatTime(endTime, timeZone)}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;font-size:12px;color:#999999;vertical-align:top">Duration</td>
                <td style="padding:6px 0;font-size:14px;color:#0A0A09">30 minutes</td>
              </tr>
              <tr>
                <td style="padding:6px 0;font-size:12px;color:#999999;vertical-align:top">Format</td>
                <td style="padding:6px 0;font-size:14px;color:#0A0A09">Google Meet (video call)</td>
              </tr>
            </table>
          </div>

          ${meetLink ? `
          <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;width:100%">
            <tr>
              <td style="background:#0A0A09;padding:0">
                <a href="${meetLink}"
                   style="display:block;padding:14px 24px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;text-align:center;letter-spacing:0.02em">
                  Join Google Meet &rarr;
                </a>
              </td>
            </tr>
          </table>
          <p style="margin:0 0 24px;font-size:12px;color:#AAAAAA;text-align:center">
            <a href="${meetLink}" style="color:#666666;word-break:break-all">${meetLink}</a>
          </p>` : ''}

          <p style="margin:0 0 20px;font-size:14px;color:#404040;line-height:1.65">
            We've reviewed your intake in full. The session will be structured around your specific situation — no generic questions, no wasted time.
          </p>

          <p style="margin:0 0 8px;font-size:13px;color:#666666;line-height:1.6">
            <strong style="color:#0A0A09">Before the session:</strong> no preparation is needed from your side. If other team members will join, please share the Google Meet link directly with them.
          </p>

          ${rescheduleLink || cancelLink ? `
          <p style="margin:24px 0 0;font-size:12px;color:#AAAAAA">
            ${rescheduleLink ? `<a href="${rescheduleLink}" style="color:#666666;text-decoration:underline">Reschedule</a>` : ''}
            ${rescheduleLink && cancelLink ? ' &nbsp;·&nbsp; ' : ''}
            ${cancelLink ? `<a href="${cancelLink}" style="color:#666666;text-decoration:underline">Cancel</a>` : ''}
          </p>` : ''}
        </td>
      </tr>

      <!-- Divider -->
      <tr><td style="padding:0 40px"><div style="height:1px;background:#E8E8E8">&nbsp;</div></td></tr>

      <!-- Signature -->
      <tr>
        <td style="padding:28px 40px 40px">
          <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#0A0A09">Ian Morrison</p>
          <p style="margin:0 0 10px;font-size:13px;color:#666666">CEO, GKIM Digital</p>
          <p style="margin:0 0 4px;font-size:12px;color:#999999">+44 07385 542874&nbsp;&nbsp;·&nbsp;&nbsp;+1 202 438 3822&nbsp;&nbsp;·&nbsp;&nbsp;+84 907280831</p>
          <p style="margin:0 0 4px;font-size:12px;color:#999999">
            <a href="mailto:ian@gkim.digital" style="color:#0A0A09;text-decoration:none">ian@gkim.digital</a>
            &nbsp;&nbsp;·&nbsp;&nbsp;
            <a href="https://gkim.digital" style="color:#0A0A09;text-decoration:none">gkim.digital</a>
          </p>
          <p style="margin:0;font-size:12px;color:#AAAAAA">Cambridge, England, CB24</p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#0A0A09;padding:20px 40px">
          <p style="margin:0;font-size:11px;color:#555555">
            &copy; 2025 GKIM Digital &nbsp;·&nbsp; Cambridge, England
            &nbsp;·&nbsp; <a href="https://gkim.digital" style="color:#888888;text-decoration:none">gkim.digital</a>
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body></html>`;
}

// ── Internal booking notification ──
function internalBookingHtml(booking) {
  const { attendeeName, attendeeEmail, startTime, endTime, timeZone, uid } = booking;
  return `<!DOCTYPE html>
<html><body style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:#F2F2F2;padding:32px">
<div style="max-width:500px;background:#fff;border:1px solid #E0E0E0;padding:28px">
  <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#999">GKIM — Booking confirmed</p>
  <h2 style="margin:0 0 20px;font-size:18px;font-weight:700;color:#0A0A09">${attendeeName} just booked</h2>
  <table cellpadding="0" cellspacing="0" style="width:100%">
    <tr><td style="padding:6px 0;font-size:12px;color:#999;width:30%">Name</td><td style="padding:6px 0;font-size:14px;color:#0A0A09">${attendeeName}</td></tr>
    <tr><td style="padding:6px 0;font-size:12px;color:#999">Email</td><td style="padding:6px 0;font-size:14px;color:#0A0A09"><a href="mailto:${attendeeEmail}" style="color:#0A0A09">${attendeeEmail}</a></td></tr>
    <tr><td style="padding:6px 0;font-size:12px;color:#999">Date</td><td style="padding:6px 0;font-size:14px;color:#0A0A09">${formatDate(startTime)}</td></tr>
    <tr><td style="padding:6px 0;font-size:12px;color:#999">Time</td><td style="padding:6px 0;font-size:14px;color:#0A0A09">${formatTime(startTime, timeZone)} — ${formatTime(endTime, timeZone)}</td></tr>
    <tr><td style="padding:6px 0;font-size:12px;color:#999">Booking ID</td><td style="padding:6px 0;font-size:13px;color:#666">${uid}</td></tr>
  </table>
  <p style="margin:16px 0 0;font-size:12px;color:#AAAAAA">Intake briefing was sent separately at submission time.</p>
</div>
</body></html>`;
}

// ── Main handler ──
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Read raw body for signature verification
  const rawBody = JSON.stringify(req.body);
  const signature = req.headers['x-cal-signature-256'] || req.headers['x-webhook-secret'];

  if (!verifySignature(rawBody, signature)) {
    return res.status(401).json({ error: 'Invalid webhook signature' });
  }

  const { triggerEvent, payload } = req.body;

  // We only care about new bookings
  if (triggerEvent !== 'BOOKING_CREATED') {
    return res.status(200).json({ ok: true, skipped: true });
  }

  const attendee = payload.attendees?.[0] || {};
  const booking = {
    uid: payload.uid || payload.bookingId,
    attendeeName: attendee.name || payload.responses?.name?.value || '',
    attendeeEmail: attendee.email || payload.responses?.email?.value || '',
    startTime: payload.startTime,
    endTime: payload.endTime,
    timeZone: attendee.timeZone || payload.organizer?.timeZone || 'UTC',
    meetLink: payload.videoCallData?.url || payload.location || '',
    rescheduleLink: payload.rescheduleLink || '',
    cancelLink: payload.cancellationLink || '',
  };

  if (!booking.attendeeEmail) {
    console.error('No attendee email in Cal.com payload');
    return res.status(200).json({ ok: true, warning: 'No email found' });
  }

  try {
    // 1. Update Sheets row with booking metadata
    await updateSheetWithBooking(
      booking.attendeeEmail,
      booking.uid,
      booking.startTime,
      booking.meetLink
    );

    // 2. Send branded GKIM confirmation email to prospect
    await resend.emails.send({
      from: FROM_EMAIL,
      to: booking.attendeeEmail,
      subject: `GKIM Discovery Session confirmed — ${formatDate(booking.startTime)}`,
      html: confirmationEmailHtml(booking),
    });

    // 3. Notify internal team
    await resend.emails.send({
      from: FROM_EMAIL,
      to: INTERNAL_EMAILS,
      subject: `[BOOKED] ${booking.attendeeName} — ${formatDate(booking.startTime)} ${formatTime(booking.startTime, booking.timeZone)}`,
      html: internalBookingHtml(booking),
    });

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
