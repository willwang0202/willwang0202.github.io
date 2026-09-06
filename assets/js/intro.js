import { loadAnime, motionEnabled, onMotionChange, EASE_OUT } from './motion.js';

export async function initIntro() {
  const root = document.documentElement;
  const hero = document.querySelector('.hero');
  const replay = document.querySelector('[data-intro-replay]');
  if (!hero) return;
  let anime = await loadAnime();
  let timeline;
  const targets = [...hero.querySelectorAll('.name-word, [data-intro-item], .instrument-plate, .instrument-orbit, .instrument-registration, .instrument-caption, .hero-topline, .hero-bottomline')];

  function finish(state = 'complete') {
    root.classList.remove('intro-pending', 'intro-running');
    root.dataset.intro = state;
    targets.forEach((target) => { target.style.opacity = ''; target.style.transform = ''; });
  }
  function stop() {
    timeline?.revert();
    timeline = null;
    finish();
  }
  function play() {
    if (!anime || !motionEnabled()) { finish('skipped'); return; }
    stop();
    root.classList.add('intro-running');
    root.dataset.intro = 'playing';
    timeline = anime.createTimeline({ autoplay: false, defaults: { ease: EASE_OUT }, onComplete: () => finish() });
    timeline
      .add('.hero-topline, .instrument-registration', { opacity: [0, 1], y: [5, 0], duration: 440 }, 0)
      .add('.name-word', { y: ['110%', '0%'], opacity: [0, 1], duration: 850, delay: anime.stagger(90) }, 70)
      .add('.instrument-plate', { scale: [0.92, 1], rotate: [-9, 0], opacity: [0, 1], duration: 1150 }, 40)
      .add('.instrument-orbit--outer', { rotate: [-100, 0], opacity: [0, 0.65], duration: 1300 }, 0)
      .add('.instrument-orbit--inner', { rotate: [70, 0], opacity: [0, 0.65], duration: 1150 }, 80)
      .add('[data-intro-item]', { y: [12, 0], opacity: [0, 1], duration: 500, delay: anime.stagger(65) }, 240)
      .add('.instrument-caption, .hero-bottomline', { opacity: [0, 1], y: [6, 0], duration: 480 }, 660);
    root.classList.remove('intro-pending');
    timeline.play();
  }

  if (!anime) {
    finish('skipped');
    if (replay) replay.hidden = true;
  } else if (root.classList.contains('intro-pending') && window.scrollY < 80 && !location.hash) play();
  else finish('skipped');

  replay?.addEventListener('click', async () => {
    if (!motionEnabled()) return;
    anime ||= await loadAnime();
    if (!anime || !motionEnabled()) { replay.hidden = true; return; }
    history.replaceState(history.state, '', '#top');
    window.scrollTo({ top: 0, behavior: 'instant' });
    // Move focus with the viewport so the next Tab starts at the profile.
    hero.tabIndex = -1;
    hero.focus({ preventScroll: true });
    play();
  });
  onMotionChange((enabled) => { if (!enabled) stop(); });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Tab' || event.key === 'Escape') stop();
  });
  document.addEventListener('click', (event) => {
    if (event.target.closest('a')) stop();
  });
  window.addEventListener('pagehide', stop);
}
