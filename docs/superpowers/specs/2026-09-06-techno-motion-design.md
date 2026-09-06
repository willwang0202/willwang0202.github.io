# White techno motion

Keep the approved visual design and factual content. Add a coordinated, non-blocking startup and responsive physical feedback using Anime.js 4.5.0, served locally under its MIT license.

## Direction

The identity enters in two masked lines while the instrument resolves from a slight offset. Fine overlay arcs sweep into alignment once. Supporting copy and readouts follow in a short stagger. The sequence finishes in about 1.3 seconds; navigation remains available throughout. Deep links and restored scroll positions skip startup. A footer replay control makes the sequence available on request.

Buttons move only a few pixels toward a fine pointer, compress on press, and settle with a restrained spring. The instrument has gentle pointer parallax and separately moving overlay arcs. A thin reticle follows the native cursor, expands over links, and disappears during keyboard use or outside the document. Cards use a small lift and moving edge light. Coarse pointers get press feedback without hover/parallax. Sections reveal once, charts sweep when actually in view.

All effects honor the operating system's reduced-motion preference and a persistent site toggle. Turning motion off mid-animation releases all content and resets transforms. No scroll interception, navigation delays, fabricated loading percentages, full-screen blocking intro, or sound.

The hero globe turns around a fixed, tilted north/south axis once every 48 seconds. Its meridians are projected from a 3D sphere each frame, changing shape and passing behind its edge; latitude rings and poles remain fixed. Near and far strokes retain the original SVG's different ink strengths. The outer instrument labels, reticles and shell remain fixed. Motion pauses outside the viewport, in a hidden tab, when disabled, or under reduced motion. The original SVG is upgraded to inline SVG only when needed, retaining the complete static image as the no-JavaScript/network-failure fallback.

The user requested removal of the Commits by weekday panel. Remove its markup, aggregation/rendering code and dedicated CSS; retain the activity summary statistics and heatmap, including the heatmap's weekday axis labels.

## References

- Julian Garnier: https://animejs.com/ — synchronized timelines, stagger, spring easing.
- Josh W. Comeau: https://www.joshwcomeau.com/animation/css-transitions/ — tactile hover transitions with stable interaction targets.
- Emil Kowalski: https://www.hackdesign.org/lessons/great-animations/ — immediate feedback and restrained, natural motion.

## Implementation

Replace the optional remote Motion runtime with one local Anime.js runtime in assets/js/motion.js. Update reveal, counters, status, spans, and contributions to its native API, keeping data behavior intact. Add intro.js, interactions.js and motion.css. Small index.html markup changes provide title masks, decorative instrument layers and footer controls. The original SVG remains unchanged.

globe-geometry.js owns the spherical coordinates, fixed camera projection and horizon splitting; globe.js owns the SVG upgrade and visible-only animation lifecycle. Latitude strokes are projected once, and only two meridian paths are updated per frame. contributions.js no longer needs animation code after removing the weekday bars.

## Verification

Verify startup/replay, rapidly interrupted hover/press, pointer exit and cancellation, keyboard navigation, anchor destinations, dynamic reduced motion, saved preference, touch input, local runtime failure, no JavaScript, chart values, and responsive layouts at 320/375/414/768/1440px. Capture the startup in frames and inspect the final resting visual.
