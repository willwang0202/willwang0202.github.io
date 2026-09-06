import { motionEnabled, onMotionChange } from './motion.js';
import { createWireframe, projectWireframe } from './globe-geometry.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const REVOLUTION_MS = 48000;

/** Reproject longitude around a fixed 3D axis, keeping the instrument frame still. */
export function initGlobeSpin() {
  const plate = document.querySelector('.instrument-plate');
  const image = plate?.querySelector('img');
  if (!plate || !image) return;
  let visible = false;
  let suspended = false;
  let pending;
  let render;
  let frame = 0;
  let previousTime = null;
  let angle = 0;

  const shouldRun = () => visible && !suspended && !document.hidden && motionEnabled();

  async function upgrade() {
    if (!pending) {
      pending = fetch(image.src).then((response) => {
        if (!response.ok) throw new Error('Instrument unavailable');
        return response.text();
      }).then((source) => {
        const parsed = new DOMParser().parseFromString(source, 'image/svg+xml');
        if (parsed.documentElement.tagName !== 'svg') return;
        const vector = document.importNode(parsed.documentElement, true);
        const grids = [...vector.querySelectorAll('g[clip-path="url(#sphere)"]')];
        if (grids.length !== 2) return;
        const wireframe = document.createElementNS(SVG_NS, 'g');
        wireframe.setAttribute('class', 'globe-wireframe');
        grids[0].before(wireframe);
        wireframe.append(...grids);

        const mesh = createWireframe();
        const meridians = mesh.filter((line) => !line.latitude);
        const latitudePaths = projectWireframe(mesh.filter((line) => line.latitude), 0);
        const movingPaths = {};
        ['back', 'front'].forEach((side, index) => {
          // Reuse the original front/back ink, opacity and circular clipping mask.
          grids[index].replaceChildren();
          for (const type of ['latitudes', 'meridians']) {
            const path = document.createElementNS(SVG_NS, 'path');
            path.setAttribute('fill', 'none');
            path.setAttribute('class', `globe-${type}`);
            grids[index].append(path);
            if (type === 'latitudes') path.setAttribute('d', latitudePaths[side]);
            else movingPaths[side] = path;
          }
        });
        render = () => {
          const paths = projectWireframe(meridians, angle);
          movingPaths.front.setAttribute('d', paths.front);
          movingPaths.back.setAttribute('d', paths.back);
        };
        render();
        vector.classList.add('instrument-vector');
        vector.setAttribute('aria-hidden', 'true');
        vector.setAttribute('focusable', 'false');
        image.replaceWith(vector);
      }).catch(() => { /* The complete static illustration remains in place. */ });
    }
    await pending;
  }

  function tick(time) {
    frame = 0;
    if (!shouldRun()) { previousTime = null; return; }
    if (previousTime !== null) {
      angle = (angle + Math.min(time - previousTime, 64) / REVOLUTION_MS * Math.PI * 2) % (Math.PI * 2);
    }
    previousTime = time;
    render();
    frame = requestAnimationFrame(tick);
  }

  function sync() {
    if (!shouldRun()) {
      cancelAnimationFrame(frame);
      frame = 0;
      previousTime = null;
      return;
    }
    upgrade().then(() => {
      if (render && shouldRun() && !frame) frame = requestAnimationFrame(tick);
    });
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      sync();
    }, { threshold: 0.05 });
    observer.observe(plate);
  } else { visible = true; }
  onMotionChange(sync);
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pagehide', () => { suspended = true; sync(); });
  window.addEventListener('pageshow', () => { suspended = false; sync(); });
  sync();
}
