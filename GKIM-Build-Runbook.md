# GKIM Digital — Build & Publish Runbook
**Version**: 1.0 | **Audience**: Ian Morrison | **Last updated**: April 2026

---

## What This Document Is

This is your step-by-step guide for every time you want to:
- Publish a new or updated version of the website
- Add or update content in any language
- Add a new language
- Regenerate the site after Claude makes changes in this conversation

You follow this document top to bottom. Every command is copy-pasteable exactly as written.

---

## How the System Works (30-second overview)

```
This Claude conversation
        ↓  Claude edits files / you update the XLS
Your GitHub repository  (gkim.digital)
        ↓  You push changes (one command)
Vercel  (reads GitHub automatically)
        ↓  Rebuilds in ~30 seconds
gkim.digital goes live
```

You never touch servers. You never FTP anything. The only tool you use is **Terminal** (Mac) or **Command Prompt** (Windows) — and the commands below are copy-paste.

---

## One-Time Setup (do this once, never again)

### Step 1 — Check Python is installed
Open Terminal and paste:
```bash
python3 --version
```
You should see something like `Python 3.11.x`. If you see an error, go to python.org and download Python 3.

### Step 2 — Install the two required libraries
Paste this into Terminal:
```bash
pip3 install openpyxl jinja2
```
Wait for it to finish. You'll see a confirmation message.

### Step 3 — Clone your GitHub repo (first time only)
Replace `YOUR-GITHUB-USERNAME` with your actual username:
```bash
cd ~/Desktop
git clone https://github.com/YOUR-GITHUB-USERNAME/gkim-digital.git
cd gkim-digital
```
You now have a folder called `gkim-digital` on your Desktop.

### Step 4 — Set up the repo folder structure
Your repo should contain these files (Claude will create them):
```
gkim-digital/
├── gkim-content.xlsx          ← the content workbook
├── build.py                   ← the build script
├── template/
│   └── index.html             ← the master HTML template
├── en/
│   └── index.html             ← generated — do not edit manually
├── de/
│   └── index.html             ← generated
├── fr/
│   └── index.html             ← generated
├── nl/
│   └── index.html             ← generated
├── zh/
│   └── index.html             ← generated
├── vi/
│   └── index.html             ← generated
└── vercel.json                ← tells Vercel how to serve the files
```

### Step 5 — Connect Vercel to GitHub
1. Go to vercel.com and log in
2. Click **Add New Project**
3. Select your `gkim-digital` GitHub repo
4. Framework Preset: **Other**
5. Output Directory: leave blank (root)
6. Click **Deploy**

Done. From now on, every time you push to GitHub, Vercel rebuilds automatically.

---

## Routine Workflow: Updating Content

Use this every time Claude updates the site or you update the XLS.

### Scenario A — Claude updated the website in this conversation

Claude will tell you when it has finished making changes and has placed files in the outputs folder. Then:

**Step 1** — Download the updated file(s) from this conversation using the download link Claude provides.

**Step 2** — Copy the downloaded file into your `gkim-digital` folder on your Desktop, replacing the old version.

**Step 3** — Open Terminal, navigate to the folder:
```bash
cd ~/Desktop/gkim-digital
```

**Step 4** — Run the build script to regenerate all language versions:
```bash
python3 build.py
```
You'll see output like:
```
✓ Generated en/index.html
✓ Generated de/index.html (draft — skipped, not live)
✓ Generated fr/index.html (draft — skipped, not live)
✓ Done. 1 live language(s) generated.
```

**Step 5** — Push to GitHub:
```bash
git add .
git commit -m "Update site — April 2026"
git push
```

**Step 6** — Wait 30 seconds, then check gkim.digital in your browser. Done.

---

### Scenario B — You updated translations in gkim-content.xlsx

**Step 1** — Save and close the Excel file.

**Step 2** — Copy it into `~/Desktop/gkim-digital/`, replacing the old version.

**Step 3** — Open Terminal:
```bash
cd ~/Desktop/gkim-digital
python3 build.py
```

**Step 4** — Check the output. If a language shows errors, open the XLS and fix the flagged cells.

**Step 5** — Push:
```bash
git add .
git commit -m "Translation update — [language] — April 2026"
git push
```

---

### Scenario C — Launching a new language

**Step 1** — Open `gkim-content.xlsx`, go to the **languages** sheet.

**Step 2** — Find the row for the language you want to launch (e.g. `de`).

**Step 3** — Change the `status` column from `draft` to `live`.

**Step 4** — Go to the **strings** sheet. Make sure all cells for that language column are filled in (no yellow `— TO BE TRANSLATED —` cells remain).

**Step 5** — Go to **meta_seo** sheet. Confirm the page title and meta description for that language are filled.

**Step 6** — Save the XLS, run the build, push:
```bash
cd ~/Desktop/gkim-digital
python3 build.py
git add .
git commit -m "Launch German language version"
git push
```

**Step 7** — Check gkim.digital/de/ in your browser.

---

## The Language Switcher

The language switcher in the nav appears automatically once more than one language is live. It reads the `languages` sheet and shows only live languages. No additional steps needed.

---

## Content Workbook Reference (gkim-content.xlsx)

| Sheet | When you use it |
|---|---|
| **README** | First time — read this for orientation |
| **languages** | To activate/deactivate a language, or add a new one |
| **strategic_emphasis** | Brief translators — share this with them before they start |
| **strings** | Day-to-day content updates — all translatable text lives here |
| **meta_seo** | Update page titles and descriptions for SEO |
| **config** | Font or format changes per language — rarely needed |

### Rules for the strings sheet
- **Never edit Column A** (the key). The build script uses these to match content.
- **Yellow cells** = not yet translated. The build script will warn you if a live language has yellow cells.
- **Column D (en)** = English reference. Never leave this blank.
- Each language has its own column (E=de, F=fr, G=nl, H=zh, I=vi).

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `python3: command not found` | Install Python 3 from python.org |
| `ModuleNotFoundError: openpyxl` | Run `pip3 install openpyxl jinja2` |
| `git: command not found` | Install Git from git-scm.com |
| Build says `WARNING: missing translations` | Open XLS, find yellow cells in that language column, fill them in |
| Site not updating after push | Go to vercel.com, check the deployment log for errors |
| Wrong content showing | Make sure you ran `python3 build.py` before `git push` |
| `Permission denied` on git push | Re-authenticate: `git config --global user.email "you@email.com"` |

---

## Quick Reference — The 3 Commands You Use Every Time

```bash
cd ~/Desktop/gkim-digital    # go to the folder
python3 build.py             # regenerate site from XLS
git add . && git commit -m "describe what changed" && git push   # publish
```

That's it. Three commands, every time.

---

## When to Ask Claude

Come back to this conversation when you want to:
- Make design or structural changes to the site
- Add new sections or content blocks
- Update the English copy
- Fix a bug or layout issue
- Add a new language to the system
- Update the build script

Claude will make the changes, update the files, and tell you exactly what to download and where to put it.

---

*Document maintained in Claude conversation — GKIM Digital Website Project*
