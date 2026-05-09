# GEAR App Style Guide
*Design architecture for any app that belongs to the GEARS™ ecosystem*

---

## What is a GEAR App?

A **GEAR app** is any standalone web application or tool that implements one or more named gears from the GKIM GEARS™ methodology — for example, a Discovery session booking page, a Blueprint builder, an Audit tool, or a Client Dashboard. Each app is its own product but must feel like it comes from the same system.

This guide defines the minimum design contract every GEAR app must honour so that users moving between tools experience one coherent platform.

---

## 1. Design Tokens

Drop this `:root` block at the top of every GEAR app's stylesheet. Never hard-code a value that has a token.

```css
:root {
  /* ── Colour palette ── */
  --bg-dark:            #0A0A09;
  --bg-light:           #F2F2F2;
  --bg-accent:          #FFDD00;   /* GKIM yellow — primary call-to-action */

  --surface-white:      #FFFFFF;
  --surface-dark:       #202020;
  --surface-header:     #0A0A09;   /* default header bg */
  --surface-header-scrolled: rgba(32,32,32,0.92); /* frosted on scroll */

  --text-on-dark:       #FFFFFF;
  --text-on-dark-muted: #D6D6D6;
  --text-on-dark-dim:   rgba(255,255,255,0.38);
  --text-on-light:      #202020;
  --text-on-light-muted:#5C5C5C;

  --border-on-dark:     #5C5C5C;
  --border-on-light:    #D6D6D6;
  --border-strong:      #333533;

  /* ── Accent aliases (legacy compat) ── */
  --accent:             #FFDD00;
  --ink:                #0A0A09;
  --ink-soft:           #2C2C2A;
  --ink-muted:          #6B6A64;
  --chalk:              #F2F2F2;
  --chalk-warm:         #EDE9E0;
  --chalk-mid:          #D4CFC2;

  /* ── Typography ── */
  --type-display: 'League Gothic', Impact, Arial Narrow, sans-serif;
  --type-body:    'Figtree', 'Helvetica Neue', Arial, sans-serif;
  --type-serif:   'Instrument Serif', Georgia, serif;

  /* ── Spacing scale (4 px base) ── */
  --sp-1:  4px;   --sp-2:  8px;   --sp-3:  12px;  --sp-4:  16px;
  --sp-5:  20px;  --sp-6:  24px;  --sp-8:  32px;  --sp-10: 40px;
  --sp-12: 48px;  --sp-16: 64px;  --sp-20: 80px;

  /* ── Layout ── */
  --container-max:        1120px;
  --header-h-desktop:     84px;
  --header-h-mobile:      64px;

  /* ── Motion ── */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
}
```

### Font loading

Always load all three families together in a single Google Fonts request:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=League+Gothic&family=Instrument+Serif:ital@0;1&family=Figtree:wght@300;400;500;600&display=swap" rel="stylesheet">
```

---

## 2. Typography

### Type scale

| Role | Family | Size | Weight | Notes |
|---|---|---|---|---|
| **Page / section title** | League Gothic | `clamp(2.5rem, 5vw, 5rem)` | 400 (the face is inherently heavy) | All-caps optional; `letter-spacing: 0` |
| **Sub-heading / card title** | League Gothic | `clamp(1.25rem, 2.5vw, 2rem)` | 400 | |
| **Eyebrow / label** | Figtree | `0.68rem` | 500 | `letter-spacing: 0.14em; text-transform: uppercase` |
| **Body** | Figtree | `1rem` | 400 | `line-height: 1.65` |
| **Body large** | Figtree | `1.125rem` | 300–400 | Used in hero sub-copy |
| **Caption / meta** | Figtree | `0.78rem` | 400 | `color: var(--text-on-*-muted)` |
| **Pull quote / italic accent** | Instrument Serif | `1.1–1.3rem` | 400 italic | Sparingly — one per section max |

### League Gothic rules
- It is a condensed display face. Never stretch or distort it horizontally.
- `line-height: 1.0–1.1` for large display sizes; `1.2` for sub-headings.
- Pair yellow (`--bg-accent`) text on dark backgrounds for hero callouts.
- Do **not** use it for body copy, labels, or UI chrome (buttons, nav).

---

## 3. Colour Usage

| Context | Background | Text | Border |
|---|---|---|---|
| Hero / header | `--bg-dark` | `--text-on-dark` | `--border-on-dark` |
| Light content section | `--bg-light` | `--text-on-light` | `--border-on-light` |
| Warm content section | `--chalk-warm` | `--text-on-light` | `--chalk-mid` |
| Dark content section | `--surface-dark` | `--text-on-dark` | `--border-on-dark` |
| CTA / accent | `--bg-accent` | `--text-on-light` | `--border-strong` |

**Yellow (`--bg-accent`) is reserved for:**
- Primary CTA buttons
- Accent marks and arrows ( `→` )
- Active/selected states
- GEARS™ trademark badge background

Never put yellow text on a white or light background — contrast fails WCAG AA. Always pair yellow backgrounds with dark (`--text-on-light`) text.

---

## 4. Header Bar

Every GEAR app has a persistent header bar. It sits at the top of the viewport, fixed, and always contains:

1. **GEARS™ wordmark + gear-app name** (left)
2. **Back link to gkim.digital** (optional — omit inside embedded iframes)
3. **Primary CTA button** (right, app-specific)

### Dimensions

| Breakpoint | Height |
|---|---|
| Desktop (≥ 768 px) | `84px` |
| Mobile (< 768 px) | `64px` |

### States

| State | Background | Behaviour |
|---|---|---|
| Default (top of page) | `--bg-dark` (`#0A0A09`) | Fully opaque, no blur |
| Scrolled (> 40 px) | `rgba(32,32,32,0.92)` | `backdrop-filter: blur(16px)` |

### Markup template

```html
<header class="gear-header" id="gear-header">
  <div class="gear-header__inner">

    <!-- Left: GEARS logo + app name -->
    <a class="gear-header__brand" href="https://gkim.digital" aria-label="GKIM — GEARS">
      <!-- GEARS™ SVG wordmark (see Section 5) -->
      <svg class="gear-header__gears-logo" aria-hidden="true">…</svg>
      <!-- App name separator + label -->
      <span class="gear-header__divider" aria-hidden="true"></span>
      <span class="gear-header__app-name">Discovery</span><!-- change per app -->
    </a>

    <!-- Right: CTA (app-specific) -->
    <a class="gear-btn gear-btn--primary" href="#book">Book a session</a>

  </div>
</header>
```

### CSS for the header

```css
/* ── Header shell ── */
.gear-header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 200;
  height: var(--header-h-desktop);
  background: var(--surface-header);
  transition: background 0.3s var(--ease-out), backdrop-filter 0.3s var(--ease-out);
}
.gear-header.is-scrolled {
  background: var(--surface-header-scrolled);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.gear-header__inner {
  max-width: var(--container-max);
  margin: 0 auto;
  height: 100%;
  padding: 0 var(--sp-10);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* ── Brand lockup ── */
.gear-header__brand {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  text-decoration: none;
}
.gear-header__gears-logo {
  height: 28px;   /* scales with SVG's natural aspect ratio */
  width: auto;
  display: block;
  flex-shrink: 0;
}
.gear-header__divider {
  display: block;
  width: 1px;
  height: 20px;
  background: var(--border-on-dark);
  flex-shrink: 0;
}
.gear-header__app-name {
  font-family: var(--type-display);
  font-size: 1.1rem;
  letter-spacing: 0.03em;
  color: var(--text-on-dark-muted);
  text-transform: uppercase;
  line-height: 1;
}

/* ── Scroll listener (vanilla JS) ── */
/* Add is-scrolled class via:
   const h = document.getElementById('gear-header');
   window.addEventListener('scroll', () =>
     h.classList.toggle('is-scrolled', window.scrollY > 40));
*/

/* ── Mobile ── */
@media (max-width: 767px) {
  .gear-header { height: var(--header-h-mobile); }
  .gear-header__inner { padding: 0 var(--sp-6); }
  .gear-header__gears-logo { height: 22px; }
  .gear-header__app-name { font-size: 0.9rem; }
}
```

---

## 5. GEARS™ Logo Mark

Use the SVG below inside `.gear-header__gears-logo`. It renders the GEARS wordmark in white (suitable on dark headers). For dark-on-light contexts, set `fill` to `var(--text-on-light)` or `#1D1D1D`.

The mark is the uppercase letters **G · E · A · R · S** set in the proprietary GKIM letterform, with the yellow superscript trademark indicator.

```svg
<!-- GEARS™ horizontal wordmark — white on dark -->
<!-- Source: /logo/inverted-logo-on-black-background.svg (full GKIM mark) -->
<!-- For a GEAR app header, embed the full GKIM SVG from /logo/official-logo.svg
     and override fill to white using CSS: -->
<svg viewBox="0 0 359 207" fill="none" xmlns="http://www.w3.org/2000/svg"
     class="gear-header__gears-logo" style="height:36px;width:auto">
  <!-- Main letterforms: white on dark -->
  <path fill="#FFFFFF" d="M94.7954 139.155 … "/><!-- G -->
  <path fill="#FFFFFF" d="M202.699 146.347 … "/><!-- K -->
  <!-- … remaining paths … -->
  <!-- Yellow trademark accent -->
  <path fill="#FFD400" d="M210.203 22.5704 … "/>
  <path fill="#FFD400" d="M220.841 26.8287 … "/>
</svg>
```

> **Practical note:** Rather than inlining the full SVG in every HTML file, host the logo files at a shared URL path `/logo/` and reference them via `<img>` or `<object>`:
>
> ```html
> <!-- Dark header — use the inverted (white) logo -->
> <img src="/logo/inverted-logo-on-black-background.svg"
>      alt="GKIM GEARS"
>      class="gear-header__gears-logo">
>
> <!-- Light header (rare) — use the standard logo -->
> <img src="/logo/official-logo.svg"
>      alt="GKIM GEARS"
>      class="gear-header__gears-logo">
> ```

### Logo clearspace

- Minimum clearspace: `12px` on all sides of the logo bounding box.
- Minimum display height: `22px` (mobile), `28px` (desktop).
- Never place the logo on a coloured background other than `--bg-dark`, `--bg-accent` (yellow), or white.
- Never recolour the yellow trademark mark (`#FFD400`). It must always appear yellow.

---

## 6. Buttons

All GEAR apps share the same button vocabulary. No rounded corners — GKIM uses a hard-edged, editorial aesthetic.

```css
/* ── Base ── */
.gear-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  font-family: var(--type-body);
  font-size: 1rem;
  font-weight: 600;
  line-height: 1;
  padding: var(--sp-2) var(--sp-6);
  border: 2px solid transparent;
  border-radius: 0;
  cursor: pointer;
  text-decoration: none;
  transition: opacity 0.2s, transform 0.1s;
  white-space: nowrap;
}
.gear-btn:active { transform: translateY(1px); }
.gear-btn:focus-visible { outline: 2px solid var(--bg-accent); outline-offset: 3px; }

/* Primary — yellow, use on dark or neutral sections */
.gear-btn--primary {
  background: var(--bg-accent);
  color: var(--text-on-light);
  border-color: var(--border-strong);
}
.gear-btn--primary:hover { opacity: 0.88; }

/* Secondary dark — use on dark sections */
.gear-btn--secondary-dark {
  background: var(--surface-dark);
  color: var(--text-on-dark);
  border-color: var(--border-on-light);
}
.gear-btn--secondary-dark:hover { opacity: 0.85; }

/* Secondary light — use on light/warm sections */
.gear-btn--secondary-light {
  background: var(--surface-white);
  color: var(--text-on-light);
  border-color: var(--border-strong);
}
.gear-btn--secondary-light:hover { opacity: 0.85; }

/* Ghost — transparent, used inside dark sections for low-priority actions */
.gear-btn--ghost {
  background: transparent;
  color: var(--text-on-dark-muted);
  border-color: var(--border-on-dark);
}
.gear-btn--ghost:hover { color: var(--text-on-dark); border-color: var(--border-on-light); }
```

---

## 7. Layout & Spacing

```css
/* ── Page shell ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  font-family: var(--type-body);
  background: var(--bg-light);
  color: var(--text-on-light);
  line-height: 1.65;
  overflow-x: hidden;
}
a { color: inherit; text-decoration: none; }

/* Offset page content below the fixed header */
main { padding-top: var(--header-h-desktop); }
@media (max-width: 767px) { main { padding-top: var(--header-h-mobile); } }

/* ── Content container ── */
.container {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--sp-10);
}
@media (max-width: 767px) {
  .container { padding: 0 var(--sp-6); }
}

/* ── Section spacing ── */
.section {
  padding: var(--sp-20) 0;
}
@media (max-width: 767px) {
  .section { padding: var(--sp-12) 0; }
}
```

---

## 8. Eyebrow / Section Label

Small all-caps labels that identify a section or content category. Always use the body font, never League Gothic.

```css
.gear-eyebrow {
  font-family: var(--type-body);
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-on-light-muted);   /* or --text-on-dark-muted on dark bg */
  margin-bottom: var(--sp-3);
}
/* Yellow variant — for use on dark sections */
.gear-eyebrow--accent {
  color: var(--bg-accent);
}
```

Usage:
```html
<p class="gear-eyebrow gear-eyebrow--accent">GEARS™ — Business-Led System Design</p>
<h2 class="display-title">Define the System Before You Build It</h2>
```

---

## 9. Display Headings

```css
/* ── League Gothic heading scale ── */
.display-xl {
  font-family: var(--type-display);
  font-size: clamp(3rem, 6vw, 6rem);
  line-height: 1.0;
  letter-spacing: 0;
  font-weight: 400;
}
.display-lg {
  font-family: var(--type-display);
  font-size: clamp(2rem, 4vw, 4rem);
  line-height: 1.05;
  letter-spacing: 0;
  font-weight: 400;
}
.display-md {
  font-family: var(--type-display);
  font-size: clamp(1.5rem, 3vw, 2.5rem);
  line-height: 1.1;
  letter-spacing: 0;
  font-weight: 400;
}
.display-sm {
  font-family: var(--type-display);
  font-size: clamp(1.1rem, 2vw, 1.5rem);
  line-height: 1.2;
  letter-spacing: 0;
  font-weight: 400;
}

/* Colour modifiers */
.display-xl.on-dark,
.display-lg.on-dark,
.display-md.on-dark,
.display-sm.on-dark { color: var(--text-on-dark); }

.display-xl.on-light,
.display-lg.on-light,
.display-md.on-light,
.display-sm.on-light { color: var(--text-on-light); }

/* Yellow accent word — wrap a span inside the heading */
.display-accent { color: var(--bg-accent); }
```

---

## 10. Accessibility Baseline

- **Focus:** All interactive elements must have a visible `:focus-visible` ring using `outline: 2px solid var(--bg-accent); outline-offset: 3px;`.
- **Contrast:** Light text (`#FFFFFF`) on `--bg-dark` (#0A0A09) = 19.6 : 1 ✓. Dark text (`#202020`) on `--bg-accent` (#FFDD00) = 9.3 : 1 ✓. Check any new palette combinations at WCAG AA (4.5 : 1 for body, 3 : 1 for large text).
- **`prefers-reduced-motion`:** Wrap all animation and transition declarations in:
  ```css
  @media (prefers-reduced-motion: no-preference) {
    /* transitions and animations here */
  }
  ```
- **Semantic HTML:** Use `<header>`, `<main>`, `<section>`, `<nav>` landmarks. Give every `<img>` an `alt`.

---

## 11. Starter Page Template

Copy-paste this skeleton for any new GEAR app:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GKIM — [Gear Name]</title>
  <link rel="icon" href="/logo/official-favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=League+Gothic&family=Instrument+Serif:ital@0;1&family=Figtree:wght@300;400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/gear-tokens.css"><!-- shared token file -->
  <link rel="stylesheet" href="./style.css"><!-- app-specific styles -->
</head>
<body>

  <!-- ── HEADER ── -->
  <header class="gear-header" id="gear-header">
    <div class="gear-header__inner">
      <a class="gear-header__brand" href="https://gkim.digital" aria-label="Back to GKIM">
        <img src="/logo/inverted-logo-on-black-background.svg"
             alt="GKIM"
             class="gear-header__gears-logo">
        <span class="gear-header__divider" aria-hidden="true"></span>
        <span class="gear-header__app-name">[Gear Name]</span>
      </a>
      <a class="gear-btn gear-btn--primary" href="#action">[Primary CTA]</a>
    </div>
  </header>

  <!-- ── MAIN ── -->
  <main>
    <section class="section" style="background: var(--bg-dark);">
      <div class="container">
        <p class="gear-eyebrow gear-eyebrow--accent">GEARS™</p>
        <h1 class="display-xl on-dark">[Gear Headline]</h1>
      </div>
    </section>
  </main>

  <script>
    const header = document.getElementById('gear-header');
    window.addEventListener('scroll', () =>
      header.classList.toggle('is-scrolled', window.scrollY > 40),
      { passive: true }
    );
  </script>
</body>
</html>
```

---

## 12. What NOT to Do

| ❌ Don't | ✓ Do instead |
|---|---|
| Use rounded corners on buttons or cards | Keep `border-radius: 0` — hard edges are brand-defining |
| Use a different yellow (`#FFD700`, `orange`, etc.) | Always use `--bg-accent: #FFDD00` |
| Use League Gothic for body copy or UI labels | Reserve it for headings and display text only |
| Place white text on yellow | Use `var(--text-on-light)` (#202020) on yellow |
| Omit the header on a GEAR app | Every GEAR app must have the header — it's the trust anchor |
| Use a different logo file or recolour the mark | Use only the files in `/logo/` |
| Animate on every scroll event without `passive: true` | Always add `{ passive: true }` to scroll listeners |

---

*Last updated: May 2026 — GKIM Digital*
