# SSI Website Design System

> The single reference for building pages that are visually congruent with stevensonsystems.com.
> Every pattern below is extracted from the production codebase. When in doubt, match the existing site.

---

## Table of Contents

1. [Color Palette](#1-color-palette)
2. [Typography](#2-typography)
3. [Spacing & Layout](#3-spacing--layout)
4. [Border Radii](#4-border-radii)
5. [Shadows](#5-shadows)
6. [Borders & Dividers](#6-borders--dividers)
7. [Buttons & CTAs](#7-buttons--ctas)
8. [Cards](#8-cards)
9. [Section Patterns](#9-section-patterns)
10. [Eyebrow Labels](#10-eyebrow-labels)
11. [Reusable Components](#11-reusable-components)
12. [Animation & Motion](#12-animation--motion)
13. [Responsive Breakpoints](#13-responsive-breakpoints)
14. [Dark vs. Light Surfaces](#14-dark-vs-light-surfaces)
15. [Do / Don't Quick Reference](#15-do--dont-quick-reference)

---

## 1. Color Palette

### Brand Colors (CSS Variables)

| Token | Hex | Tailwind Class | Use |
|---|---|---|---|
| `--deep-purple` | `#473949` | `text-deep-purple`, `bg-deep-purple` | Primary brand color. Headings, buttons, accents. |
| `--purple-dark` | `#362B38` | `text-purple-dark`, `bg-purple-dark` | Hover/active states on purple elements. |
| `--purple-light` | `#5C4D5E` | `text-purple-light` | Lighter purple variant. |
| `--purple-glow` | `rgba(71,57,73,0.12)` | — | Translucent purple for background glows. |
| `--purple-pale` | `#F3EFF4` | `bg-purple-pale` | Very light purple for badges/highlights. |

### Neutral Colors

| Token | Hex | Tailwind Class | Use |
|---|---|---|---|
| `--black` | `#333333` | `text-ssi-black`, `bg-ssi-black` | Primary text on light backgrounds. |
| `--dark-gray` | `#585756` | `text-dark-gray` | Secondary body text. |
| `--medium-gray` | `#AEACAC` | `text-medium-gray` | Tertiary text, captions, placeholders. |
| `--light-gray` | `#E1E0E0` | `border-light-gray`, `bg-light-gray` | Borders, dividers on light backgrounds. |
| `--off-white` | `#F5F4F5` | `bg-off-white` | Alternating section backgrounds. |
| `--white` | `#FFFFFF` | `bg-white` | Primary light background. |

### Accent Colors (Teal Family)

| Hex | Use |
|---|---|
| `#0E85A7` | TruSpace product accent. Borders, icons, badges. |
| `#2BC4E8` | Bright cyan. Icons and highlights on dark backgrounds. |
| `#49A3BD` | Softer teal. CTAs, portfolio analysis tool accent. |
| `#3d8fa6` | Hover state for teal buttons. |

### Color on Dark Backgrounds (Opacity Scale)

Use white with opacity modifiers on dark (`--deep-purple`, `--black`, gradient) backgrounds:

| Opacity | Class | Use |
|---|---|---|
| 30-40% | `text-white/30`, `text-white/40` | Disabled, very muted |
| 50% | `text-white/50` | Tertiary labels |
| 60% | `text-white/60` | Secondary text, stat labels |
| 70% | `text-white/70` | Body text on dark |
| 80-90% | `text-white/80`, `text-white/90` | Primary text on dark |
| 100% | `text-white` | Headlines, emphasis |

### Color on Light Backgrounds

| Use | Class |
|---|---|
| Primary text | `text-ssi-black` |
| Secondary text | `text-dark-gray` |
| Tertiary/captions | `text-medium-gray` |
| Accent text | `text-[var(--deep-purple)]` |

---

## 2. Typography

### Font Families

| Token | Stack | Tailwind | Use |
|---|---|---|---|
| `--font-sans` | Maison Neue, Helvetica Neue, Arial | `font-sans` (default) | All body text. |
| `--font-heading` | New Rail Alphabet, Helvetica Neue, Arial | `font-heading` | Section headings (optional; most headings use font-sans). |
| `--font-mono` | SF Mono, Fira Code, Menlo | `font-[var(--font-mono)]` | Eyebrow labels, stats, code. |
| `--font-stat` | New Rail Alphabet, Space Grotesk, Helvetica Neue | `font-stat` | Large stat numbers. |

**Font Weights Available:**
- Maison Neue: 300 (light), 500 (medium)
- New Rail Alphabet: 500 (medium), 700 (bold)
- Space Grotesk: 500, 600

### Heading Scale (Fluid with clamp)

| Level | Clamp | Weight | Use |
|---|---|---|---|
| Hero headline | `text-[clamp(34px,4.5vw,58px)]` | `font-medium` or `font-light` | Page hero. One per page. |
| Section heading | `text-[clamp(26px,3.4vw,44px)]` | `font-medium` or `font-light` | Each major section. |
| Subsection heading | `text-[clamp(22px,2.4vw,32px)]` | `font-medium` | Within a section. |
| Card heading | `text-[17px]` to `text-[20px]` | `font-medium` | Card titles. |

All headings use `tracking-tight` and `leading-[1.06]` to `leading-[1.15]`.

### Body Text Scale

| Size | Use |
|---|---|
| `text-[18px]` or `text-[19px]` | Lead paragraph (first paragraph of a section). `font-light`. |
| `text-[16px]` or `text-[17px]` | Standard body copy. `font-light`. |
| `text-[15px]` | Content cards, list items. |
| `text-[14px]` | Descriptions, table cells, secondary content. |
| `text-[13px]` | Small labels, form hints, footer text. |
| `text-[12px]` | Stat labels, badge text. |
| `text-[11px]` | Eyebrow labels (always with `uppercase tracking-[0.14em]`). |

**Important:** Body text on the site uses `font-light` (300 weight) as the default. This is a defining characteristic of the SSI visual identity. Do not use `font-normal` (400) for body paragraphs.

---

## 3. Spacing & Layout

### CSS Spacing Tokens

| Token | Value | Use |
|---|---|---|
| `--space-xs` | `0.5rem` (8px) | Tight gaps between related elements. |
| `--space-sm` | `1rem` (16px) | Default element spacing. |
| `--space-md` | `2rem` (32px) | Spacing between groups. |
| `--space-lg` | `4rem` (64px) | Section internal padding. |
| `--space-xl` | `7rem` (112px) | Between major sections. |

### Page Container

```html
<div class="max-w-[var(--max-w)] mx-auto px-6">
  <!-- Content here -->
</div>
```

- `--max-w: 1200px` for all content.
- `px-6` (24px) horizontal padding on all sections.
- Center with `mx-auto`.

### Section Vertical Padding

| Section type | Padding |
|---|---|
| Standard section | `py-16 lg:py-24` |
| Compact section (logo strip) | `py-10 lg:py-14` |
| Hero section | `py-16 lg:py-32` |

### Common Grid Layouts

| Pattern | Class | Use |
|---|---|---|
| Two equal columns | `grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20` | Copy + visual side-by-side. |
| Text-heavy two column | `grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-20` | Heading sticky left, body right. |
| Three column cards | `grid grid-cols-1 md:grid-cols-3 gap-8` | Feature/benefit cards. |
| Four stat cells | `grid grid-cols-2 md:grid-cols-4` | Stat strips. |
| Content + sidebar | `grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-14` | Form + stats. |

---

## 4. Border Radii

| Token | Value | Tailwind | Use |
|---|---|---|---|
| `--radius-sm` | `6px` | `rounded-[var(--radius-sm)]` | Rarely used. Small inline elements. |
| `--radius-md` | `12px` | `rounded-[var(--radius-md)]` | **Primary radius.** Buttons, inputs, small cards, badges. |
| `--radius-lg` | `20px` | `rounded-[var(--radius-lg)]` | Large cards, modals, featured containers. |
| Full round | — | `rounded-full` | Badges, avatar circles, pill shapes. |
| 2xl fallback | 16px | `rounded-2xl` | Glass cards on dark backgrounds. |
| 3xl fallback | 24px | `rounded-3xl` | Form container wrappers. |

### When to Use Each

- **Buttons:** `rounded-[var(--radius-md)]` (12px). Always.
- **Form inputs:** `rounded-xl` (12px).
- **Content cards on light bg:** `rounded-[var(--radius-lg)]` (20px) or `rounded-2xl` (16px).
- **Glass cards on dark bg:** `rounded-2xl` (16px).
- **Outer form wrappers:** `rounded-3xl` (24px).
- **Badges and pills:** `rounded-full`.

---

## 5. Shadows

### CSS Shadow Tokens

| Token | Value | Use |
|---|---|---|
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)` | Subtle. Small cards, table borders. |
| `--shadow-md` | `0 4px 16px rgba(0,0,0,0.07), 0 2px 8px rgba(0,0,0,0.04)` | Standard cards. |
| `--shadow-lg` | `0 12px 40px rgba(0,0,0,0.09), 0 4px 16px rgba(0,0,0,0.05)` | Elevated modals, featured cards. |
| `--shadow-purple` | `0 8px 32px rgba(71,57,73,0.20)` | Purple-tinted accent shadow. |

### Common Inline Shadows

| Shadow | Use |
|---|---|
| `shadow-[0_2px_20px_rgba(0,0,0,0.06)]` | Light-bg cards at rest. |
| `shadow-[0_10px_30px_rgba(0,0,0,0.10)]` | Light-bg cards on hover. |
| `shadow-[0_8px_32px_rgba(0,0,0,0.2)]` | Standard elevation on dark. |
| `shadow-[0_24px_64px_rgba(0,0,0,0.25)]` | Glass cards, featured elements. |
| `shadow-[0_32px_80px_rgba(0,0,0,0.3)]` | Hero form cards, maximum elevation. |
| `shadow-[0_8px_32px_rgba(71,57,73,0.3)]` | Purple-tinted, for buttons on dark. |

### Shadow on Hover

Cards on light backgrounds typically add `hover:shadow-[0_10px_30px_rgba(0,0,0,0.10)]` with `hover:-translate-y-1` for a lift effect.

---

## 6. Borders & Dividers

### On Light Backgrounds

| Element | Class |
|---|---|
| Card border | `border border-[var(--light-gray)]` or `border border-black/[0.06]` |
| Section divider | `border-b border-[var(--light-gray)]` |
| Table rows | `divide-y divide-[var(--light-gray)]` |
| Hover: brighter border | `hover:border-[#0E85A7]/30` or `hover:border-[var(--deep-purple)]/40` |

### On Dark Backgrounds

| Element | Class |
|---|---|
| Card border | `border border-white/15` or `border border-white/[0.12]` |
| Subtle border | `border border-white/[0.08]` |
| Stat cell divider | `border-r border-white/[0.06]` |
| Hover: brighter border | `hover:border-white/25` or `hover:border-[#0E85A7]/50` |

### Dashed Borders

Used sparingly for placeholder/upload zones: `border-2 border-dashed border-white/15`.

---

## 7. Buttons & CTAs

### Primary Button (on dark backgrounds)

White button with deep-purple text. The most common CTA.

```html
<a
  href="#target"
  class="inline-flex items-center gap-2 text-base font-medium text-[var(--deep-purple)] bg-white px-7 py-3.5 rounded-[var(--radius-md)] hover:bg-white/90 transition-all duration-200 hover:-translate-y-0.5 shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
>
  Button Text
  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
</a>
```

### Primary Button (on light backgrounds)

Deep-purple background with white text.

```html
<a
  href="#target"
  class="inline-flex items-center justify-center gap-2 text-base font-medium text-white bg-[var(--deep-purple)] px-8 py-4 rounded-[var(--radius-md)] hover:bg-[var(--purple-dark)] transition-all duration-200 hover:-translate-y-0.5 shadow-[var(--shadow-purple)]"
>
  Button Text
  <svg class="w-4 h-4" ...>...</svg>
</a>
```

### Secondary / Teal Button

```html
<a class="inline-flex items-center gap-2 text-base font-medium text-white bg-[#49A3BD] px-6 py-3 rounded-[var(--radius-md)] hover:bg-[#3d8fa6] transition-all duration-200 hover:-translate-y-0.5">
  Button Text
</a>
```

### Ghost / Border Button

```html
<a class="inline-flex items-center gap-2 text-[13px] font-medium text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/35 px-5 py-2.5 rounded-[var(--radius-md)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5">
  Button Text
</a>
```

### Button Sizing

| Size | Padding | Font Size |
|---|---|---|
| Small | `px-5 py-2.5` | `text-[13px]` |
| Medium | `px-6 py-3` | `text-base` |
| Large | `px-7 py-3.5` or `px-8 py-4` | `text-base` |

### Button Rules

- Always include `transition-all duration-200`.
- Always include `hover:-translate-y-0.5` for lift on hover.
- Always use `rounded-[var(--radius-md)]` (12px).
- Arrow icons are `w-4 h-4`, placed after text with `gap-2`.
- Full-width on mobile: add `w-full sm:w-auto`.

---

## 8. Cards

### Card Type 1: Light Background Card

For use on white or off-white sections. The most common card pattern.

```html
<div class="bg-white border border-black/[0.06] rounded-2xl p-8 h-full shadow-[0_2px_20px_rgba(0,0,0,0.06)] hover:border-[#0E85A7]/30 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.10)] transition-all duration-300">
  <div class="w-12 h-12 rounded-xl bg-[var(--deep-purple)]/10 flex items-center justify-center text-[var(--deep-purple)] mb-5">
    <!-- Icon SVG -->
  </div>
  <h3 class="text-[17px] font-medium text-ssi-black mb-3">Card Title</h3>
  <p class="text-[14px] text-dark-gray leading-relaxed">Card description text.</p>
</div>
```

**Variants:**
- On off-white bg: change card bg to `bg-[var(--off-white)]`.
- Without hover: remove hover classes (for static/info cards).
- With border accent on hover: `hover:border-[#0E85A7]/30` (teal) or `hover:border-[var(--deep-purple)]/40` (purple).

### Card Type 2: Glass Card (Dark Background)

For use on deep-purple, gradient, or image-overlay sections.

```html
<div class="relative bg-white/[0.06] backdrop-blur-xl rounded-2xl border border-white/15 shadow-[0_24px_64px_rgba(0,0,0,0.25)] p-7 overflow-hidden">
  <!-- Subtle top gradient highlight -->
  <div
    aria-hidden="true"
    class="absolute inset-0 rounded-2xl pointer-events-none"
    style="background: linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 40%)"
  />
  <div class="relative">
    <div class="w-12 h-12 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white mb-5">
      <!-- Icon SVG -->
    </div>
    <h3 class="text-[17px] font-medium text-white mb-3">Card Title</h3>
    <p class="text-[14px] text-white/70 leading-relaxed">Card description.</p>
  </div>
</div>
```

**Key elements:**
- `backdrop-blur-xl` for frosted glass effect.
- Inner gradient overlay (the `aria-hidden` div) for top-edge highlight.
- All text uses white with opacity modifiers.

### Card Type 3: Stat/KPI Card

For displaying large numbers. Used in stat strips and hero sections.

```html
<div class="bg-[#473949]/40 px-6 py-6 sm:px-8 sm:py-8 text-center">
  <div class="font-['Helvetica_Neue',Helvetica,Arial,sans-serif] text-[clamp(28px,3.2vw,40px)] font-semibold text-white tracking-tighter leading-none mb-1.5">
    735
  </div>
  <div class="text-[11px] sm:text-[13px] text-white/60 tracking-wide">
    Healthcare buildings measured
  </div>
</div>
```

### Card Type 4: Table Card

Tables wrapped in a card container.

```html
<div class="bg-white rounded-xl border border-[var(--light-gray)] overflow-hidden shadow-sm">
  <table class="w-full text-left">
    <thead>
      <tr class="border-b border-[var(--light-gray)] bg-[var(--off-white)]">
        <th class="px-6 py-4 text-[11px] font-medium text-medium-gray uppercase tracking-wider font-[var(--font-mono)]">
          Column Header
        </th>
      </tr>
    </thead>
    <tbody class="divide-y divide-[var(--light-gray)]">
      <tr class="hover:bg-[var(--off-white)]/50 transition-colors">
        <td class="px-6 py-4 text-[14px] text-ssi-black">Cell content</td>
      </tr>
    </tbody>
  </table>
</div>
```

### Card Type 5: Form Card

Glass-wrapped form container.

```html
<div class="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/15 p-3 shadow-[0_32px_80px_rgba(0,0,0,0.3)]">
  <div class="bg-white rounded-2xl p-6 sm:p-10">
    <!-- Form content -->
  </div>
</div>
```

On light backgrounds, swap the outer container:

```html
<div class="rounded-3xl bg-white/10 backdrop-blur-xl border border-[#E1E0E0] p-3 shadow-[0_8px_40px_rgba(71,57,73,0.1)]">
  <div class="bg-white rounded-2xl p-6 sm:p-10">
    <!-- Form content -->
  </div>
</div>
```

### Card Type 6: Pull Quote / Testimonial

```html
<div class="bg-[var(--off-white)] border-l-4 border-[var(--deep-purple)] rounded-r-lg p-6">
  <p class="text-[16px] italic text-ssi-black leading-relaxed">
    "Quote text goes here."
  </p>
</div>
```

Or as a full-width statement strip (see Section Patterns below).

---

## 9. Section Patterns

### Pattern 1: Hero Section

Dark background with optional image, gradient overlay, and grid texture.

```html
<section
  class="relative px-6 py-16 lg:py-32 overflow-hidden"
  style="background-image: url(/images/skyline-panoramic.jpg); background-size: cover; background-position: center"
>
  <!-- Tinted overlay -->
  <div class="absolute inset-0 bg-[#362B38]/85 backdrop-blur-[6px]" />

  <div class="max-w-[var(--max-w)] mx-auto relative z-[1]">
    <!-- Hero content here -->
  </div>
</section>
```

**Without image** (gradient only):

```html
<section
  class="relative px-6 py-16 lg:py-32 overflow-hidden"
  style="background: linear-gradient(135deg, #2A1F2E 0%, #362B38 40%, #473949 100%)"
>
  <!-- Optional grid texture overlay -->
  <div
    class="absolute inset-0 opacity-[0.04]"
    style="background-image: linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px); background-size: 40px 40px"
  />
  ...
</section>
```

### Pattern 2: White Content Section

```html
<section class="bg-white py-16 lg:py-24 px-6">
  <div class="max-w-[var(--max-w)] mx-auto">
    <!-- Two-column layout, card grid, etc. -->
  </div>
</section>
```

### Pattern 3: Off-White Content Section

Alternates with white sections for visual rhythm.

```html
<section class="bg-[var(--off-white)] py-16 lg:py-24 px-6">
  <div class="max-w-[var(--max-w)] mx-auto">
    <!-- Content -->
  </div>
</section>
```

### Pattern 4: Deep Purple Section

Solid brand color with grid texture overlay.

```html
<section class="relative bg-[var(--deep-purple)] py-16 lg:py-24 px-6 overflow-hidden">
  <div
    aria-hidden="true"
    class="absolute inset-0 opacity-[0.06] pointer-events-none"
    style="background-image: linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px); background-size: 48px 48px"
  />
  <div class="max-w-[var(--max-w)] mx-auto relative z-[1]">
    <!-- Content with white text -->
  </div>
</section>
```

### Pattern 5: Full-Width Statement / Quote Strip

Large centered text over a tinted background image.

```html
<section
  class="relative px-6 py-16 lg:py-24 overflow-hidden bg-cover bg-center"
  style="background-image: url(/images/impact-photo.jpg)"
>
  <div class="absolute inset-0 bg-[var(--deep-purple)]/85 backdrop-blur-[8px]" />
  <div class="max-w-[960px] mx-auto text-center relative z-[1]">
    <p class="font-medium text-[clamp(22px,2.6vw,34px)] leading-[1.25] tracking-tight text-white">
      Quote or statement text here.
    </p>
  </div>
</section>
```

### Pattern 6: Client Logo Strip

```html
<section class="bg-white py-10 lg:py-14 px-6 border-b border-[var(--light-gray)]">
  <p class="text-center font-[var(--font-mono)] text-[11px] font-medium tracking-[0.18em] uppercase text-medium-gray mb-7">
    Trusted by industry leaders
  </p>
  <ClientCarousel />
</section>
```

### Pattern 7: CTA Section

```html
<section class="bg-[var(--off-white)] py-14 lg:py-20 px-6 text-center">
  <h2 class="font-light text-[clamp(26px,3.5vw,42px)] tracking-tight text-ssi-black mb-4">
    Heading text here
  </h2>
  <p class="text-[16px] font-light text-ssi-black max-w-[460px] mx-auto mb-8">
    Supporting paragraph.
  </p>
  <a href="#lp-form" class="inline-flex items-center justify-center gap-2 text-base font-medium text-white bg-[var(--deep-purple)] px-8 py-4 rounded-[var(--radius-md)] hover:bg-[var(--purple-dark)] transition-all duration-200 hover:-translate-y-0.5 shadow-[var(--shadow-purple)]">
    CTA Text
  </a>
</section>
```

### Section Ordering Convention

Sections alternate backgrounds for visual rhythm:
1. Hero (dark) or Logo strip (white with border)
2. White section
3. Off-white or dark accent section
4. White section
5. Deep purple or image-overlay section
6. CTA section (off-white)

Never stack two white sections or two dark sections consecutively.

---

## 10. Eyebrow Labels

The monospaced uppercase label that appears above most section headings. This is one of the most distinctive SSI design elements.

### Standard Eyebrow (on light backgrounds)

```html
<p class="font-[var(--font-mono)] text-[11px] font-medium tracking-[0.14em] uppercase text-[var(--deep-purple)]/70 mb-4">
  Section label
</p>
```

### Eyebrow with Lines (centered)

```html
<div class="inline-flex items-center gap-3 mb-4">
  <span class="inline-block w-8 h-px bg-[var(--deep-purple)]/60" />
  <span class="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--deep-purple)]/80">
    Section label
  </span>
  <span class="inline-block w-8 h-px bg-[var(--deep-purple)]/60" />
</div>
```

### Eyebrow on Dark Backgrounds

```html
<div class="inline-flex items-center gap-3 mb-4">
  <span class="inline-block w-8 h-px bg-white/70" />
  <span class="text-[11px] font-medium uppercase tracking-[0.18em] text-white/80">
    Section label
  </span>
  <span class="inline-block w-8 h-px bg-white/70" />
</div>
```

### Pill-Style Eyebrow

```html
<div class="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white/80 font-[var(--font-mono)] text-[11px] font-medium tracking-[0.10em] uppercase px-3.5 py-1.5 rounded-full mb-8">
  <span class="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
  Label Text
</div>
```

---

## 11. Reusable Components

### `<FadeIn>`

Scroll-triggered fade + vertical translate animation.

```tsx
import { FadeIn } from "@/components/FadeIn";

<FadeIn delay={120}>
  <div>Content animates in on scroll</div>
</FadeIn>
```

**Props:**
- `children` — Content to animate.
- `className` — Additional classes.
- `delay` — Milliseconds before animation starts (default: 0). Use 80-120ms increments for staggered reveals.

### `<WipeReveal>`

Directional wipe/reveal animation.

```tsx
<WipeReveal direction="left" duration={0.6} color="#473949">
  <h2>Revealed heading</h2>
</WipeReveal>
```

### `<ClientCarousel>`

Infinite-scrolling client logo strip. No props needed.

```tsx
<ClientCarousel />
```

### `<HubSpotForm>`

Embedded HubSpot form via iframe.

```tsx
<HubSpotForm formId="02760ee9-1167-4edc-b1e7-b1313d074cc7" />
```

### `<HubSpotMeetings>`

Embedded HubSpot meeting scheduler.

```tsx
<HubSpotMeetings url="https://meetings-na2.hubspot.com/brandon-hatch" />
```

### `<FormScheduleToggle>`

Tabbed toggle between a form and a meetings widget.

```tsx
<FormScheduleToggle
  formId="02760ee9-..."
  meetingsUrl="https://meetings-na2.hubspot.com/brandon-hatch"
  formLabel="Send a message"
  scheduleLabel="Schedule a call"
/>
```

### `<TiltCard>`

Mouse-tracking 3D tilt effect wrapper.

```tsx
<TiltCard className="...">
  <div>Card content tilts on hover</div>
</TiltCard>
```

### `<SmoothScrollLink>`

Smooth-scrolling anchor link.

```tsx
<SmoothScrollLink href="#lp-form" className="...">
  Scroll to form
</SmoothScrollLink>
```

---

## 12. Animation & Motion

### Standard Transition

All interactive elements: `transition-all duration-200` or `duration-300`.

### Hover Lift

```css
hover:-translate-y-0.5   /* Buttons: subtle lift */
hover:-translate-y-1      /* Cards: more pronounced lift */
```

### Staggered FadeIn

Use `<FadeIn>` with incremental delays:

```tsx
{items.map((item, i) => (
  <FadeIn key={item.id} delay={i * 100}>
    <Card>{item}</Card>
  </FadeIn>
))}
```

### Custom Keyframes Available

| Animation | Class | Use |
|---|---|---|
| Carousel scroll | `animate-[carousel-scroll_50s_linear_infinite]` | Logo strips |
| Fade in | `animate-[fadeIn_0.3s_ease-out]` | Content reveals |
| Card pulse | `animate-[cardPulse_3s_ease-in-out_infinite]` | Attention-drawing cards |
| Purple pulse | `animate-[purplePulse_2s_ease-in-out_infinite]` | Glowing accent |
| Shimmer | `animate-[shimmer_3s_ease-in-out_infinite]` | Loading/attention states |

### Motion Preferences

All animations respect `prefers-reduced-motion`. The `<FadeIn>` component handles this automatically.

---

## 13. Responsive Breakpoints

SSI uses Tailwind's default breakpoints. The primary breakpoint is `lg` (1024px).

| Breakpoint | Width | Use |
|---|---|---|
| `sm` | 640px | Minor adjustments (padding, font size bumps). |
| `md` | 768px | Grid collapse (3-col to 1-col), table to card view. |
| `lg` | 1024px | **Primary breakpoint.** Nav collapse, 2-col layouts, hero structure. |
| `xl` | 1280px | Rarely used. Minor spacing. |

### Key Responsive Patterns

- **Navigation:** Full menu at `lg`, hamburger below `lg`.
- **Two-column layouts:** `grid-cols-1 lg:grid-cols-2`.
- **Three-column cards:** `grid-cols-1 md:grid-cols-3`.
- **Stat strips:** `grid-cols-2 md:grid-cols-4`.
- **Hero padding:** `py-16 lg:py-32`.
- **Section padding:** `py-16 lg:py-24`.
- **Card padding:** `p-6 sm:p-8` or `p-6 sm:p-10`.

### Mobile-Specific Patterns

- Tables become stacked cards: `hidden md:block` for table, `md:hidden` for card version.
- Timeline layouts switch from horizontal (`hidden lg:block`) to vertical (`lg:hidden`).
- Full-width buttons: `w-full sm:w-auto`.

---

## 14. Dark vs. Light Surfaces

### Quick Reference

| Property | Light Surface | Dark Surface |
|---|---|---|
| Section background | `bg-white` or `bg-[var(--off-white)]` | `bg-[var(--deep-purple)]` or gradient/image overlay |
| Primary text | `text-ssi-black` | `text-white` |
| Secondary text | `text-dark-gray` | `text-white/70` |
| Tertiary text | `text-medium-gray` | `text-white/50` to `text-white/60` |
| Card background | `bg-white` | `bg-white/[0.06] backdrop-blur-xl` |
| Card border | `border border-black/[0.06]` or `border-[var(--light-gray)]` | `border border-white/15` |
| Icon container bg | `bg-[var(--deep-purple)]/10` | `bg-white/10` |
| Icon color | `text-[var(--deep-purple)]` | `text-white` |
| Dividers | `border-[var(--light-gray)]` | `border-white/[0.06]` to `border-white/10` |
| Button (primary) | `bg-[var(--deep-purple)] text-white` | `bg-white text-[var(--deep-purple)]` |
| Eyebrow label | `text-[var(--deep-purple)]/70` | `text-white/80` |
| Shadow | `shadow-[0_2px_20px_rgba(0,0,0,0.06)]` | `shadow-[0_24px_64px_rgba(0,0,0,0.25)]` |

---

## 15. Do / Don't Quick Reference

### Do

- Use `font-light` (300) for body paragraphs.
- Use `tracking-tight` on all headings.
- Use `leading-relaxed` on body text.
- Use `rounded-[var(--radius-md)]` (12px) for buttons and inputs.
- Use `max-w-[var(--max-w)]` for content containers.
- Alternate section backgrounds (white, off-white, dark).
- Add `<FadeIn>` to every above-the-fold section and stagger with `delay`.
- Use the eyebrow label pattern above every section heading.
- Include hover lift (`hover:-translate-y-0.5`) on all buttons.
- Use `font-[var(--font-mono)]` for stat labels and eyebrows.
- Use `tabular-nums` on any numeric data.

### Don't

- Don't use `font-normal` (400) for body text. SSI body text is always light (300) or medium (500).
- Don't use hard pixel font sizes for headings. Use `clamp()` for fluid scaling.
- Don't use `rounded-lg` (8px) or `rounded-md` (6px) for cards. Use `rounded-2xl` (16px) or `rounded-[var(--radius-lg)]` (20px).
- Don't stack two consecutive sections with the same background color.
- Don't use generic Tailwind shadows (`shadow-md`, `shadow-lg`). Use the custom shadow values above.
- Don't use `font-bold` for body text. Reserve bold (`font-semibold` or `font-bold`) for stat numbers only.
- Don't use colors outside the palette. No blues, reds, or greens except for semantic indicators (green for positive metrics, red for errors).
- Don't forget `px-6` on sections. All sections need horizontal padding.
- Don't use em dashes in copy. SSI Voice DNA prohibits them.
- Don't exceed `--max-w` (1200px) for content width.

---

## Form Input Styling

All form inputs follow this pattern:

```html
<input
  class="w-full rounded-xl bg-white/80 backdrop-blur-md border border-[var(--deep-purple)]/20 px-4 py-3 text-[15px] text-ssi-black placeholder:text-medium-gray/70 shadow-[inset_0_1px_2px_rgba(71,57,73,0.06)] transition-all duration-200 focus:outline-none focus:bg-white focus:border-[var(--deep-purple)]/50 focus:shadow-[0_0_0_4px_rgba(71,57,73,0.1)]"
/>
```

**Form labels:**

```html
<label class="block text-[12px] font-semibold uppercase tracking-[0.12em] text-ssi-black mb-2">
  Label Text
</label>
```

---

## Icon Guidelines

- **Size:** `w-5 h-5` (20px) for inline icons, `w-6 h-6` (24px) for card icons.
- **Style:** Outline/stroke only. No filled icons. `stroke-width={1.5}` or `{1.8}`.
- **Color:** Inherits from parent text color. Use `currentColor` for stroke.
- **Container:** When placed in cards, wrap in a colored circle:
  - Light bg: `w-12 h-12 rounded-xl bg-[var(--deep-purple)]/10 flex items-center justify-center`
  - Dark bg: `w-12 h-12 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center`
- **Source:** Heroicons (outline set). `@heroicons/react/24/outline` or inline SVG.

---

*Last updated: 2026-05-06. Generated from the production stevensonsystems.com codebase.*
