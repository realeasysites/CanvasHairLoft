# Canvas Hair Loft — website

Built by Real Easy Sites on the **Atelier** template: an editorial, gallery-style layout for hair studios, beauty studios and high-end bakeries.

Node 20 · Express · SQLite. One server serves the site, the request form (with inspiration-photo uploads) and a password-only dashboard at `/admin`.

## Run it

```bash
npm install
ADMIN_PASSWORD=choose-one npm start   # http://localhost:3000
```

## Environment variables

| Var | What it does |
|---|---|
| `ADMIN_PASSWORD` | Dashboard password. The dashboard stays locked until this is set. |
| `SESSION_SECRET` | Any random string. Signs the login cookie. |
| `SITE_URL` | Public address, used in SEO tags, sitemap and email links. |
| `DB_PATH` | SQLite file. On Render, put this on a disk, e.g. `/var/data/canvas.sqlite`. Uploaded photos go in an `uploads` folder next to it. |
| `NOTIFY_EMAIL` | Where new-request alerts go (photos attached). |
| `SMTP_USER` / `SMTP_PASS` | Gmail address + app password for sending alerts. `SMTP_HOST`/`SMTP_PORT` for other providers. |

Without a persistent disk (Render free plan), requests and their photos are wiped on every deploy.

## Short links
`/book` → request form · `/instagram` · `/facebook` · `/admin`

## The Atelier template

Everything client-specific is in **`content/site.js`**: colors, copy, the palette of services, the gallery, artists, request-form options, address and socials. Any list left empty hides its section (`menu`, `policies`, `hours`, `artists`…).

Sections, top to bottom:

1. **Hero:** script headline over a painted brushstroke, with three photos hung like art with placards.
2. **The palette:** services as paint chips. Each swatch is a real tone sampled from that service's photo; tapping one swaps the photo and description. For a bakery, use flavors or cake styles.
3. **The menu** (optional): priced list, shown only if `menu` has groups.
4. **The work:** exhibit-wall gallery with captions and a lightbox.
5. **The space:** full-bleed interior photo with a details card.
6. **The artists:** typographic list with "Book with ___" buttons. Each button preselects the artist on the form, or links out if `bookUrl` is set (Vagaro, GlossGenius, Square…). For a bakery, rename it or leave it empty.
7. **Request a visit:** inquiry form with up to 3 inspiration photos. For a bakery, swap `request.kinds` to custom cakes, weddings, wholesale, etc.
8. **Visit:** address, hours or "By appointment", contact, map, live Facebook feed.

To start a new client: copy this repo, edit `content/site.js`, drop photos in `public/img/photos/`, replace `public/img/logo.png`, `og-image.jpg` and `favicon.png`, and set the env vars.

Dashboard: password only, statuses New / Contacted / Booked / Not booked, private notes, CSV export, and delete on every request (deleting also removes its photos).

Footer credit: "Website by Real Easy Sites" → getrealeasysites.com.
