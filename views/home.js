// Atelier template — public home page. Reads everything from content/site.js.
const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const photo = f => `/img/photos/${f}`;
const first = n => String(n).split(' ')[0];

// A painted brushstroke, drawn once and reused. Irregular edges so it reads as paint, not a shape.
const stroke = cls => `<svg class="stroke ${cls}" viewBox="0 0 800 120" preserveAspectRatio="none" aria-hidden="true"><path d="M14 46c38-22 120-30 214-29 70 1 128-9 210-8 96 1 190 4 290 15 30 3 52 12 58 24 5 11-7 20-22 26 14 6 20 15 9 23-16 11-60 14-120 15-88 2-170-4-262 1-92 5-170 10-252 6-62-3-112-8-130-20-14-9-8-18 6-24-18-6-27-17-11-29z"/></svg>`;

function icon(name) {
  const p = {
    ig: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1"/>',
    fb: '<path d="M14 8h3V4h-3c-2.8 0-4.5 1.8-4.5 4.6V11H7v4h2.5v6h4v-6h3l.5-4h-3.5V9c0-.6.4-1 1-1z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6l8.5 7 8.5-7"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  }[name];
  return `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
}

module.exports = function renderHome(site) {
  const t = site.theme;
  const v = site.visit;
  const addr = `${v.street}, ${v.city}, ${v.region} ${v.zip}`;
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.mapQuery)}`;

  const schema = {
    '@context': 'https://schema.org', '@type': site.schemaType, name: site.name, url: site.siteUrl,
    image: site.siteUrl + '/img/og-image.jpg', logo: site.siteUrl + site.logo,
    address: { '@type': 'PostalAddress', streetAddress: v.street, addressLocality: v.city, addressRegion: v.region, postalCode: v.zip, addressCountry: 'US' },
    email: v.email || undefined, telephone: v.phone || undefined,
    sameAs: [site.social.instagram, site.social.facebook].filter(Boolean),
    makesOffer: site.palette.map(p => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: p.name } })),
  };

  const nav = [
    ['#palette', 'Services', site.palette.length],
    ['#work', 'The work', site.work.length],
    ['#artists', 'Artists', site.artists.length],
    ['#visit', 'Visit', true],
  ].filter(n => n[2]);

  const frames = site.hero.frames.map((f, i) => `
      <figure class="frame frame-${i + 1}">
        <img src="${photo(f.img)}" alt="${esc(f.title)}, ${esc(f.note.toLowerCase())} by ${esc(site.name)}" ${i ? 'loading="lazy"' : 'fetchpriority="high"'}>
        <figcaption class="placard"><span class="placard-title">${esc(f.title)}</span><span class="placard-note">${esc(f.note)}</span></figcaption>
      </figure>`).join('');

  const chips = site.palette.map((p, i) => `
        <li>
          <button class="chip" type="button" role="tab" id="chip-${i}" aria-controls="swatch-view" aria-selected="${i === 0}" data-img="${photo(p.img)}" data-name="${esc(p.name)}" data-text="${esc(p.text)}" style="--swatch:${p.swatch}">
            <span class="chip-color" aria-hidden="true"></span>
            <span class="chip-name">${esc(p.name)}</span>
          </button>
        </li>`).join('');

  const menu = site.menu.length ? `
  <section class="menu wrap" id="menu" aria-labelledby="menu-h">
    <h2 class="script-h" id="menu-h">The menu</h2>
    <div class="menu-cols">${site.menu.map(g => `
      <div class="menu-group"><h3>${esc(g.group)}</h3><dl>${g.items.map(it => `<div class="menu-row"><dt>${esc(it.name)}${it.note ? `<small>${esc(it.note)}</small>` : ''}</dt><dd>${esc(it.price)}</dd></div>`).join('')}</dl></div>`).join('')}
    </div>${site.menuNote ? `<p class="fine">${esc(site.menuNote)}</p>` : ''}
  </section>` : '';

  const work = site.work.map((w, i) => `
      <figure class="piece piece-${(i % 4) + 1}">
        <button type="button" class="piece-open" data-full="${photo(w.img)}" data-title="${esc(w.title)}" aria-label="View ${esc(w.title)} larger">
          <img src="${photo(w.img)}" alt="${esc(w.title)} by ${esc(site.name)}" loading="lazy">
        </button>
        <figcaption class="placard"><span class="placard-title">${esc(w.title)}</span></figcaption>
      </figure>`).join('');

  const artists = site.artists.map(a => {
    const href = a.bookUrl || `#request`;
    return `
      <li class="artist">
        <div class="artist-id"><p class="artist-name">${esc(a.name)}</p>${a.role ? `<p class="artist-role">${esc(a.role)}</p>` : ''}</div>
        <div class="artist-body">
          ${a.focus ? `<p class="artist-focus">${esc(a.focus)}</p>` : ''}
          ${a.instagram ? `<a class="artist-ig" href="https://www.instagram.com/${esc(a.instagram)}" target="_blank" rel="noopener">${icon('ig')}@${esc(a.instagram)}</a>` : ''}
        </div>
        <a class="btn btn-quiet" href="${esc(href)}" ${a.bookUrl ? 'target="_blank" rel="noopener"' : `data-artist="${esc(a.name)}"`}>Book with ${esc(first(a.name))}</a>
      </li>`;
  }).join('');

  const r = site.request;
  const hours = v.hours.length
    ? `<dl class="hours">${v.hours.map(([d, h]) => `<div><dt>${esc(d)}</dt><dd>${esc(h)}</dd></div>`).join('')}</dl>`
    : `<p class="by-appt">By appointment</p>`;

  const policies = site.policies.length ? `
      <details class="policies"><summary>Salon policies</summary>${site.policies.map(p => `<h3>${esc(p.title)}</h3><p>${esc(p.text)}</p>`).join('')}</details>` : '';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(site.seo.title)}</title>
<meta name="description" content="${esc(site.seo.description)}">
<link rel="canonical" href="${esc(site.siteUrl)}/">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(site.seo.title)}">
<meta property="og:description" content="${esc(site.seo.description)}">
<meta property="og:image" content="${esc(site.siteUrl)}/img/og-image.jpg">
<meta property="og:url" content="${esc(site.siteUrl)}/">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="${t.wall}">
<link rel="icon" href="/img/favicon.png">
<link rel="apple-touch-icon" href="/img/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Mrs+Saint+Delafield&family=Raleway:ital,wght@0,300;0,400;0,500;1,300&display=swap" rel="stylesheet">
<style>:root{--wall:${t.wall};--stroke:${t.stroke};--ink:${t.ink};--accent:${t.accent};--linen:${t.linen};--muted:${t.muted}}</style>
<link rel="stylesheet" href="/css/atelier.css">
<script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="top" id="top">
  <div class="wrap top-in">
    <a class="brand" href="/" aria-label="${esc(site.name)} home"><img src="${site.logo}" alt="${esc(site.logoAlt)}" width="811" height="204"></a>
    <nav class="nav" id="nav" aria-label="Main">
      ${nav.map(n => `<a href="${n[0]}">${n[1]}</a>`).join('')}
      <a class="btn btn-solid nav-cta" href="#request">${esc(r.title)}</a>
    </nav>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="nav"><span></span><span></span><span class="sr">Menu</span></button>
  </div>
</header>

<main id="main">
  <section class="hero wrap" aria-labelledby="hero-h">
    <div class="hero-words">
      ${stroke('hero-stroke')}
      <h1 class="hero-script" id="hero-h">${esc(site.hero.script)}</h1>
      <p class="hero-intro">${esc(site.hero.intro)}</p>
      <div class="hero-actions">
        <a class="btn btn-solid" href="#request">${esc(site.hero.primary)}</a>
        <a class="link" href="#work">${esc(site.hero.secondary)}</a>
      </div>
    </div>
    <div class="gallery-wall">${frames}
    </div>
  </section>

  <section class="palette" id="palette" aria-labelledby="palette-h">
    <div class="wrap palette-in">
      <div class="palette-side">
        <h2 class="script-h" id="palette-h">${esc(site.paletteTitle)}</h2>
        <p class="lede">${esc(site.paletteIntro)}</p>
        <ul class="chips" role="tablist" aria-label="Services">${chips}
        </ul>
      </div>
      <div class="swatch-view" id="swatch-view" role="tabpanel" aria-live="polite">
        <div class="swatch-photo"><img src="${photo(site.palette[0].img)}" alt="${esc(site.palette[0].name)} by ${esc(site.name)}" id="swatch-img"></div>
        <div class="swatch-card">
          <span class="swatch-dot" id="swatch-dot" style="--swatch:${site.palette[0].swatch}" aria-hidden="true"></span>
          <h3 id="swatch-name">${esc(site.palette[0].name)}</h3>
          <p id="swatch-text">${esc(site.palette[0].text)}</p>
          <a class="link" href="#request">Ask about this service</a>
        </div>
      </div>
    </div>
  </section>
${menu}
  <section class="work" id="work" aria-labelledby="work-h">
    <div class="wrap">
      <div class="work-head">
        <h2 class="script-h" id="work-h">${esc(site.workTitle)}</h2>
        ${site.social.instagram ? `<a class="link" href="${esc(site.social.instagram)}" target="_blank" rel="noopener">More on Instagram</a>` : ''}
      </div>
      <div class="exhibit">${work}
      </div>
    </div>
  </section>

  <section class="space" aria-labelledby="space-h">
    <img class="space-img" src="${photo(site.space.img)}" alt="Inside ${esc(site.name)}: white brick, cognac chairs and warm pendant lights" loading="lazy">
    <div class="wrap space-in">
      <div class="space-card">
        <h2 class="script-h" id="space-h">${esc(site.space.title)}</h2>
        <p>${esc(site.space.text)}</p>
        <ul class="ticks">${site.space.details.map(d => `<li>${esc(d)}</li>`).join('')}</ul>
      </div>
    </div>
  </section>

  <section class="artists wrap" id="artists" aria-labelledby="artists-h">
    <div class="artists-head">
      <h2 class="script-h" id="artists-h">${esc(site.artistsTitle)}</h2>
      <p class="lede">${esc(site.artistsIntro)}</p>
    </div>
    <ul class="artist-list">${artists}
    </ul>
  </section>

  <section class="request" id="request" aria-labelledby="request-h">
    <div class="wrap request-in">
      <div class="request-side">
        ${stroke('req-stroke')}
        <h2 class="script-h" id="request-h">${esc(r.title)}</h2>
        <p class="lede">${esc(r.intro)}</p>
        <img class="request-photo" src="${photo('tools.jpg')}" alt="" loading="lazy">
      </div>
      <form class="form" id="request-form" action="/api/request" method="post" enctype="multipart/form-data" novalidate>
        <fieldset class="kinds">
          <legend>What can we help with?</legend>
          ${r.kinds.map((k, i) => `<label class="pill"><input type="radio" name="kind" value="${esc(k)}" ${i === 0 ? 'checked' : ''}><span>${esc(k)}</span></label>`).join('')}
        </fieldset>
        <div class="row2">
          <label class="field"><span>Your name</span><input name="name" autocomplete="name" required maxlength="120"></label>
          <label class="field"><span>Phone</span><input name="phone" type="tel" autocomplete="tel" maxlength="40"></label>
        </div>
        <label class="field"><span>Email</span><input name="email" type="email" autocomplete="email" maxlength="160"></label>
        <p class="fine" id="contact-hint">Leave a phone number or an email so your artist can reach you.</p>
        <fieldset class="services">
          <legend>Services you're interested in</legend>
          ${site.palette.map(p => `<label class="check"><input type="checkbox" name="services" value="${esc(p.name)}"><span>${esc(p.name)}</span></label>`).join('')}
        </fieldset>
        <div class="row2">
          <label class="field"><span>Artist</span>
            <select name="artist" id="artist-select"><option value="">No preference</option>${site.artists.map(a => `<option>${esc(a.name)}</option>`).join('')}</select>
          </label>
          <label class="field"><span>Have you been in before?</span>
            <select name="client_type"><option>I'm new to ${esc(site.shortName)}</option><option>I'm a returning client</option></select>
          </label>
        </div>
        <label class="field"><span>${esc(r.timingLabel)}</span><input name="timing" maxlength="200" placeholder="Weekday mornings, Saturdays…"></label>
        <label class="field"><span>${esc(r.detailsLabel)}</span><textarea name="details" rows="4" maxlength="2000" placeholder="${esc(r.detailsPlaceholder)}"></textarea></label>
        <div class="drop" id="drop">
          <label class="drop-label" for="photos"><span class="drop-title">${esc(r.photoLabel)}</span><span class="fine">${esc(r.photoHint)}</span><span class="btn btn-quiet drop-btn">Add photos</span></label>
          <input type="file" id="photos" name="photos" accept="image/*" multiple>
          <ul class="thumbs" id="thumbs" aria-live="polite"></ul>
        </div>
        <input class="hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
        <p class="form-msg" id="form-msg" role="status"></p>
        <button class="btn btn-solid btn-wide" type="submit">Send request</button>
      </form>
    </div>
  </section>

  <section class="visit wrap" id="visit" aria-labelledby="visit-h">
    <div class="visit-info">
      <h2 class="script-h" id="visit-h">Visit the loft</h2>
      <p class="addr">${icon('pin')}<a href="${mapsLink}" target="_blank" rel="noopener">${esc(v.street)}<br>${esc(v.city)}, ${esc(v.region)} ${esc(v.zip)}</a></p>
      <p class="fine">${esc(v.note)}</p>
      ${hours}
      <ul class="contact">
        ${v.phone ? `<li><a href="tel:${esc(v.phone.replace(/[^\d+]/g, ''))}">${icon('phone')}${esc(v.phone)}</a></li>` : ''}
        ${v.email ? `<li><a href="mailto:${esc(v.email)}">${icon('mail')}${esc(v.email)}</a></li>` : ''}
        ${site.social.instagram ? `<li><a href="${esc(site.social.instagram)}" target="_blank" rel="noopener">${icon('ig')}Instagram</a></li>` : ''}
        ${site.social.facebook ? `<li><a href="${esc(site.social.facebook)}" target="_blank" rel="noopener">${icon('fb')}Facebook</a></li>` : ''}
      </ul>
      ${policies}
    </div>
    <div class="map"><iframe title="Map to ${esc(site.name)}" src="https://www.google.com/maps?q=${encodeURIComponent(v.mapQuery)}&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>
    ${site.social.facebookPage ? `
    <div class="feed">
      <h3>Latest from the loft</h3>
      <div class="fb-wrap"><iframe title="${esc(site.name)} on Facebook" src="https://www.facebook.com/plugins/page.php?href=${encodeURIComponent('https://www.facebook.com/' + site.social.facebookPage)}&tabs=timeline&width=500&height=560&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=false" width="500" height="560" loading="lazy" allow="encrypted-media"></iframe></div>
    </div>` : ''}
  </section>
</main>

<footer class="foot">
  <div class="wrap foot-in">
    <img class="foot-logo" src="${site.logo}" alt="${esc(site.logoAlt)}" width="811" height="204" loading="lazy">
    <p class="fine">${esc(addr)}</p>
    <p class="fine foot-copy">&copy; ${new Date().getFullYear()} ${esc(site.name)}</p>
    <a class="credit" href="${esc(site.credit.url)}" target="_blank" rel="noopener">${esc(site.credit.text)}</a>
  </div>
</footer>

<dialog class="lightbox" id="lightbox" aria-label="Photo">
  <form method="dialog"><button class="lb-close" aria-label="Close">&times;</button></form>
  <img id="lb-img" alt="">
  <p id="lb-cap" class="placard-title"></p>
</dialog>

<div class="mobile-book"><a class="btn btn-solid btn-wide" href="#request">${esc(r.title)}</a></div>
<script src="/js/atelier.js" defer></script>
</body>
</html>`;
};
