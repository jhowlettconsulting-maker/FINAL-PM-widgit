# SSI Landing Page Sandbox

A self-contained Next.js project for building a single landing page for
Stevenson Systems. Edit one file, preview it locally, send it back.

---

## Quick start

```bash
npm install
npm run dev
```

Then open http://localhost:3000 — click through to your page at
http://localhost:3000/lp/new-page.

---

## What to edit

Your work file is `src/app/lp/new-page/page.tsx`. The rest of the
project mirrors SSI's production environment so the page renders the
way it will once integrated.

When the page is complete, send the `page.tsx` file back and SSI will
integrate it. If you'd like to suggest additional components or assets
along the way, just include those notes with the handoff.

---

## Live site for design reference

The best way to match the SSI look is to study the existing landing
pages. Open these in your browser:

- https://stevensonsystems.com — main site, full design language
- https://stevensonsystems.com/lp/measurement-review — long-form LP with stats, table, testimonials
- https://stevensonsystems.com/lp/truspace-demo — product demo LP
- https://stevensonsystems.com/lp/proximity-to-revenue — case-study driven LP
- https://stevensonsystems.com/lp/medical-office-buildings — vertical-specific LP

Use whatever feels closest to the page you're building as your visual
template.

---

## Brand system

Full brand guide is in **DESIGN.md** at the project root. The short version:

### Colors (use as Tailwind arbitrary values)

| Variable              | Hex     | Use                            |
| --------------------- | ------- | ------------------------------ |
| `--deep-purple`       | #473949 | Primary brand color, headlines, CTAs |
| `--purple-dark`       | #362B38 | CTA hover, dark accents        |
| `--purple-pale`       | #F3EFF4 | Section backgrounds            |
| `--off-white`         | #F5F4F5 | Page backgrounds               |
| `--dark-gray`         | #585756 | Body text                      |
| `--medium-gray`       | #AEACAC | Secondary text, borders        |
| `--light-gray`        | #E1E0E0 | Dividers, subtle backgrounds   |

Example: `className="bg-[var(--deep-purple)] text-white"`

### Fonts

- **Headings** — `New Rail Alphabet` (auto-applied via `font-heading`)
- **Body** — `Maison Neue` (default sans)
- **Stats / large numbers** — `--font-stat`

Both fonts are already loaded from `public/fonts/`.

### Spacing & radii

- `--max-w: 1200px` — content max width
- `--radius-sm: 6px`, `--radius-md: 12px`, `--radius-lg: 20px`

---

## Helpers available

Two components are pre-imported in the starter `page.tsx`:

- **`<FadeIn>`** — wrap any block to fade + slide it up when scrolled into view.
- **`<HubSpotForm />`** — placeholder for the lead-capture form. Just drop it
  where you want the form to appear. SSI will swap in the real form
  during integration.

The header in `lp/layout.tsx` has a CTA button that scrolls to
`id="lp-form"`. Keep that id on your form section so the CTA works.

---

## Project guidelines

- **Styling.** Tailwind utilities and the helpers above cover everything you'll need — no additional packages required.
- **Single-file handoff.** Build sections inline in `page.tsx` so the deliverable stays one file.
- **Static rendering.** Pages should render without client-side data fetching or external API calls.
- **Mobile-first.** Test at 375px width and 1200px+ before sending the page back.
- **Accessibility.** Use semantic headings (`<h1>`/`<h2>`/etc.), real buttons and links, and alt text on every image.

---

## Using AI assistants effectively

If you're using Cursor, Claude Code, GitHub Copilot, v0, or another AI
tool to help build this page, here's a prompt template that gives it
the right context:

> I'm building a landing page for Stevenson Systems (a commercial-real-estate
> measurement firm). The page lives at `src/app/lp/new-page/page.tsx` in a
> Next.js 16 + Tailwind 4 project.
>
> Brand: deep purple (`var(--deep-purple)` = #473949), off-white backgrounds,
> serif-feeling headings via `font-heading` (New Rail Alphabet), body in
> Maison Neue. CTAs are deep-purple buttons with `rounded-[var(--radius-md)]`.
>
> Helpers I can use: `<FadeIn>` (scroll-triggered animation wrapper) and
> `<HubSpotForm />` (lead form placeholder). No other components, no new npm
> packages.
>
> Reference design: https://stevensonsystems.com/lp/measurement-review
>
> Build me a [hero section / feature grid / stat row / etc.] for [topic].

The more context you give the AI about which live page you're matching
visually, the better the output.

---

## Sending it back

When the page is done:

1. Make sure `npm run dev` renders cleanly with no console errors.
2. Test at mobile width (375px) and desktop (1200px+).
3. Send `src/app/lp/new-page/page.tsx` to SSI.
4. Note any assets you'd like added to `public/images/` (send the image files separately).

That's the whole handoff.
