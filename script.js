(() => {
  'use strict';
  const config = window.WABI_SABI_CONFIG || {};
  const collections = {
    bridal: { title: 'The Bridal Edit', image: 'assets/hero.png', description: 'A celebration of romance, colour, and the details you’ll remember. Explore bridal lehengas and gowns for your wedding, engagement, or reception.', tags: ['Lehengas', 'Gowns', 'Bridal occasions'] },
    groom: { title: 'The Gentleman’s Edit', image: 'assets/groom.png', description: 'From the elegance of a sherwani to the confidence of a well-chosen suit. Discover tailoring for grooms, wedding guests, and your next special occasion.', tags: ['Sherwanis', 'Suits', 'Blazers'] },
    occasion: { title: 'The Celebration Edit', image: 'assets/celebration.png', description: 'Rich colours, beautiful textures, and something a little unexpected. Find your inspiration for festivals, parties, photographs, and celebrations of every kind.', tags: ['Party wear', 'Festive occasions', 'Statement looks'] },
  };
  const storageKey = 'wabi_showcase_favourites';
  let saved = new Set();
  try { const stored = JSON.parse(localStorage.getItem(storageKey) || '[]'); if (Array.isArray(stored)) saved = new Set(stored.filter(id => Object.hasOwn(collections, id))); } catch {}
  let selected = null, toastTimer;
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const toast = message => { clearTimeout(toastTimer); $('#toast').textContent = message; $('#toast').classList.add('visible'); toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 3000); };
  const persist = () => { try { localStorage.setItem(storageKey, JSON.stringify([...saved])); } catch { toast('Saved for this visit. Browser storage is unavailable.'); } };
  const renderSaved = () => {
    $('#saved-count').textContent = saved.size;
    $('.wishlist-toggle').setAttribute('aria-label', `View saved collections (${saved.size})`);
    $$('[data-save]').forEach(button => { const isSaved = saved.has(button.dataset.save); button.setAttribute('aria-pressed', isSaved); button.textContent = isSaved ? '♥' : '♡'; button.setAttribute('aria-label', `${isSaved ? 'Unsave' : 'Save'} ${collections[button.dataset.save].title}`); });
    $('#saved-summary').textContent = saved.size ? `Your favourites: ${[...saved].map(id => collections[id].title).join(', ')}.` : 'Save a collection with the heart icon to include it here.';
    if (selected) $('#dialog-save').textContent = saved.has(selected) ? 'Remove from favourites ♥' : 'Save this collection ♡';
    const content = $('#wishlist-content'); content.replaceChildren();
    if (!saved.size) { const empty = document.createElement('p'); empty.className = 'wishlist-empty'; empty.textContent = 'Something caught your eye? Tap the heart on a collection to keep it here for later.'; content.append(empty); }
    saved.forEach(id => {
      const item = collections[id], row = document.createElement('div'); row.className = 'wishlist-row';
      const img = document.createElement('img'); img.src = item.image; img.alt = `${item.title} styling inspiration`;
      const copy = document.createElement('div'), title = document.createElement('h3'), subtitle = document.createElement('p'); title.textContent = item.title; subtitle.textContent = 'Saved to your visit plan'; copy.append(title, subtitle);
      const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = 'Remove'; remove.setAttribute('aria-label', `Remove ${item.title}`); remove.addEventListener('click', () => toggleSave(id));
      row.append(img, copy, remove); content.append(row);
    });
  };
  function toggleSave(id) { const wasSaved = saved.has(id); wasSaved ? saved.delete(id) : saved.add(id); persist(); renderSaved(); toast(wasSaved ? 'Collection removed from favourites.' : 'A little favourite, saved for later.'); }
  $$('[data-save]').forEach(button => button.addEventListener('click', () => toggleSave(button.dataset.save)));
  const openDialog = dialog => { dialog.showModal(); document.body.classList.add('dialog-open'); };
  $$('dialog').forEach(dialog => {
    dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', e => { if (e.target !== dialog) return; const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); });
    dialog.addEventListener('close', () => { if (!$('dialog[open]')) document.body.classList.remove('dialog-open'); });
  });
  $('#collection-dialog').setAttribute('aria-labelledby', 'dialog-title');
  $('#wishlist-dialog').setAttribute('aria-label', 'Saved collections');
  $$('[data-open]').forEach(button => button.addEventListener('click', () => {
    selected = button.dataset.open; const item = collections[selected];
    $('#dialog-image').src = item.image; $('#dialog-image').alt = `${item.title} editorial styling inspiration`;
    $('#dialog-title').textContent = item.title; $('#dialog-description').textContent = item.description;
    $('#dialog-tags').replaceChildren(...item.tags.map(tag => { const el = document.createElement('span'); el.textContent = tag; return el; }));
    renderSaved(); openDialog($('#collection-dialog'));
  }));
  $('#dialog-save').addEventListener('click', () => selected && toggleSave(selected));
  $('.wishlist-toggle').addEventListener('click', () => { renderSaved(); openDialog($('#wishlist-dialog')); });
  const goToVisit = () => { $$('dialog[open]').forEach(dialog => dialog.close()); $('#visit').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); $('#visit-form input[name="name"]').focus({ preventScroll: true }); };
  $('#dialog-visit').addEventListener('click', () => { if (selected && !saved.has(selected)) { saved.add(selected); persist(); renderSaved(); } goToVisit(); });
  $('#wishlist-visit').addEventListener('click', goToVisit);
  $$('.filter').forEach(button => button.addEventListener('click', () => {
    $$('.filter').forEach(filter => { const active = filter === button; filter.classList.toggle('active', active); filter.setAttribute('aria-pressed', active); });
    let count = 0; $$('.collection-card').forEach(card => { card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter; if (!card.hidden) count++; });
    $('.collection-count').textContent = `${count} collection${count === 1 ? '' : 's'} to explore`;
  }));
  const menu = $('#mobile-menu'), menuButton = $('.menu-toggle');
  const closeMenu = () => { menu.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Open navigation'); };
  const positionMenu = () => { menu.style.top = `${$('.site-header').getBoundingClientRect().bottom}px`; };
  menuButton.addEventListener('click', () => { const open = menuButton.getAttribute('aria-expanded') !== 'true'; menu.hidden = !open; menuButton.setAttribute('aria-expanded', String(open)); menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); positionMenu(); });
  $$('#mobile-menu a').forEach(link => link.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => { if (innerWidth > 850) closeMenu(); else positionMenu(); });
  window.addEventListener('scroll', () => { if (!menu.hidden) positionMenu(); }, { passive: true });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { closeMenu(); menuButton.focus(); } });
  document.addEventListener('click', e => { if (!menu.hidden && !menu.contains(e.target) && !menuButton.contains(e.target)) closeMenu(); });
  const safeUrl = value => { try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : ''; } catch { return ''; } };
  const details = $('#contact-details');
  for (const value of [config.address, config.openingHours]) if (value) { const p = document.createElement('p'); p.textContent = value; details.append(p); }
  if (config.phoneDisplay) { const phone = document.createElement('a'); phone.textContent = config.phoneDisplay; phone.href = `tel:${String(config.phoneDisplay).replace(/[^+\d]/g, '')}`; details.append(phone); }
  if (safeUrl(config.mapUrl)) { const map = document.createElement('a'); map.href = safeUrl(config.mapUrl); map.textContent = 'Find us on the map ↗'; map.target = '_blank'; map.rel = 'noopener noreferrer'; details.append(map); }
  if (safeUrl(config.instagramUrl)) { $('#instagram-link').href = safeUrl(config.instagramUrl); $('#instagram-link').hidden = false; }
  const whatsapp = String(config.whatsappNumber || '').replace(/\D/g, '');
  const hasWhatsApp = /^\d{8,15}$/.test(whatsapp);
  if (hasWhatsApp) { $('#enquiry-button').textContent = 'Continue on WhatsApp ↗'; $('#form-disclosure').textContent = 'Opens WhatsApp with your note. Review it and send it to the boutique to request availability. Bookings are confirmed by the team.'; }
  const dateInput = $('#visit-form input[name="date"]');
  const now = new Date(); dateInput.min = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  $('#visit-form').addEventListener('submit', e => {
    e.preventDefault(); const form = e.currentTarget; if (!form.reportValidity()) return;
    const data = new FormData(form), name = String(data.get('name') || '').trim();
    if (!name) { form.elements.name.setCustomValidity('Please enter your name.'); form.elements.name.reportValidity(); return; }
    const note = [`Hello Wabi Sabi!`, '', `My name: ${name}`, `Occasion: ${data.get('occasion')}`, `Event date: ${data.get('date') || 'To be decided'}`, `Interested in: ${data.get('preference')}`, `Collections: ${[...saved].map(id => collections[id].title).join(', ') || 'Open to ideas'}`, `My ideas: ${String(data.get('notes') || '').trim() || 'Let’s explore together.'}`, '', 'Please confirm available outfits, pricing, and visit arrangements.'].join('\n');
    if (hasWhatsApp) { window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(note)}`, '_blank', 'noopener,noreferrer'); $('#form-status').textContent = 'Your note is ready in WhatsApp. Send it there to contact the boutique.'; }
    else { const url = URL.createObjectURL(new Blob([note], { type: 'text/plain;charset=utf-8' })); const link = document.createElement('a'); link.href = url; link.download = 'my-wabi-sabi-styling-note.txt'; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); $('#form-status').textContent = 'Your styling note has been prepared for download. Keep it to share with the boutique. No booking has been made.'; }
  });
  $('#visit-form input[name="name"]').addEventListener('input', e => e.target.setCustomValidity(''));
  $('#year').textContent = new Date().getFullYear();
  renderSaved();
})();
