# GKIM Digital — Website

Static marketing site for [gkim.digital](https://gkim.digital), deployed on Vercel. Built with plain HTML/CSS/JS (Python template build system) plus Vercel serverless functions for backend features.

## Structure

```
/
├── en/                  # English site (root language)
├── de/ fr/ nl/ vi/ zh/  # Translated versions
├── discovery/           # Booking & intake page (/discovery)
├── api/                 # Vercel serverless functions
│   ├── submit.js        # Intake form → Claude AI → Sheets → Email
│   └── cal-webhook.js   # Cal.com booking webhook handler
├── template/            # HTML build templates
├── build.py             # Site build script (reads gkim-content.xlsx)
├── gkim-content.xlsx    # Content spreadsheet (source of truth for copy)
├── vercel.json          # Vercel routing & headers config
├── package.json         # Node dependencies for serverless functions
└── logo/                # Brand assets
```

## Local Development

```bash
# Serve the site locally
npx serve -l 3456 .
# → http://localhost:3456/discovery/
# → http://localhost:3456/en/
```

> The build script (`build.py`) regenerates translated HTML from `gkim-content.xlsx`. Run it if you edit copy in the spreadsheet.

## Deployment

Push to `main` on GitHub → Vercel auto-deploys to [gkim.digital](https://gkim.digital).

```bash
git add <files>
git commit -m "your message"
git push origin main
```

No build step required for the static pages. Vercel picks up `api/*.js` as serverless functions automatically.

## Discovery / Booking Page (`/discovery`)

The flagship intake + booking flow. See [HANDOVER.md](./HANDOVER.md) for full setup instructions.

**How it works:**
1. Visitor fills a multi-step intake form
2. On submit, `api/submit.js` fires: Claude AI scores the lead → writes to Google Sheets → sends branded emails
3. Cal.com booking embed unlocks so visitor can pick a time
4. When they book, Cal.com fires a webhook to `api/cal-webhook.js`, which updates Sheets and sends confirmation emails

## Environment Variables (Vercel)

Set these in the Vercel project dashboard under Settings → Environment Variables:

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Claude API key (console.anthropic.com) |
| `RESEND_API_KEY` | Resend transactional email key (resend.com) |
| `GOOGLE_SHEET_ID` | Google Sheets ID for lead storage |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | GCP service account email |
| `GOOGLE_PRIVATE_KEY` | GCP service account private key (include full `-----BEGIN...` block) |
| `CAL_WEBHOOK_SECRET` | Cal.com webhook secret (optional — enables signature verification) |

## Key Third-Party Services

| Service | Purpose | Account |
|---|---|---|
| Vercel | Hosting & serverless | ian-gkxim (GitHub) |
| Cal.com | Booking calendar | ian-morrison-ri6tnc |
| Google Sheets | Lead CRM | eco-byte-416112 GCP project |
| Resend | Transactional email | gkim.digital domain |
| Anthropic | AI intake scoring | console.anthropic.com |
| GA4 | Analytics | G-SH3YGTBKWL |

## Collaborating with Ian

Ian Morrison (CEO) is an active collaborator on this repo. He should be kept as a GitHub collaborator with write access and notified of any changes to:
- `/discovery/` — booking page UX
- `/api/` — serverless function logic
- `vercel.json` — routing rules
- Environment variables in Vercel

Tag Ian (`@ian-gkxim`) on any PRs touching these areas.
