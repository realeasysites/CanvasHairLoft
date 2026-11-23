// Atelier template — front-end behavior.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // mobile nav
  const toggle = $('.menu-toggle'), nav = $('#nav');
  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', open); nav.classList.toggle('open', open);
  });
  $$('#nav a').forEach(a => a.addEventListener('click', () => { toggle?.setAttribute('aria-expanded', 'false'); nav.classList.remove('open'); }));

  // palette chips
  const chips = $$('.chip'), img = $('#swatch-img');
  const pick = chip => {
    chips.forEach(c => c.setAttribute('aria-selected', c === chip));
    $('#swatch-name').textContent = chip.dataset.name;
    $('#swatch-text').textContent = chip.dataset.text;
    $('#swatch-dot').style.setProperty('--swatch', chip.style.getPropertyValue('--swatch'));
    if (img.getAttribute('src') !== chip.dataset.img) {
      img.classList.add('swap');
      const next = new Image(); next.src = chip.dataset.img;
      next.onload = () => { img.src = chip.dataset.img; img.alt = `${chip.dataset.name}`; img.classList.remove('swap'); };
    }
  };
  chips.forEach((c, i) => {
    c.addEventListener('click', () => pick(c));
    c.addEventListener('keydown', e => {
      const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (d) { e.preventDefault(); const n = chips[(i + d + chips.length) % chips.length]; n.focus(); pick(n); }
    });
  });
  chips.slice(1).forEach(c => { const p = new Image(); p.loading = 'lazy'; p.src = c.dataset.img; });

  // lightbox
  const lb = $('#lightbox');
  $$('.piece-open').forEach(b => b.addEventListener('click', () => {
    $('#lb-img').src = b.dataset.full; $('#lb-img').alt = b.dataset.title; $('#lb-cap').textContent = b.dataset.title;
    lb.showModal();
  }));
  lb?.addEventListener('click', e => { if (e.target === lb) lb.close(); });

  // "Book with ___" preselects the artist
  $$('[data-artist]').forEach(a => a.addEventListener('click', () => { $('#artist-select').value = a.dataset.artist; }));

  // mobile sticky book bar appears after the hero, hides at the form
  const bar = $('.mobile-book'), hero = $('.hero'), req = $('#request');
  if (bar && 'IntersectionObserver' in window) {
    let pastHero = false, atForm = false;
    const upd = () => bar.classList.toggle('show', pastHero && !atForm);
    new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting && e.boundingClientRect.top < 0; upd(); }).observe(hero);
    new IntersectionObserver(([e]) => { atForm = e.isIntersecting; upd(); }, { threshold: .05 }).observe(req);
  }

  // request form with inspiration photos
  const form = $('#request-form'); if (!form) return;
  const input = $('#photos'), thumbs = $('#thumbs'), drop = $('#drop'), msg = $('#form-msg');
  const MAX = 3, MAX_MB = 12;
  let files = [];
  const draw = () => {
    thumbs.innerHTML = '';
    files.forEach((f, i) => {
      const li = document.createElement('li');
      const im = document.createElement('img'); im.src = URL.createObjectURL(f); im.alt = f.name;
      const x = document.createElement('button'); x.type = 'button'; x.textContent = '×'; x.setAttribute('aria-label', `Remove ${f.name}`);
      x.onclick = () => { files.splice(i, 1); draw(); };
      li.append(im, x); thumbs.append(li);
    });
  };
  const add = list => {
    for (const f of list) {
      if (!f.type.startsWith('image/')) continue;
      if (f.size > MAX_MB * 1024 * 1024) { say(`${f.name} is over ${MAX_MB} MB. Choose a smaller photo.`); continue; }
      if (files.length >= MAX) { say(`You can add up to ${MAX} photos.`); break; }
      files.push(f);
    }
    draw();
  };
  const say = (t, ok) => { msg.textContent = t; msg.classList.toggle('ok', !!ok); };
  form.addEventListener('input', () => { if (!msg.classList.contains('ok')) say(''); });
  input.addEventListener('change', () => { add(input.files); input.value = ''; });
  ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', e => add(e.dataTransfer.files));

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const f = n => form.elements.namedItem(n);
    const name = f('name').value.trim(), phone = f('phone').value.trim(), email = f('email').value.trim();
    f('name').setAttribute('aria-invalid', !name);
    if (!name) { say('Add your name so your artist knows who to contact.'); f('name').focus(); return; }
    if (!phone && !email) { say('Add a phone number or an email so your artist can reach you.'); f('phone').focus(); return; }
    if (email && !/^\S+@\S+\.\S+$/.test(email)) { say('Check the email address. It should look like name@example.com.'); f('email').focus(); return; }
    const fd = new FormData(form); fd.delete('photos'); files.forEach(f => fd.append('photos', f));
    const btn = form.querySelector('[type=submit]'); btn.disabled = true; btn.textContent = 'Sending…';
    try {
      const res = await fetch(form.action, { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'The request didn’t go through. Check your connection and try again.');
      say(data.message, true); form.classList.add('sent'); msg.scrollIntoView({ block: 'center' });
    } catch (err) {
      say(err.message); btn.disabled = false; btn.textContent = 'Send request';
    }
  });
})();
