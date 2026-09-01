/* ============================================================
   NAV — marks the section currently being read

   Uses a band across the middle of the viewport so exactly one
   section can own the highlight at a time.
   ============================================================ */

const READING_BAND = '-45% 0px -45% 0px';

export function initNav() {
  const links = Array.from(document.querySelectorAll('.site-nav a[href^="#"]'));
  if (!links.length || !('IntersectionObserver' in window)) return;

  const linkBySection = new Map();

  links.forEach((link) => {
    const section = document.getElementById(link.getAttribute('href').slice(1));
    if (section) linkBySection.set(section, link);
  });

  if (!linkBySection.size) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const active = linkBySection.get(entry.target);
      if (!active) return;

      links.forEach((link) => link.removeAttribute('aria-current'));
      active.setAttribute('aria-current', 'true');
    });
  }, { rootMargin: READING_BAND });

  linkBySection.forEach((_link, section) => observer.observe(section));
}
