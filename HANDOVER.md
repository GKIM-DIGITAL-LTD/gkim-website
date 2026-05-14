# Discovery Page — Handover Notes

**Project:** GKIM Digital booking & intake flow  
**Page URL:** [gkim.digital/discovery](https://gkim.digital/discovery)  
**Prepared by:** Ian Morrison, CEO  
**Date:** May 2025  
**Status:** Code complete — awaiting environment variables + DNS to go live

---

## What Has Been Built

A custom discovery/booking page that replaces a generic Google Calendar link. It:

- Presents GKIM's strategic positioning
- Captures structured intake via a 5-step form
- Runs responses through Claude AI to generate a readiness score (0–100) and session focus recommendation
- Stores every lead in Google Sheets
- Unlocks a Cal.com inline booking embed after form submission
- Sends a branded GKIM acknowledgement email to the prospect (with personalised AI-generated message)
- Sends an internal briefing email to Ian + sales team with full AI analysis
- When the prospect books, fires a Cal.com webhook that updates Sheets and sends a confirmation email with Google Meet link

---

## What Still Needs Doing Before It Goes Live

### 1. Revoke & Regenerate API Keys

Two API keys were shared in the development session and **must be treated as compromised**:

- **Claude API key** — go to [console.anthropic.com](https://console.anthropic.com) → API Keys → revoke the old one → create a new one
- **Resend API key** — go to [resend.com](https://resend.com) → API Keys → revoke `re_44DjwLTH_*` → create a new one

### 2. Add Environment Variables to Vercel

Go to [vercel.com](https://vercel.com) → GKIM project → Settings → Environment Variables. Add:

| Variable | Where to get it |
|---|---|
| `ANTHROPIC_API_KEY` | New key from console.anthropic.com |
| `RESEND_API_KEY` | New key from resend.com |
| `GOOGLE_SHEET_ID` | `1dmsNCl09fGfq1rQxzKjIXbcvLBMlbak4fyvVhp5XArA` |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `my-api-services@eco-byte-416112.iam.gserviceaccount.com` |
| `GOOGLE_PRIVATE_KEY` | From the service account JSON key file (full `-----BEGIN RSA PRIVATE KEY-----` block) |
| `CAL_WEBHOOK_SECRET` | From Cal.com webhook settings (see step 4) |

> **Note on `GOOGLE_PRIVATE_KEY`:** Copy the entire `private_key` value from the JSON file, including the `-----BEGIN` and `-----END` lines. In Vercel, paste it as-is — Vercel handles the newlines.

### 3. Download Google Service Account Key

The GCP service account (`my-api-services@eco-byte-416112.iam.gserviceaccount.com`) needs a JSON key:

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → project `eco-byte-416112`
2. IAM & Admin → Service Accounts → click the service account
3. Keys tab → Add Key → Create new key → JSON
4. Download the JSON — use it to populate `GOOGLE_PRIVATE_KEY` and confirm `GOOGLE_SERVICE_ACCOUNT_EMAIL`

> The key file `eco-byte-416112-3c92e30ef5cb.json` exists locally on Ian's machine but is excluded from git (`.gitignore`). Do not commit it.

### 4. Verify Resend Domain

So that emails send from `ian@gkim.digital`:

1. Log in to [resend.com](https://resend.com) → Domains
2. Add `gkim.digital` if not already there
3. Copy the DNS records Resend provides (SPF, DKIM, DMARC)
4. Add them in your DNS provider (Namecheap/Cloudflare/wherever `gkim.digital` DNS is managed)
5. Click Verify in Resend — can take up to 48h to propagate

### 5. Add Google Sheet Headers

The leads sheet needs column headers in Row 1. Open the sheet and paste these across A1:

```
Timestamp | Name | Email | Company | Website | Role | Stage | Team Size | Designing | Bottleneck | Build Type | AI Role | Most Valuable | Attendees | UTM Source | UTM Medium | UTM Campaign | UTM Term | UTM Content | IP | Summary | Workflow Complexity | AI Native Relevance | Urgency | Strategic Seriousness | Readiness Score | Readiness Band | Suggested Focus | Opening Question | Prospect Message | Red Flags | High Value Angles | Raw Responses | Form ID | Booking ID | Booked At | Meet Link
```

Sheet: [Google Sheets — GKIM Leads](https://docs.google.com/spreadsheets/d/1dmsNCl09fGfq1rQxzKjIXbcvLBMlbak4fyvVhp5XArA/edit)

### 6. Configure Cal.com Webhook

So that bookings update Sheets and trigger confirmation emails:

1. Log in to [cal.com](https://cal.com) → Settings → Developer → Webhooks
2. Add webhook URL: `https://gkim.digital/api/cal-webhook`
3. Trigger: `BOOKING_CREATED`
4. Generate a secret and copy it → paste as `CAL_WEBHOOK_SECRET` in Vercel
5. After deploying, test via Cal.com's "Test webhook" button — it should return 200

### 7. Deploy

Once env vars are set:

```bash
git push origin main
```

Vercel deploys automatically. Check the Vercel dashboard for build logs.

### 8. End-to-End Test

1. Go to `gkim.digital/discovery`
2. Fill in the form and submit — check:
   - Google Sheet gets a new row
   - You receive an internal briefing email at `ian@gkim.digital` and `sales@gkim.digital`
   - Prospect receives acknowledgement email
   - Cal.com booking embed unlocks
3. Book a slot via the embed — check:
   - Google Sheet row gets updated with booking ID and Meet link
   - Prospect receives Cal.com confirmation email

---

## Architecture Overview

```
Browser
  │
  ├─ GET /discovery  →  Static HTML (discovery/index.html)
  │
  ├─ POST /api/submit  →  Vercel serverless (api/submit.js)
  │     ├─ Claude AI  →  readiness score + messages
  │     ├─ Google Sheets  →  append lead row
  │     ├─ Resend  →  email to prospect
  │     └─ Resend  →  internal briefing to Ian + sales
  │
  └─ POST /api/cal-webhook  →  Vercel serverless (api/cal-webhook.js)
        ├─ Google Sheets  →  update row with booking details
        ├─ Resend  →  confirmation email to prospect
        └─ Resend  →  brief internal booking notification
```

**Join key:** Email address links the intake form submission to the Cal.com booking.

---

## Key Files

| File | Purpose |
|---|---|
| `discovery/index.html` | Full booking page — all HTML, CSS, JS inline |
| `api/submit.js` | Intake form handler (Claude + Sheets + Resend) |
| `api/cal-webhook.js` | Cal.com booking webhook handler |
| `package.json` | Node dependencies for serverless functions |
| `vercel.json` | Routing, headers, Vercel config |

---

## Design System (match when editing)

- **Background:** `#0A0A09` (near-black)
- **Accent:** `#FFDD00` (GKIM yellow)
- **Display font:** League Gothic (Google Fonts)
- **Body font:** Figtree (Google Fonts)
- **Serif font:** Instrument Serif (Google Fonts)
- Cal.com embed brand colour: `#FFDD00`

---

## Ian's Ongoing Involvement

Ian Morrison is CEO and an active collaborator on this project. He should:

- Remain a GitHub collaborator with **write access** to `ian-gkxim/gkim-website`
- Be tagged on any PRs touching `/discovery`, `/api`, `vercel.json`, or environment variables
- Have access to the Vercel project dashboard
- Be kept on the `sales@gkim.digital` distribution so he receives internal lead briefings
- Be consulted on any changes to the AI scoring prompt (in `api/submit.js` — the `buildClaudePrompt` function) or the email templates

### Ian's accounts to share with the team lead
- Cal.com: `ian-morrison-ri6tnc` — booking event URL needs to remain unchanged
- Google Sheet: share with the developer's Google account (Editor access)
- Vercel: invite developer as team member in the GKIM Vercel team
- Anthropic Console: invite developer to the organisation at console.anthropic.com
- Resend: invite developer to the `gkim.digital` workspace

---

## Contact

**Ian Morrison**  
CEO, GKIM Digital  
ian@gkim.digital  
+44 07385 542874 | +1 202 438 3822 | +84 907280831  
Cambridge, England, CB24  
[gkim.digital](https://gkim.digital)
