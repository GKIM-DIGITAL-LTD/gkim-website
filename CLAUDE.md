# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Static marketing site for **gkim.digital**, deployed on Vercel. Plain HTML/CSS/JS — no frontend framework, no bundler. Two distinct subsystems share the repo:

1. **Multilingual marketing pages** — `en/`, `de/`, `fr/`, `nl/`, `vi/`, `zh/`. Each `<lang>/index.html` is **generated** by `build.py` from a Jinja2 template plus a content spreadsheet. Do not hand-edit these files; they are overwritten on every build.
2. **Discovery / booking flow** — `discovery/index.html` (a standalone, hand-written page) backed by Vercel serverless functions in `api/`.

## Who you are working for

The repo owner is **non-technical**. This changes how you work:

- **Explain in plain language.** When reporting what changed or what is needed, avoid jargon. Say "the page that visitors see" not "the rendered template output".
- **Never assume the owner can debug.** If a command fails, fix it yourself; do not hand back a stack trace and ask them to investigate.
- **Follow the runbook.** `GKIM-Build-Runbook.md` is the owner's copy-paste guide for building and publishing. Keep your instructions consistent with it, and update it if a step changes.
- **Confirm before anything outward-facing or hard to undo** — pushing to `main` (triggers a live deploy), deleting files, changing `vercel.json` routing, or touching environment variables.
- **Never put secrets in code or commits.** API keys live only in the Vercel dashboard. `HANDOVER.md` notes that two keys were exposed during early development and must be revoked — treat any key string you see in the repo history as compromised, do not reuse it.

## Reference documents

Read the relevant doc before working in its area. Do not duplicate their content into code or summaries — link to them.

| Document | What it is | Read it when |
|---|---|---|
| `README.md` | Project overview: structure, local dev, deploy, env vars, third-party services | Always — first thing, for general context |
| `HANDOVER.md` | Discovery page handover: go-live checklist, exact env-var values, Google Sheet column headers, Cal.com webhook setup, key files | Working on `discovery/` or `api/`, or any setup/go-live task |
| `GKIM-Build-Runbook.md` | Step-by-step publish guide written for the non-tech owner | Building/publishing pages, adding content or a language; keep it in sync with reality |
| `GEAR-STYLE-GUIDE.md` | Design contract for GEARS™ apps: tokens, type scale, colour rules, header, buttons, accessibility, starter template | Any visual/CSS change to `discovery/` or a new GEAR app |
| `GEARS-PURE-ARCHITECTURE (1).md` | The GEARS™ methodology itself (business-modeling framework) — product/brand context, not website code | Need to understand what "GEARS", "gear", "5D", "Discovery" mean in GKIM's product language |

**Product context:** GKIM sells **GEARS™**, a methodology that turns business narratives into hierarchical "value chains" of gears. The website markets it; the `/discovery` page is the first **GEAR app** (a booking + intake tool). `GEARS-PURE-ARCHITECTURE (1).md` is the methodology spec — it is reference material, the website does not implement it.

## Commands

```bash
# Local dev — serve the whole repo statically
npx serve -l 3456 .          # → localhost:3456/en/  and  localhost:3456/discovery/

# Build the marketing pages (run after editing gkim-content.xlsx or template/)
python3 build.py             # build all live languages
python3 build.py --lang de   # build one language (works even if marked draft)
python3 build.py --all       # build all languages including drafts
python3 build.py --check     # validate the spreadsheet only, no output
python3 build.py --translate # auto-translate changed strings via Claude, then build

# Deploy — push to main; Vercel auto-deploys
./deploy.sh "commit message" # git add -A + commit + push origin main
```

`build.py` needs `openpyxl`, `jinja2`, and (for `--translate`) the `anthropic` SDK + `ANTHROPIC_API_KEY` in the environment. There is no test suite.

## Content build system (the key architecture)

The **source of truth for all marketing copy is `gkim-content.xlsx`**, not the HTML. The flow:

```
gkim-content.xlsx  +  template/index.html  ──build.py──▶  en/index.html, de/index.html, ...
```

- The spreadsheet has sheets for `languages` (each language's `code` + `status` = `live`/`draft`), strings, meta, and config.
- The template references copy as `{{ s["some.key"] }}`, plus `{{ meta.* }}`, `{{ page.lang }}`, and build-injected blocks `{{ hreflang_tags }}`, `{{ lang_switcher }}`, `{{ extra_fonts }}`.
- **To change marketing-page text or structure**: edit `gkim-content.xlsx` (copy) or `template/index.html` (markup), then run `build.py`. Editing `<lang>/index.html` directly is always lost on the next build.
- **Translation**: after changing an English string, it becomes "dirty" (tracked against the hidden `_en_last_translated` snapshot column). `build.py --translate` sends only dirty strings to Claude (`claude-haiku-4-5-20251001`, override with `GKIM_TRANSLATE_MODEL`) and writes the results back into the spreadsheet before building.

`discovery/index.html` is **not** part of this build system — it is edited directly.

## Serverless API (`api/`)

Vercel auto-discovers `api/*.js` as serverless functions (ESM, Node ≥20).

- **`api/submit.js`** — `POST /api/submit`. Receives the discovery intake form, scores the lead with Claude (`claude-sonnet-4-6`), appends a row to Google Sheets, and sends two Resend emails (prospect acknowledgement + internal briefing to ian@/sales@). Rate-limited to 3 submissions/hour per IP via an **in-memory map** that resets on cold start. The AI scoring prompt and email templates live here — Ian must be consulted before changing them.
- **`api/cal-webhook.js`** — receives the Cal.com `BOOKING_CREATED` webhook, updates the Sheets row, and sends the confirmation email. Signature verification is enabled only when `CAL_WEBHOOK_SECRET` is set.

The intake submission and the Cal.com booking are linked by **email address** as the join key.

Required env vars (set in the Vercel dashboard, never committed): `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `GOOGLE_SHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `CAL_WEBHOOK_SECRET`. Exact values and where to obtain each are in `HANDOVER.md`.

## Deployment

Pushing to `main`, `dev`, or `preview` triggers the `Deploy Vercel` GitHub Action (`.github/workflows/`). `main` → production (`--prod`); other branches → a preview target. `vercel.json` sets `cleanUrls`, disables trailing slashes, and redirects `/` → `/en`.

- The workflow **skips itself when the pusher is `ian-gkxim`** — Ian's pushes deploy through Vercel's native Git integration instead, so the CLI deploy is skipped to avoid double deploys.
- The workflow rewrites the commit author to `hungta@gkim.vn` (a Vercel team member) before deploying.
- Changes under `.claude/`, `.github/`, `docs/`, `plans/`, `.agents/` are path-ignored and do not trigger a deploy.

### "Ship to" command

When the user says **"ship to `<branch>`"** (e.g. "ship to preview", "ship to dev", "ship to main"), treat it as a deploy instruction. The user does not care which branch they were coding on — your job is to land the current working-tree changes on `<branch>` and deploy it.

**Steps:**

1. **Validate the branch.** Only `main`, `dev`, and `preview` trigger a Vercel deploy. If the user names anything else, stop and tell them — do not create a new branch silently.
2. **Confirm before `main`.** `main` is production (the live site). Always confirm with the user before shipping to `main`. `dev` and `preview` are non-production — proceed without extra confirmation.
3. **Move the changes onto `<branch>` and push.** First check the starting state — `git status` (uncommitted work?) and `git log <branch>..HEAD --oneline` (commits on the current branch not yet on `<branch>`?). Then pick the matching case. In all cases the originating branch is **left untouched**.

   **Case A — already on `<branch>`:** just commit and push.
   ```bash
   git pull origin <branch>
   git add -A && git commit -m "<clear message>"
   git push origin <branch>
   ```

   **Case B — on another branch, changes are uncommitted only:** carry the working tree across with stash.
   ```bash
   git stash                       # park uncommitted changes
   git checkout <branch>
   git pull origin <branch>        # sync with remote first
   git stash pop                   # re-apply changes onto <branch>
   git add -A && git commit -m "<clear message>"
   git push origin <branch>        # → triggers the Deploy Vercel Action
   ```

   **Case C — on another branch, work was already committed there mid-session:** copy those commits onto `<branch>` with cherry-pick (this leaves the originating branch's commits in place — they are duplicated, not moved). Note the commit hashes from `git log <branch>..HEAD` *before* switching.
   ```bash
   git stash                       # only if there are ALSO uncommitted changes
   git checkout <branch>
   git pull origin <branch>
   git cherry-pick <oldest_hash>..<newest_hash>   # replay the session's commits
   git stash pop                   # only if you stashed; then: git add -A && git commit
   git push origin <branch>
   ```

4. **Report the result** in plain language — which environment is updating and roughly when it will be live.

**Edge cases:**

- **`git stash pop` or `cherry-pick` conflicts** — the changes touch files that differ between branches. Stop, show the conflict, and ask the user how to proceed. Do not force. For a cherry-pick conflict, `git cherry-pick --abort` returns to a clean state.
- **Nothing to ship** — if the working tree is clean *and* there are no commits ahead of `<branch>`, there is nothing to deploy; tell the user instead of pushing an empty change.
- **Originating branch** — never commit to, reset, or delete the branch the user was coding on. Case C duplicates its commits via cherry-pick; it does not move or remove them.

This is a workflow convention, not a separate tool. The actual deploy is always the `git push` above.

## Design system

GEAR apps (the discovery page and any future GKIM tools) must follow `GEAR-STYLE-GUIDE.md`. Non-negotiable rules:

- Use the shared `:root` design tokens — never hard-code a value that has a token (colours, spacing, fonts).
- Yellow is exactly `#FFDD00` (`--bg-accent`), reserved for primary CTAs and accents. Never white text on yellow; never yellow text on a light background.
- `border-radius: 0` everywhere — hard edges are brand-defining.
- Fonts: League Gothic (display headings only), Figtree (body/UI), Instrument Serif (italic accents).
- Every GEAR app has the fixed header bar and meets the accessibility baseline (visible focus rings, `prefers-reduced-motion`, semantic landmarks).

## Working with Ian

Ian Morrison (CEO, GitHub `@ian-gkxim`) is an active collaborator with write access. Tag him on any PR touching `discovery/`, `api/`, `vercel.json`, or Vercel environment variables. Consult him before changing the AI scoring prompt or email templates in `api/submit.js`. Ian also receives internal lead briefings on `sales@gkim.digital`. Full detail in `HANDOVER.md`.

## Repo noise

The repo root holds prototype/spec files unrelated to the live site: `yingyang*.html`, `index_YingYang.html`, `gkim-website_2.html`, `stylesheet.pdf`, `*.docx`. The live site is only `<lang>/index.html`, `discovery/`, `api/`, and `logo/`. `~$gkim-content.xlsx` is an Excel lock file — ignore it.
