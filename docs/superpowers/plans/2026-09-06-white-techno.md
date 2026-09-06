# White techno implementation plan

**Goal:** Overhaul the portfolio with the supplied white futuristic instrument design language.

**Architecture:** Keep the static site and independent behavior modules. Add a scoped visual layer and original SVG artwork; restructure hero and featured work while retaining data hooks and section anchors.

**Tech stack:** HTML, CSS custom properties, SVG, existing ES modules; Playwright for browser verification.

- [x] Record current content and behavior contracts; preserve links and data hooks.
- [x] Create tokens.css with the cool white/orange palette, display typography, depth, and responsive spacing.
- [x] Update index.html: instrument hero, readout strip, project schematic, contact heading, stylesheet links.
- [x] Create assets/instrument.svg and assets/css/techno.css; update favicon.
- [x] Visually inspect desktop and 320/375/414/768 layouts. Verify focus, anchors, clock/progress, charts, reduced motion, and no-JS fallback.
- [x] Review diff and deliver a local browser preview with verification notes.

## Verification results

- Chromium inspected at 320, 375, 414, 768, and 1440 CSS pixels; document width matched viewport at every size with no overflowing content panels.
- Original instrument loaded at all sizes; mobile project metrics use readable two-column grouping.
- All header anchors and contact CTA reach headings below the sticky header. Keyboard skip link and visible focus checked.
- Pacific clock updates; degree timeline text, ARIA value, and fill agree. Experience duration panel renders.
- Live contribution feed renders 365 days and weekday totals. Simulated HTTP 503 reports unavailable statistics and hides the weekday panel.
- Blocked animation CDN leaves all content visible; clock and progress remain functional.
- JavaScript-disabled mobile context displays all six main headings with no hidden content or page overflow.
- Reduced-motion context reports no running animations and no hidden reveal content.
- Browser console initially reported zero errors/warnings; independent static review found no remaining significant findings.
- HTML structure, preserved hooks/destinations, SVG XML, and git diff whitespace checks passed.

Preview: http://127.0.0.1:4173. Screenshots are stored in ignored output/playwright/. Changes are local and uncommitted.
