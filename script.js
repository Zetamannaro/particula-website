(() => {
  const root = document.getElementById('particula-hero');
  const journey = root.querySelector('.journey');
  const cue = root.querySelector('.scroll-cue');
  const wheel = root.querySelector('.section-wheel');
  const wheelList = root.querySelector('.wheel-list');
  const wheelLinks = [...wheelList.querySelectorAll('a')];
  const go = root.querySelector('.wheel-go');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let pending = false, selected = 0, wheelPending = false;
  const behavior = () => reducedMotion.matches ? 'instant' : 'smooth';
  const moveTo = (id) => {
    const target = document.getElementById(id);
    if (!target) return;
    const top = id === 'nanoglyph' ? journey.offsetHeight - root.clientHeight : target.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop;
    root.scrollTo({ top, behavior: behavior() });
  };
  const render = () => {
    const range = journey.offsetHeight - root.clientHeight;
    const progress = Math.max(0, Math.min(1, root.scrollTop / Math.max(1, range)));
    root.style.setProperty('--p', progress.toFixed(5));
    cue.style.visibility = progress > .34 ? 'hidden' : 'visible';
    wheel.style.visibility = progress > .24 ? 'hidden' : 'visible';
    wheel.inert = progress > .24;
    pending = false;
  };
  const schedule = () => { if (!pending) { pending = true; requestAnimationFrame(render); } };
  root.addEventListener('scroll', schedule, { passive: true });
  new ResizeObserver(schedule).observe(root);
  root.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => { event.preventDefault(); moveTo(link.getAttribute('href').slice(1)); });
  });
  const renderWheel = () => {
    const rowHeight = 44;
    selected = Math.max(0, Math.min(wheelLinks.length - 1, Math.round(wheelList.scrollTop / rowHeight)));
    wheelLinks.forEach((link, index) => {
      const distance = (index * rowHeight - wheelList.scrollTop) / rowHeight;
      link.style.setProperty('--angle', `${Math.max(-65, Math.min(65, distance * -23))}deg`);
      link.style.setProperty('--scale', `${Math.max(.8, 1 - Math.abs(distance) * .08)}`);
      link.style.setProperty('--fade', `${Math.max(.15, 1 - Math.abs(distance) * .3)}`);
    });
    go.replaceChildren(document.createTextNode(`Explore ${wheelLinks[selected].textContent.toLowerCase()} `));
    const arrow = document.createElement('span'); arrow.textContent = '↗'; arrow.setAttribute('aria-hidden','true'); go.append(arrow);
    wheelPending = false;
  };
  wheelList.addEventListener('scroll', () => { if (!wheelPending) { wheelPending = true; requestAnimationFrame(renderWheel); } }, { passive: true });
  wheelList.addEventListener('keydown', event => {
    if (!['ArrowDown','ArrowUp','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const current = wheelLinks.indexOf(document.activeElement);
    const origin = current < 0 ? selected : current;
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? wheelLinks.length - 1 : Math.max(0, Math.min(wheelLinks.length - 1, origin + (event.key === 'ArrowDown' ? 1 : -1)));
    wheelLinks[next].focus({ preventScroll:true });
    wheelList.scrollTo({ top: next * 44, behavior: behavior() });
  });
  go.addEventListener('click', () => moveTo(wheelLinks[selected].hash.slice(1)));
  root.querySelectorAll('.glow-card').forEach(card => {
    card.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse' || reducedMotion.matches) return;
      const bounds = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${event.clientX - bounds.left}px`);
      card.style.setProperty('--my', `${event.clientY - bounds.top}px`);
    });
  });
  renderWheel(); render();
})();
