(() => {
  'use strict';

  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');

  // The intro waits just long enough to be seen, with a firm limit for slow images.
  const preloader = $('#preloader');
  document.body.classList.add('intro-loading');
  let introFinished = false;
  const introStarted = performance.now();
  const finishIntro = () => {
    if (introFinished) return;
    introFinished = true;
    document.body.classList.remove('intro-loading');
    $('.preloader-skip').disabled = true;
    preloader.classList.add('is-complete');
    preloader.setAttribute('aria-hidden', 'true');
    setTimeout(() => { preloader.hidden = true; }, reducedMotion ? 0 : 700);
  };
  const scheduleIntroFinish = () => {
    const remaining = reducedMotion ? 0 : Math.max(0, 2400 - (performance.now() - introStarted));
    setTimeout(finishIntro, remaining);
  };
  if (document.readyState === 'complete') scheduleIntroFinish();
  else window.addEventListener('load', scheduleIntroFinish, { once: true });
  setTimeout(finishIntro, reducedMotion ? 0 : 3500);
  $('.preloader-skip').addEventListener('click', finishIntro);

  const header = $('#site-header');
  const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 32);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  const mobileMenu = $('#mobile-menu');
  const menuButton = $('.menu-toggle');
  function closeMenu(restoreFocus = false) {
    mobileMenu.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
    header.classList.remove('menu-active');
    document.body.classList.remove('menu-open');
    if (restoreFocus) menuButton.focus();
  }
  menuButton.addEventListener('click', () => {
    const opening = mobileMenu.hidden;
    mobileMenu.hidden = !opening;
    menuButton.setAttribute('aria-expanded', String(opening));
    menuButton.setAttribute('aria-label', opening ? 'Close navigation' : 'Open navigation');
    header.classList.toggle('menu-active', opening);
    document.body.classList.toggle('menu-open', opening);
  });
  $$('#mobile-menu a').forEach(link => link.addEventListener('click', () => closeMenu()));
  window.addEventListener('resize', () => { if (innerWidth > 760 && !mobileMenu.hidden) closeMenu(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !mobileMenu.hidden) closeMenu(true);
  });

  if ('IntersectionObserver' in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    }, { threshold: 0.08, rootMargin: '0px 0px -35px 0px' });
    $$('.reveal').forEach(element => revealObserver.observe(element));
  } else {
    $$('.reveal').forEach(element => element.classList.add('is-visible'));
  }

  const stories = [
    {
      id: 'bridal',
      title: 'Bridal <em>stories</em>',
      image: 'assets/studio-bridal.png',
      alt: 'Ivory embroidered bridal lehenga',
      description: 'For the beginning of a beautiful new chapter. Soft romance, considered details and a presence entirely your own.'
    },
    {
      id: 'groom',
      title: 'For <em>him</em>',
      image: 'assets/groom.png',
      alt: 'Ivory embroidered sherwani in a courtyard',
      description: 'An entrance to remember. Timeless shapes and thoughtful details for the moments that call for confidence.'
    },
    {
      id: 'celebration',
      title: 'Celebration <em>wear</em>',
      image: 'assets/celebration.png',
      alt: 'Olive green embroidered celebration lehenga',
      description: 'For dancing a little longer, smiling a little wider, and making every gathering feel like an occasion.'
    },
    {
      id: 'jewellery',
      title: 'Finishing <em>touches</em>',
      image: 'assets/jewellery.png',
      alt: 'Gold and pearl jewellery on blush silk',
      description: 'The smallest details can hold the most meaning. A touch of light, a little sparkle, and a look that feels complete.'
    }
  ];
  const dialog = $('#look-dialog');
  let activeStory = 0;
  const showStory = index => {
    activeStory = (index + stories.length) % stories.length;
    const story = stories[activeStory];
    $('#look-dialog-title').innerHTML = story.title;
    $('#look-dialog-description').textContent = story.description;
    const image = $('#look-dialog-image');
    image.src = story.image;
    image.alt = story.alt;
    $('#look-dialog-count').textContent = `${String(activeStory + 1).padStart(2, '0')} / 04`;
  };
  $$('[data-look]').forEach(button => button.addEventListener('click', () => {
    const index = stories.findIndex(story => story.id === button.dataset.look);
    if (index < 0) return;
    showStory(index);
    dialog.showModal();
    document.body.classList.add('dialog-open');
  }));
  $('#look-prev').addEventListener('click', () => showStory(activeStory - 1));
  $('#look-next').addEventListener('click', () => showStory(activeStory + 1));
  $('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); showStory(activeStory - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); showStory(activeStory + 1); }
  });

  const config = window.WABI_SABI_CONFIG || {};
  const safeUrl = value => {
    try {
      const url = new URL(value);
      return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
    } catch { return ''; }
  };
  const links = $('#contact-links');
  const details = $('#contact-details');
  const makeButton = (label, href) => {
    const link = document.createElement('a');
    link.className = 'button button-outline';
    link.href = href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = label;
    const icon = document.createElement('span');
    icon.className = 'icon-arrow';
    icon.setAttribute('aria-hidden', 'true');
    link.append(icon);
    links.append(link);
  };
  const whatsapp = String(config.whatsappNumber || '').replace(/\D/g, '');
  if (/^\d{8,15}$/.test(whatsapp)) makeButton('MESSAGE THE BOUTIQUE', `https://wa.me/${whatsapp}`);
  else if (safeUrl(config.instagramUrl)) makeButton('FIND US ON INSTAGRAM', safeUrl(config.instagramUrl));
  if (config.phoneDisplay) {
    const link = document.createElement('a');
    link.href = `tel:${String(config.phoneDisplay).replace(/[^+\d]/g, '')}`;
    link.textContent = config.phoneDisplay;
    details.append(link);
  }
  for (const value of [config.address, config.openingHours]) {
    if (!value) continue;
    const item = document.createElement('p');
    item.textContent = value;
    details.append(item);
  }
  if (safeUrl(config.mapUrl)) {
    const map = document.createElement('a');
    map.href = safeUrl(config.mapUrl);
    map.target = '_blank';
    map.rel = 'noopener noreferrer';
    map.textContent = 'Find us on the map';
    const icon = document.createElement('span');
    icon.className = 'icon-arrow';
    icon.setAttribute('aria-hidden', 'true');
    map.append(icon);
    details.append(map);
  }
  $('#year').textContent = new Date().getFullYear();
})();
