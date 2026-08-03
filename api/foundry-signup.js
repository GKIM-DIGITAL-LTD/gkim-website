// POST /api/foundry-signup
// Receives Home Care Foundry sign-up form data and emails the lead to the team.

import sgMail from '@sendgrid/mail';

const FROM_EMAIL = 'GKIM Digital <no-reply@gkim.digital>';
const INTERNAL_EMAILS = ['ian@gkxim.com', 'rose@gkxim.com'];

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
  const required = ['name', 'email', 'company', 'role'];
  for (const f of required) {
    if (!body[f] || !String(body[f]).trim()) return `Missing required field: ${f}`;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) return 'Invalid email address';
  if (body.name.length > 120 || body.company.length > 120) return 'Input too long';
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many submissions. Please try again later.' });
  }

  const body = req.body;
  const validationError = validate(body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const missingEnv = ['SENDGRID_API_KEY'].filter(k => !process.env[k]);
  if (missingEnv.length) {
    console.error('foundry-signup.js: missing env vars:', missingEnv.join(', '));
    return res.status(500).json({ error: `Configuration error: missing ${missingEnv.join(', ')}` });
  }
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const name = String(body.name).trim().slice(0, 120);
  const email = String(body.email).trim().slice(0, 200);
  const company = String(body.company).trim().slice(0, 120);
  const role = String(body.role).trim().slice(0, 120);
  const submitted = new Date().toLocaleString('en-GB', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Europe/London',
  });

  const text = `A new sign-up came through the Home Care Foundry page.

Name: ${name}
Email: ${email}
Company: ${company}
They are: ${role}
Submitted: ${submitted}

They've been sent to the scheduler to book a call.`;

  try {
    await sgMail.send({
      from: FROM_EMAIL,
      to: INTERNAL_EMAILS,
      replyTo: email,
      subject: `New Homecare Foundry lead: ${name} — ${company}`,
      text,
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('foundry-signup.js: email failed:', err?.message || err);
    return res.status(500).json({ error: 'Something went wrong on our end. Please try again.' });
  }
}
