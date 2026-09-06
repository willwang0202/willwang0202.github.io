# Techno motion implementation plan

**Goal:** Add coordinated Anime.js motion to the existing white techno portfolio while preserving its appearance, content and accessible navigation.

1. Baseline browser verification: establish missing motion controls and existing content/data behavior. Download and pin the official Anime.js 4.5.0 ESM bundle with its license.
2. Implement the shared optional loader, motion preference lifecycle, once-only viewport helper and animation cleanup. Migrate current reveals/counters/chart entrances to Anime.js without changing their data sources.
3. Add a short startup timeline, masked name, decorative ring layers and replay control. Gate only entrance content with a bounded failsafe. Skip startup for deep links and scroll restoration.
4. Add fine-pointer reticle, spring button/press feedback, bounded artwork parallax and card edge lights. Keep natural scrolling and native cursor/link semantics.
5. Browser verification: real pointer and keyboard input, rapid interruptions, resize, reduced motion both initially and dynamically, persisted toggle, no-JS and missing-library fallbacks. Check data correctness and console; inspect startup frames and resting screenshots. Fix issues and review the final diff.

Files: index.html; assets/css/motion.css; assets/js/{main,motion,reveal,counters,status,spans,contributions,intro,interactions}.js; assets/js/vendor/{anime-4.5.0.esm.min.js,anime-LICENSE.md}; this plan and its design spec. No file deletions.

User follow-up: added assets/js/globe.js and globe-geometry.js for the globe's axial 3D projection, and adjusted nav.js to clear the current-section marker when returning to the hero. Removed the weekday contribution panel, its renderer, and dedicated styles.

## Completed verification

- Baseline failed as expected because the motion preference control did not exist.
- Fine-pointer hover moves button faces up to 4px; presses compress to 0.94 and canceled gestures restore scale 1 and zero offset.
- Toggle survives reloads. Switching reduced motion on mid-intro reveals all content, removes reticle effects, and stops animation immediately.
- 320, 375, 414, 768 and 1440px layouts have no horizontal overflow. Touch anchor navigation works. Real touch events compress cards to 0.985 and cancellation restores them.
- No-JavaScript, missing-library and stalled-library cases reveal content. With a stalled animation download, the live clock remains functional. Deep-link content and keyboard skip navigation remain visible.
- Startup leaves the document root and header at full opacity without transforms. Instrument parallax, card lift and edge lighting verified with browser input.
- All four factual counters reach their markup values; degree text, fill and ARIA values agree. The contribution feed and charts load normally.
- Globe meridians change their projected paths while latitude paths and the layer's transform stay fixed. Offscreen/reduced-motion checks freeze geometry exactly; normal rotation resumes without resetting phase.
- Four geometry tests verify fixed poles, front-to-back travel through the horizon, a spherical surface, a closed full revolution, stationary latitude rings and changing meridians. Run with `node --test tests/globe-geometry.test.mjs`.
- Removed weekday panel has zero DOM nodes/text. The live activity heatmap still renders all 365 days and the four summary statistics.
- Independent code review completed; touch feedback and canceled-reticle findings corrected. No remaining findings in the globe review.
- Syntax checks, fragment/duplicate-ID checks and git diff whitespace checks pass. Preview recordings and screenshots are stored in ignored output/playwright/.
