/* Highlight the section at the reading position beneath the sticky header. */
export function initNav() {
  const links = Array.from(document.querySelectorAll('.site-nav a[href^="#"]'));
  const sections = links.map((link) => ({
    link,
    section: document.getElementById(link.getAttribute('href').slice(1))
  })).filter(({ section }) => section);
  if (!sections.length) return;

  const header = document.querySelector('.site-header');
  let scheduled = false;

  function update() {
    scheduled = false;
    const readingLine = Math.max((header?.offsetHeight || 0) + 24, window.innerHeight * 0.35);
    for (const { link, section } of sections) {
      const bounds = section.getBoundingClientRect();
      if (bounds.top <= readingLine && bounds.bottom > readingLine) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    }
  }

  function scheduleUpdate() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(update);
  }

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  update();
}
