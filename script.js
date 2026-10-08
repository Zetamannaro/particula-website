(() => {
  const root = document.getElementById('particula-hero');
  const journey = root.querySelector('.journey');
  const cue = root.querySelector('.scroll-cue');
  const wheel = root.querySelector('.section-wheel');
  const wheelList = root.querySelector('.wheel-list');
  const wheelLinks = [...wheelList.querySelectorAll('a')];
  const sections = wheelLinks.map(link => document.getElementById(link.getAttribute('href').slice(1)));
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 1024px)');
  const rowHeight = 44;
  let pending = false, selected = -1, wheelPending = false, lastWheelTime = -Infinity;
  const behavior = () => reducedMotion.matches ? 'instant' : 'smooth';
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const moveTo = id => {
    const target = document.getElementById(id);
    if (!target) return;
    const top = id === 'nanoglyph' ? journey.offsetHeight - root.clientHeight : target.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop;
    root.scrollTo({ top, behavior: behavior() });
  };
  const renderWheel = () => {
    wheelLinks.forEach((link, index) => {
      const distance = (index * rowHeight - wheelList.scrollTop) / rowHeight;
      link.style.setProperty('--angle', `${clamp(distance * -23, -65, 65)}deg`);
      link.style.setProperty('--scale', `${Math.max(.8, 1 - Math.abs(distance) * .08)}`);
      link.style.setProperty('--fade', `${Math.max(.15, 1 - Math.abs(distance) * .3)}`);
    });
    wheelPending = false;
  };
  const selectSection = index => {
    if (index === selected) return;
    selected = index;
    wheelLinks.forEach((link, i) => {
      if (i === index) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    if (desktop.matches) wheelList.scrollTo({ top: index * rowHeight, behavior: behavior() });
  };
  const render = () => {
    const heroRange = Math.max(1, journey.offsetHeight - root.clientHeight);
    const heroProgress = clamp(root.scrollTop / heroRange, 0, 1);
    const pageRange = Math.max(1, root.scrollHeight - root.clientHeight);
    root.style.setProperty('--p', heroProgress.toFixed(5));
    root.style.setProperty('--page-p', clamp(root.scrollTop / pageRange, 0, 1).toFixed(5));
    cue.style.visibility = heroProgress > .34 ? 'hidden' : 'visible';
    wheel.classList.toggle('is-dark', heroProgress > .38);
    const readingLine = root.getBoundingClientRect().top + root.clientHeight * .35;
    let active = 0;
    sections.forEach((section, index) => {
      if (section.getBoundingClientRect().top <= readingLine) active = index;
    });
    if (root.scrollTop >= pageRange - 2) active = sections.length - 1;
    selectSection(active);
    pending = false;
  };
  const schedule = () => { if (!pending) { pending = true; requestAnimationFrame(render); } };
  root.addEventListener('scroll', schedule, { passive: true });
  const resizeObserver = new ResizeObserver(schedule);
  resizeObserver.observe(root);
  // Accordion changes also alter the remaining parallax distance.
  [...root.children].forEach(child => { if (child !== wheel) resizeObserver.observe(child); });
  desktop.addEventListener('change', () => { selected = -1; schedule(); });
  root.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      moveTo(link.getAttribute('href').slice(1));
    });
  });
  wheelList.addEventListener('scroll', () => {
    if (!wheelPending) { wheelPending = true; requestAnimationFrame(renderWheel); }
  }, { passive: true });
  wheelList.addEventListener('wheel', event => {
    if (!desktop.matches || !event.deltaY) return;
    event.preventDefault();
    // One section per deliberate wheel gesture; trackpad inertia cannot skip the page.
    if (event.timeStamp - lastWheelTime < 550) return;
    lastWheelTime = event.timeStamp;
    const next = clamp(selected + Math.sign(event.deltaY), 0, wheelLinks.length - 1);
    moveTo(sections[next].id);
  }, { passive: false });
  wheelList.addEventListener('keydown', event => {
    if (!['ArrowDown','ArrowUp','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const current = wheelLinks.indexOf(document.activeElement);
    const origin = current < 0 ? selected : current;
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? wheelLinks.length - 1 : clamp(origin + (event.key === 'ArrowDown' ? 1 : -1), 0, wheelLinks.length - 1);
    wheelLinks[next].focus({ preventScroll: true });
    moveTo(sections[next].id);
  });
  wheelLinks.forEach((link, index) => link.addEventListener('focus', () => {
    wheelList.scrollTo({ top: index * rowHeight, behavior: behavior() });
  }));
  wheel.addEventListener('focusout', event => {
    if (!wheel.contains(event.relatedTarget)) wheelList.scrollTo({ top: selected * rowHeight, behavior: behavior() });
  });
  root.querySelectorAll('.glow-card').forEach(card => {
    card.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse' || reducedMotion.matches) return;
      const bounds = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${event.clientX - bounds.left}px`);
      card.style.setProperty('--my', `${event.clientY - bounds.top}px`);
    });
  });
  document.getElementById('copyright-year').textContent = new Date().getFullYear();
  renderWheel(); render();
})();
