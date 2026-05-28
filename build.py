#!/usr/bin/env python3
"""
GKIM Digital — Multilingual Build Script
=========================================
Reads gkim-content.xlsx and generates one complete HTML file per live language.

Usage:
    python3 build.py                  # build all live languages
    python3 build.py --lang de        # build one specific language (even if draft)
    python3 build.py --all            # build all languages including drafts
    python3 build.py --check          # validate XLS only, no build
    python3 build.py --translate      # auto-translate dirty strings then build
    python3 build.py --translate-only # auto-translate dirty strings, skip build

Output:
    en/index.html
    de/index.html  (if live)
    fr/index.html  (if live)
    etc.
"""

import os
import sys
import json
import shutil
import argparse
from pathlib import Path

try:
    import openpyxl
except ImportError:
    print("ERROR: openpyxl not installed. Run: pip3 install openpyxl jinja2")
    sys.exit(1)

try:
    from jinja2 import Environment, FileSystemLoader, Undefined
except ImportError:
    print("ERROR: jinja2 not installed. Run: pip3 install openpyxl jinja2")
    sys.exit(1)


# ── Configuration ─────────────────────────────────────────────────────────────

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
WORKBOOK_PATH  = Path(__file__).parent / "gkim-content.xlsx"
TEMPLATE_DIR   = Path(__file__).parent / "template"
TEMPLATE_FILE  = "index.html"
OUTPUT_DIR     = Path(__file__).parent
STATIC_DIRS    = ["assets", "images", "fonts"]   # copied as-is to each lang dir if they exist

LANG_CODES = ["en", "de", "fr", "nl", "zh", "vi"]

# Translation settings
CLAUDE_MODEL       = os.environ.get("GKIM_TRANSLATE_MODEL", "claude-haiku-4-5-20251001")
EN_SNAPSHOT_COL    = "_en_last_translated"   # hidden column managed by this script
TBT_MARKER         = "— TO BE TRANSLATED —"


# ── Helpers ───────────────────────────────────────────────────────────────────

def load_sheet_as_dict(wb, sheet_name):
    """Load a sheet into a list of row dicts keyed by header row."""
    ws = wb[sheet_name]
    headers = [c.value for c in next(ws.iter_rows(min_row=1, max_row=1))]
    rows = []
    for row in ws.iter_rows(min_row=2, values_only=True):
        if any(v is not None for v in row):
            rows.append(dict(zip(headers, row)))
    return rows


def load_strings(wb, lang_codes):
    """
    Load the strings sheet.
    Returns dict: { key: { lang_code: translated_string } }
    Skips section header rows (those with no 'key' value).
    """
    ws = wb["strings"]
    headers = [c.value for c in next(ws.iter_rows(min_row=1, max_row=1))]

    # Find column indices for each language
    lang_col = {}
    for lang in lang_codes:
        try:
            lang_col[lang] = headers.index(lang)
        except ValueError:
            pass  # language column not yet added

    strings = {}
    for row in ws.iter_rows(min_row=2, values_only=True):
        key = row[0]
        if not key or str(key).startswith("  "):  # section header rows
            continue
        strings[key] = {}
        for lang, col_idx in lang_col.items():
            val = row[col_idx] if col_idx < len(row) else None
            strings[key][lang] = str(val).strip() if val else ""

    return strings


def load_meta(wb, lang_codes):
    """Load meta_seo sheet. Returns dict: { lang: { field: value } }"""
    ws = wb["meta_seo"]
    headers = [c.value for c in next(ws.iter_rows(min_row=1, max_row=1))]
    meta = {}
    for row in ws.iter_rows(min_row=2, values_only=True):
        d = dict(zip(headers, row))
        lang = d.get("language")
        if lang:
            meta[lang] = d
    return meta


def load_config(wb, lang_codes):
    """Load config sheet. Returns dict: { lang: { field: value } }"""
    ws = wb["config"]
    headers = [c.value for c in next(ws.iter_rows(min_row=1, max_row=1))]
    config = {}
    for row in ws.iter_rows(min_row=2, values_only=True):
        d = dict(zip(headers, row))
        lang = d.get("language")
        if lang:
            config[lang] = d
    return config


def build_hreflang_tags(languages):
    """Build <link rel="alternate"> hreflang tags for SEO."""
    tags = []
    for lang in languages:
        if lang["status"] == "live":
            code = lang["hreflang"]
            url  = lang["canonical_url"] if lang.get("canonical_url") else f"https://gkim.digital{lang['url_path']}"
            tags.append(f'  <link rel="alternate" hreflang="{code}" href="{url}">')
    # Add x-default pointing to English
    en = next((l for l in languages if l["language_name"] == "English"), None)
    if en:
        url = en.get("canonical_url", f"https://gkim.digital{en['url_path']}")
        tags.append(f'  <link rel="alternate" hreflang="x-default" href="{url}">')
    return "\n".join(tags)


def build_lang_switcher(languages, current_lang):
    """Build the language switcher dropdown HTML."""
    live_langs = [l for l in languages if l["status"] == "live"]
    if len(live_langs) <= 1:
        return ""  # No switcher if only one live language

    current = next((l for l in live_langs if l["code"] == current_lang), live_langs[0])
    current_flag = current.get("flag", current["code"].upper())

    chevron = ('<svg class="lang-arrow" viewBox="0 0 24 24" fill="none" '
               'stroke="currentColor" stroke-width="2.5">'
               '<path d="M6 9l6 6 6-6"/></svg>')

    items = []
    for lang in live_langs:
        code = lang["code"]
        native = lang["native_name"]
        path = lang["url_path"]
        flag = lang.get("flag", "")
        active = " lang-active" if code == current_lang else ""
        items.append(
            f'    <a href="{path}" class="lang-opt{active}" title="{native}">'
            f'{flag} <span>{code.upper()}</span></a>'
        )

    return (
        '<div class="lang-dropdown" id="langDropdown">\n'
        f'  <button class="lang-btn" aria-haspopup="true" aria-expanded="false" '
        f'aria-label="Select language">{current_flag} {chevron}</button>\n'
        '  <div class="lang-menu">\n'
        + "\n".join(items)
        + '\n  </div>\n'
        + '</div>'
    )


def build_extra_fonts(config_row):
    """Return extra Google Fonts query string for the <link> tag."""
    extra = config_row.get("extra_google_fonts", "") if config_row else ""
    if not extra or extra.strip().startswith("("):
        return ""
    return f"&{extra}" if extra else ""


def validate_strings(strings, languages, warn_only=True):
    """Check for missing translations in live languages. Returns list of warnings."""
    warnings = []
    live_langs = [l["code"] for l in languages if l["status"] == "live" and l["code"] != "en"]

    for lang in live_langs:
        missing = []
        for key, trans in strings.items():
            val = trans.get(lang, "")
            if not val or val == TBT_MARKER:
                missing.append(key)
        if missing:
            warnings.append(
                f"WARNING [{lang}]: {len(missing)} string(s) missing translation:\n"
                + "\n".join(f"  - {k}" for k in missing[:10])
                + (f"\n  ... and {len(missing)-10} more" if len(missing) > 10 else "")
            )
    return warnings


def add_lang_switcher_css(html):
    """Inject language switcher dropdown CSS before </style>."""
    css = """
/* ——— LANG DROPDOWN ——— */
.lang-dropdown{position:relative;display:none;}
@media(min-width:1280px){.lang-dropdown{display:flex;align-items:center;}}
.lang-btn{
  background:none;border:1px solid var(--border-on-dark);cursor:pointer;
  display:flex;align-items:center;gap:6px;
  padding:6px 10px;color:var(--text-on-dark);
  font-size:18px;line-height:1;border-radius:0;
  transition:border-color .18s;
}
.lang-btn:hover{border-color:var(--text-on-dark);}
.lang-arrow{width:12px;height:12px;transition:transform .2s;flex-shrink:0;}
.lang-dropdown.open .lang-arrow{transform:rotate(180deg);}
.lang-menu{
  position:absolute;top:calc(100% + 8px);right:0;
  background:var(--surface-dark);
  border:1px solid var(--border-on-dark);
  min-width:120px;z-index:200;
  display:none;flex-direction:column;
}
.lang-dropdown.open .lang-menu{display:flex;}
.lang-opt{
  display:flex;align-items:center;gap:8px;
  padding:10px 14px;
  color:var(--text-on-dark-muted);text-decoration:none;
  font-size:14px;font-family:'Figtree',sans-serif;
  transition:background .15s,color .15s;
  white-space:nowrap;
}
.lang-opt:hover{background:rgba(255,255,255,0.08);color:var(--text-on-dark);}
.lang-opt.lang-active{color:var(--bg-accent);}
"""
    return html.replace("</style>", css + "\n</style>", 1)


# ── Auto-Translate ─────────────────────────────────────────────────────────────

def get_snapshot_col_index(ws):
    """
    Find or create the _en_last_translated column in the strings sheet.
    Returns its 1-based column number (for ws.cell(row, column=...) calls).
    """
    headers = [c.value for c in next(ws.iter_rows(min_row=1, max_row=1))]
    if EN_SNAPSHOT_COL in headers:
        return headers.index(EN_SNAPSHOT_COL) + 1  # 1-based

    # Column doesn't exist yet — append it
    new_col = len([h for h in headers if h is not None]) + 1
    ws.cell(row=1, column=new_col, value=EN_SNAPSHOT_COL)
    return new_col


def translate_dirty(build_after=True):
    """
    Auto-detect English strings that changed since the last translation run,
    translate them to all live non-English languages via Claude API,
    write results back to the XLS, then optionally run the build.
    """
    # ── API key check
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("\nERROR: ANTHROPIC_API_KEY is not set.")
        print("  Export it before running:  export ANTHROPIC_API_KEY=sk-ant-...")
        print("  Or add it to your shell profile (~/.zshrc or ~/.bash_profile)")
        sys.exit(1)

    try:
        import anthropic
    except ImportError:
        print("ERROR: anthropic SDK not installed. Run: pip3 install anthropic")
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)

    print("\n── GKIM Digital Auto-Translate ─────────────────────────")
    print(f"📖  Loading {WORKBOOK_PATH.name}...")
    wb = openpyxl.load_workbook(WORKBOOK_PATH)

    # ── Identify live target languages
    languages    = load_sheet_as_dict(wb, "languages")
    lang_names   = {l["code"]: l["language_name"] for l in languages}
    target_langs = [
        l["code"] for l in languages
        if l["status"] == "live" and l["code"] != "en"
    ]

    if not target_langs:
        print("No live non-English languages found. Nothing to translate.")
        wb.close()
        return

    print(f"🌍  Target languages: {', '.join(target_langs)}")

    # ── Load strings sheet
    ws          = wb["strings"]
    headers_row = [c.value for c in next(ws.iter_rows(min_row=1, max_row=1))]

    def col_index(name):
        """Return 0-based index of a named column, or None."""
        try:
            return headers_row.index(name)
        except ValueError:
            return None

    en_col_0   = col_index("en")      # 0-based for reading rows
    snap_col_1 = get_snapshot_col_index(ws)   # 1-based for ws.cell writes
    snap_col_0 = snap_col_1 - 1              # 0-based for reading rows

    # Refresh headers after possible new column
    headers_row = [c.value for c in next(ws.iter_rows(min_row=1, max_row=1))]

    lang_col_1 = {}   # 1-based write indices per language
    for lang in target_langs:
        idx = col_index(lang)
        if idx is not None:
            lang_col_1[lang] = idx + 1
        else:
            print(f"  WARNING: No column for '{lang}' in strings sheet — skipping")

    if not lang_col_1:
        print("No translatable language columns found.")
        wb.close()
        return

    # ── Detect dirty rows (English changed since last translation)
    dirty = {}   # row_number (1-based) -> {"key": str, "en": str}

    for row_num, row in enumerate(ws.iter_rows(min_row=2, values_only=True), start=2):
        key = row[0]
        if not key or str(key).startswith("  "):
            continue   # section header row

        en_val   = str(row[en_col_0]).strip()   if (en_col_0 is not None and row[en_col_0]) else ""
        snap_val = str(row[snap_col_0]).strip() if (snap_col_0 < len(row) and row[snap_col_0]) else ""

        if en_val != snap_val:
            dirty[row_num] = {"key": key, "en": en_val}

    if not dirty:
        print("✅  Nothing to translate — all English strings are unchanged.")
        wb.close()
        if build_after:
            build()
        return

    print(f"🔍  {len(dirty)} string(s) changed since last translation run")

    # ── Build the string dict for the API call
    strings_to_translate = {info["key"]: info["en"] for info in dirty.values()}

    # ── Translate per language (one API call per language)
    for lang in target_langs:
        if lang not in lang_col_1:
            continue

        lang_name = lang_names.get(lang, lang)
        print(f"\n  → {lang_name} ({lang}) — sending {len(strings_to_translate)} string(s) to Claude...", end=" ", flush=True)

        prompt = f"""You are a professional translator for GKIM Digital, a business consulting and knowledge management firm.

Translate the following strings from English to {lang_name}.

Rules:
- Preserve all HTML tags exactly as they appear (e.g. <strong>, <br>, <a href="...">)
- Use a professional, precise, and natural business tone appropriate for {lang_name}-speaking markets
- Do NOT translate proper nouns: GKIM, GEARS, Ian Morrison
- Return ONLY a valid JSON object: same keys, {lang_name} values
- No markdown code fences, no explanations — pure JSON only

Strings:
{json.dumps(strings_to_translate, ensure_ascii=False, indent=2)}"""

        try:
            response = client.messages.create(
                model=CLAUDE_MODEL,
                max_tokens=8192,
                messages=[{"role": "user", "content": prompt}]
            )
            raw = response.content[0].text.strip()

            # Robustly extract JSON even if model adds a preamble
            start = raw.find("{")
            end   = raw.rfind("}") + 1
            if start == -1 or end == 0:
                raise ValueError("No JSON object found in response")
            translations = json.loads(raw[start:end])

        except Exception as e:
            print(f"\n  ERROR translating to {lang_name}: {type(e).__name__}: {e}")
            import traceback; traceback.print_exc()
            print("  Skipping this language — existing translations unchanged.")
            continue

        # Write translations back to XLS
        col_1 = lang_col_1[lang]
        written = 0
        for row_num, info in dirty.items():
            key = info["key"]
            if key in translations and translations[key]:
                ws.cell(row=row_num, column=col_1, value=translations[key])
                written += 1

        print(f"✓  ({written}/{len(dirty)} written)")
        if written == 0:
            print(f"  WARNING: 0 strings written for {lang_name} — snapshot NOT updated for this language")

    # ── Update snapshot only if at least one language was successfully translated
    langs_written = sum(
        1 for lang in target_langs
        if lang in lang_col_1 and any(
            ws.cell(row=rn, column=lang_col_1[lang]).value
            for rn in dirty
        )
    )
    if langs_written > 0:
        for row_num, info in dirty.items():
            ws.cell(row=row_num, column=snap_col_1, value=info["en"])

    # ── Save workbook
    wb.save(WORKBOOK_PATH)
    print(f"\n💾  Saved translations to {WORKBOOK_PATH.name}")

    if build_after:
        print()
        build()
    else:
        print("   Next: python3 build.py && ./deploy.sh\n")


# ── Main Build ─────────────────────────────────────────────────────────────────

def build(target_langs=None, include_drafts=False):
    print("\n── GKIM Digital Build Script ──────────────────────────")

    # 1. Load workbook
    if not WORKBOOK_PATH.exists():
        print(f"ERROR: Cannot find {WORKBOOK_PATH}")
        print("Make sure gkim-content.xlsx is in the same folder as build.py")
        sys.exit(1)

    print(f"📖  Loading {WORKBOOK_PATH.name}...")
    wb = openpyxl.load_workbook(WORKBOOK_PATH)

    # 2. Load sheets
    languages = load_sheet_as_dict(wb, "languages")
    strings   = load_strings(wb, LANG_CODES)
    meta      = load_meta(wb, LANG_CODES)
    config    = load_config(wb, LANG_CODES)

    # 3. Filter languages to build
    if target_langs:
        build_langs = [l for l in languages if l["code"] in target_langs]
    elif include_drafts:
        build_langs = languages
    else:
        build_langs = [l for l in languages if l["status"] == "live"]

    if not build_langs:
        print("No languages to build. Check languages sheet — set status to 'live'.")
        sys.exit(0)

    print(f"🌍  Building: {', '.join(l['code'] for l in build_langs)}")

    # 4. Validate translations
    warnings = validate_strings(strings, languages)
    for w in warnings:
        print(w)

    # 5. Load Jinja2 template
    if not (TEMPLATE_DIR / TEMPLATE_FILE).exists():
        print(f"ERROR: Template not found at {TEMPLATE_DIR / TEMPLATE_FILE}")
        sys.exit(1)

    env = Environment(
        loader=FileSystemLoader(str(TEMPLATE_DIR)),
        autoescape=False,
        keep_trailing_newline=True,
    )
    env.filters["linebreaks"] = lambda v: v.replace("\n", "<br>")
    template = env.get_template(TEMPLATE_FILE)

    hreflang_tags = build_hreflang_tags(languages)

    # 6. Generate each language
    for lang_row in build_langs:
        lang = lang_row["code"]
        print(f"\n  → Generating {lang}/index.html ...", end=" ")

        s = {}
        for key, trans in strings.items():
            val = trans.get(lang, "")
            if not val or val == TBT_MARKER:
                val = trans.get("en", key)
            s[key] = val

        lang_meta   = meta.get(lang, meta.get("en", {}))
        lang_config = config.get(lang, config.get("en", {}))
        extra_fonts = build_extra_fonts(lang_config)
        lang_switcher = build_lang_switcher(languages, lang)

        rendered = template.render(
            s=s,
            meta=lang_meta,
            page={"lang": lang_row.get("hreflang", lang)},
            hreflang_tags=hreflang_tags,
            extra_fonts=extra_fonts,
            lang_switcher=lang_switcher,
            lang=lang,
        )

        rendered = add_lang_switcher_css(rendered)

        out_dir  = OUTPUT_DIR / lang
        out_dir.mkdir(exist_ok=True)
        out_path = out_dir / "index.html"
        out_path.write_text(rendered, encoding="utf-8")

        for static in STATIC_DIRS:
            src = OUTPUT_DIR / static
            dst = out_dir / static
            if src.exists() and not dst.exists():
                shutil.copytree(src, dst)

        size_kb = out_path.stat().st_size // 1024
        print(f"✓  ({size_kb}KB)")

    print(f"\n✅  Done. {len(build_langs)} language(s) generated.")
    print("   Next step: git add . && git commit -m 'rebuild' && git push\n")


def check_only():
    """Validate the XLS without generating any files."""
    print("\n── GKIM Digital — Validation Check ────────────────────")
    wb = openpyxl.load_workbook(WORKBOOK_PATH)
    languages = load_sheet_as_dict(wb, "languages")
    strings   = load_strings(wb, LANG_CODES)

    live  = [l["code"] for l in languages if l["status"] == "live"]
    draft = [l["code"] for l in languages if l["status"] == "draft"]
    print(f"Live languages:  {', '.join(live) or 'none'}")
    print(f"Draft languages: {', '.join(draft) or 'none'}")
    print(f"Total string keys: {len(strings)}")

    warnings = validate_strings(strings, languages)
    if warnings:
        for w in warnings: print(w)
    else:
        print("✅  All live language translations complete.")


# ── Entry Point ────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="GKIM Digital multilingual build script")
    parser.add_argument("--lang",           help="Build specific language (e.g. --lang de)")
    parser.add_argument("--all",            action="store_true", help="Build all languages including drafts")
    parser.add_argument("--check",          action="store_true", help="Validate XLS only, no build")
    parser.add_argument("--translate",      action="store_true", help="Auto-translate dirty strings then build")
    parser.add_argument("--translate-only", action="store_true", help="Auto-translate dirty strings, skip build")
    args = parser.parse_args()

    if args.check:
        check_only()
    elif args.translate:
        translate_dirty(build_after=True)
    elif getattr(args, "translate_only", False):
        translate_dirty(build_after=False)
    elif args.lang:
        build(target_langs=[args.lang])
    elif args.all:
        build(include_drafts=True)
    else:
        build()
