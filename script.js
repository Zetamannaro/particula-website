(() => {
  const root = document.getElementById('particula-hero');
  const journey = root.querySelector('.journey');
  const cue = root.querySelector('.scroll-cue');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let pending = false;
  const render = () => {
    const range = journey.offsetHeight - root.clientHeight;
    const progress = Math.max(0, Math.min(1, root.scrollTop / Math.max(1, range)));
    root.style.setProperty('--p', progress.toFixed(5));
    cue.style.visibility = progress > .34 ? 'hidden' : 'visible';
    pending = false;
  };
  const schedule = () => { if (!pending) { pending = true; requestAnimationFrame(render); } };
  root.addEventListener('scroll', schedule, { passive: true });
  new ResizeObserver(schedule).observe(root);
  cue.addEventListener('click', event => {
    event.preventDefault();
    root.scrollTo({ top: journey.offsetHeight - root.clientHeight, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  });
  render();
})();
