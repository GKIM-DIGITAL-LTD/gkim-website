#!/usr/bin/env python3
"""
GKIM Digital — Multilingual Build Script
=========================================
Reads gkim-content.xlsx and generates one complete HTML file per live language.

Usage:
    python3 build.py                  # build all live languages
    python3 build.py --lang de        # build one specific language (even if draft)
    python3 build.py --all            # build all languages including drafts
    python3 build.py --check          # validate XLS without building

Output:
    en/index.html
    de/index.html  (if live)
    fr/index.html  (if live)
    etc.
"""

import os
import sys
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

WORKBOOK_PATH  = Path(__file__).parent / "gkim-content.xlsx"
TEMPLATE_DIR   = Path(__file__).parent / "template"
TEMPLATE_FILE  = "index.html"
OUTPUT_DIR     = Path(__file__).parent
STATIC_DIRS    = ["assets", "images", "fonts"]   # copied as-is to each lang dir if they exist

LANG_CODES = ["en", "de", "fr", "nl", "zh", "vi"]


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
    """Build the language switcher nav HTML."""
    live_langs = [l for l in languages if l["status"] == "live"]
    if len(live_langs) <= 1:
        return ""  # No switcher if only one live language

    items = []
    for lang in live_langs:
        code = lang["code"]
        native = lang["native_name"]
        path = lang["url_path"]
        active = ' class="lang-active"' if code == current_lang else ""
        items.append(f'    <a href="{path}"{active}>{native}</a>')

    return (
        '  <div class="lang-switcher">\n'
        + "\n".join(items)
        + '\n  </div>'
    )


def build_extra_fonts(config_row):
    """Return extra Google Fonts query string for the <link> tag."""
    extra = config_row.get("extra_google_fonts", "") if config_row else ""
    if not extra or extra.strip().startswith("("):
        return ""
    # Format: already a Google Fonts family string e.g. "ZCOOL+XiaoWei|Noto+Sans+SC:wght@300;400;500"
    return f"&{extra}" if extra else ""


def validate_strings(strings, languages, warn_only=True):
    """Check for missing translations in live languages. Returns list of warnings."""
    warnings = []
    live_langs = [l["code"] for l in languages if l["status"] == "live" and l["code"] != "en"]
    tbt = "— TO BE TRANSLATED —"

    for lang in live_langs:
        missing = []
        for key, trans in strings.items():
            val = trans.get(lang, "")
            if not val or val == tbt:
                missing.append(key)
        if missing:
            warnings.append(
                f"WARNING [{lang}]: {len(missing)} string(s) missing translation:\n"
                + "\n".join(f"  - {k}" for k in missing[:10])
                + (f"\n  ... and {len(missing)-10} more" if len(missing) > 10 else "")
            )
    return warnings


def add_lang_switcher_css(html):
    """Inject language switcher CSS before </style>."""
    css = """
/* ——— LANGUAGE SWITCHER ——— */
.lang-switcher {
  display: flex; gap: 0.75rem; align-items: center;
  margin-right: 1.5rem;
}
.lang-switcher a {
  font-size: 0.72rem; letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--ink-muted); padding: 0.2rem 0.4rem;
  border: 1px solid transparent; transition: all 0.2s;
}
.lang-switcher a:hover { color: var(--ink); border-color: var(--chalk-mid); }
.lang-switcher a.lang-active {
  color: var(--ink); border-color: var(--chalk-mid);
  background: var(--chalk-warm);
}
@media (max-width: 900px) {
  .lang-switcher { display: none; }
}
"""
    return html.replace("</style>", css + "\n</style>", 1)


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
    # Custom filter: replace \n with <br>
    env.filters["linebreaks"] = lambda v: v.replace("\n", "<br>")
    template = env.get_template(TEMPLATE_FILE)

    hreflang_tags = build_hreflang_tags(languages)

    # 6. Generate each language
    for lang_row in build_langs:
        lang = lang_row["code"]
        print(f"\n  → Generating {lang}/index.html ...", end=" ")

        # Build string dict for this language (fall back to EN if missing)
        s = {}
        tbt = "— TO BE TRANSLATED —"
        for key, trans in strings.items():
            val = trans.get(lang, "")
            if not val or val == tbt:
                val = trans.get("en", key)  # fall back to English
            s[key] = val

        # Meta for this language
        lang_meta = meta.get(lang, meta.get("en", {}))

        # Config for this language
        lang_config = config.get(lang, config.get("en", {}))

        # Extra fonts
        extra_fonts = build_extra_fonts(lang_config)

        # Language switcher HTML
        lang_switcher = build_lang_switcher(languages, lang)

        # Render template
        rendered = template.render(
            s=s,
            meta=lang_meta,
            page={"lang": lang_row.get("hreflang", lang)},
            hreflang_tags=hreflang_tags,
            extra_fonts=extra_fonts,
            lang_switcher=lang_switcher,
            lang=lang,
        )

        # Inject lang switcher CSS
        rendered = add_lang_switcher_css(rendered)

        # Write output
        out_dir = OUTPUT_DIR / lang
        out_dir.mkdir(exist_ok=True)
        out_path = out_dir / "index.html"
        out_path.write_text(rendered, encoding="utf-8")

        # Copy static assets if they exist
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

    live = [l["code"] for l in languages if l["status"] == "live"]
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
    parser.add_argument("--lang",  help="Build specific language code (e.g. --lang de)")
    parser.add_argument("--all",   action="store_true", help="Build all languages including drafts")
    parser.add_argument("--check", action="store_true", help="Validate XLS only, no build")
    args = parser.parse_args()

    if args.check:
        check_only()
    elif args.lang:
        build(target_langs=[args.lang])
    elif args.all:
        build(include_drafts=True)
    else:
        build()
