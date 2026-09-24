# Nothing-inspired profile overhaul

The user requested a complete Nothing OS-inspired redesign while preserving all profile details and providing a local preview. The site remains static HTML, CSS, and small JavaScript modules; no build step or framework is required.

## Visual direction

Use soft white (#f5f5f3), white (#ffffff), charcoal (#191919), muted grey (#62625e), separators (#ddddd8), and signal red (#d8271c). Following the user’s typography revision, solid Manrope replaces the dot-matrix lettering throughout: semibold for the name, numeric readouts, and closing invitation, and regular for profile content; IBM Plex Mono sets small metadata. All fonts are served locally with their licenses.

A custom static CW glyph references Nothing's dot matrices and physical product details. The rest of the page uses generous whitespace, restrained dividers, a compact education/time strip, chronological experience rows, one featured project, four supporting projects, six skill domains, a dark contribution calendar, and five contact destinations. No repeating decorative animation or content visibility gates.

## Content and behavior

Preserve all four role descriptions, dates and organizations; five projects and their descriptions, iM features and technology stack (Next.js, Supabase, PostgreSQL, Drizzle, Vercel); six skill domains and every technology; education dates; both training/certification items; languages and all external links. Keep the San Diego clock, elapsed degree timeline, active section navigation, and live GitHub contributions. If the activity request fails or exceeds ten seconds, show an explicit unavailable message and keep the GitHub profile link accessible.

## Responsive and accessible behavior

Use single-column reading layouts on phones, a two-row navigation header, visible focus styles, semantic landmarks, a skip link, native anchor navigation, and reduced-motion-aware smooth scrolling. The contribution calendar scrolls within its own keyboard-focusable region on narrow screens. Core profile content is visible without JavaScript.

## Verification

Compare original and revised substantive content and link destinations. Verify unique IDs and anchor targets, JavaScript syntax, local fonts, browser console, live contribution rendering, and desktop/mobile layouts at representative widths. Start the local HTTP preview bound only to 127.0.0.1.

## Recruiter-focused revision

At the user’s request, remove the iM component, language, migration, and character counts. Replace the metrics area with a concise technology stack and consolidate the redundant stack/hosting footer.

## Product-focused iM copy

The user requested plain-language product copy grounded in `/Users/edu/Code/iM-System/README.md`, `docs/DESIGN.md`, and `docs/AMBIENT.md`. The description explains Cytus II as a rhythm game and iM as a live fan community. Five feature points now cover public discussions, private/group messaging, profiles and notifications, community moderation, and a multilingual game-inspired interface. Remove the legacy-project history and implementation-level bullet points; retain the separate technology stack. Draft search/follow plans are not presented as shipped features.
