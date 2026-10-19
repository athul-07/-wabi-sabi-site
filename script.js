(() => {
  const root = document.documentElement;
  const invitation = document.querySelector('.invitation');
  const scissors = document.querySelector('.cut-ribbon');
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  let opening = false;
  let finishTimer;
  invitation.inert = true;
  function finishOpening() {
    clearTimeout(finishTimer);
    root.classList.add('intro-complete');
    invitation.inert = false;
    const title = document.querySelector('h1');
    title.setAttribute('tabindex', '-1');
    title.focus({ preventScroll: true });
  }
  scissors.addEventListener('click', () => {
    if (opening) return;
    opening = true;
    scissors.disabled = true;
    root.classList.add('intro-open');
    if (motionPreference.matches) finishOpening();
    else finishTimer = setTimeout(finishOpening, 7900);
  });
  motionPreference.addEventListener('change', event => {
    if (event.matches && opening) finishOpening();
  });

  const launch = new Date('2026-10-28T17:00:00+05:30').getTime();
  const countdown = document.querySelector('#launch-countdown');
  const digits = [...document.querySelectorAll('[data-countdown]')];
  const message = document.querySelector('#launch-message');
  function updateCountdown() {
    const remaining = Math.max(0, Math.floor((launch - Date.now()) / 1000));
    const values = [Math.floor(remaining / 86400), Math.floor(remaining / 3600) % 24, Math.floor(remaining / 60) % 60, remaining % 60];
    digits.forEach((element, index) => {
      const next = String(values[index]).padStart(2, '0');
      if (element.textContent !== next) {
        element.textContent = next;
        element.classList.remove('tick');
        void element.offsetWidth;
        element.classList.add('tick');
      }
    });
    if (remaining === 0) message.textContent = 'THE WAIT IS OVER — A NEW CHAPTER BEGINS';
    return remaining;
  }
  updateCountdown();
  countdown.hidden = false;
  const timer = setInterval(() => { if (updateCountdown() === 0) clearInterval(timer); }, 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) updateCountdown(); });
  const particles = document.querySelector('.particles');
  for (let i = 0; i < 28; i++) {
    const particle = document.createElement('i');
    particle.className = 'particle';
    particle.style.cssText = `--x:${Math.random() * 100}%;--size:${1 + Math.random() * 2.5}px;--duration:${14 + Math.random() * 18}s;--delay:-${Math.random() * 32}s`;
    particles.append(particle);
  }
  const toggle = document.querySelector('.motion-toggle');
  if (!toggle) return;
  toggle.hidden = false;
  function setPaused(paused) {
    document.body.classList.toggle('motion-paused', paused);
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.textContent = paused ? 'Resume animation' : 'Pause animation';
  }
  toggle.addEventListener('click', () => setPaused(toggle.getAttribute('aria-pressed') !== 'true'));
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  toggle.hidden = preference.matches;
  preference.addEventListener('change', event => { toggle.hidden = event.matches; });
})();

