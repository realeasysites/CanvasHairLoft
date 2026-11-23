// Atelier template server — Real Easy Sites
// Node 20+ / Express / SQLite. Password-only admin, every request deletable.
const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const Database = require('better-sqlite3');
const site = require('./content/site');
const renderHome = require('./views/home');

const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'site.sqlite');
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(path.dirname(DB_PATH), 'uploads');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const SECRET = crypto.createHash('sha256').update(ADMIN_PASSWORD + (process.env.SESSION_SECRET || 'atelier')).digest();
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.exec(`CREATE TABLE IF NOT EXISTS requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  kind TEXT, name TEXT, phone TEXT, email TEXT, services TEXT, artist TEXT,
  client_type TEXT, timing TEXT, details TEXT, photos TEXT DEFAULT '[]',
  status TEXT DEFAULT 'New', notes TEXT DEFAULT ''
)`);
const STATUSES = ['New', 'Contacted', 'Booked', 'Not booked'];

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '50kb' }));
app.use((req, res, next) => {
  res.set({ 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'X-Frame-Options': 'SAMEORIGIN' });
  next();
});

// ---------- public site ----------
let homeHtml = renderHome(site);
app.get('/', (req, res) => {
  if (process.env.NODE_ENV !== 'production') homeHtml = renderHome(site);
  res.type('html').send(homeHtml);
});
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '7d', index: false }));
app.get('/book', (req, res) => res.redirect('/#request'));
app.get('/instagram', (req, res) => res.redirect(site.social.instagram || '/'));
app.get('/facebook', (req, res) => res.redirect(site.social.facebook || '/'));
app.get('/healthz', (req, res) => res.send('ok'));
app.get('/robots.txt', (req, res) => res.type('text').send(`User-agent: *\nDisallow: /admin\nDisallow: /api\nSitemap: ${site.siteUrl}/sitemap.xml\n`));
app.get('/sitemap.xml', (req, res) => res.type('xml').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${site.siteUrl}/</loc></url></urlset>`));

// ---------- request form ----------
const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) => {
      const ext = ({ 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/heic': '.heic', 'image/heif': '.heif', 'image/gif': '.gif' })[file.mimetype] || '.img';
      cb(null, crypto.randomBytes(12).toString('hex') + ext);
    },
  }),
  limits: { files: 3, fileSize: 12 * 1024 * 1024, fields: 30 },
  fileFilter: (req, file, cb) => cb(null, file.mimetype.startsWith('image/')),
});

const hits = new Map(); // simple per-IP throttle
function throttle(key, max, windowMs) {
  const now = Date.now(); const h = (hits.get(key) || []).filter(t => now - t < windowMs);
  h.push(now); hits.set(key, h); return h.length > max;
}
const clean = (v, n = 500) => String(v ?? '').replace(/[\u0000-\u0008\u000B-\u001F]/g, '').trim().slice(0, n);

app.post('/api/request', (req, res) => {
  if (throttle('r' + req.ip, 8, 60 * 60 * 1000)) return res.status(429).json({ error: 'Too many requests from this device. Email us instead and we’ll get right back to you.' });
  upload.array('photos', 3)(req, res, err => {
    const files = req.files || [];
    const drop = () => files.forEach(f => fs.unlink(f.path, () => {}));
    if (err) {
      drop();
      const msg = err.code === 'LIMIT_FILE_SIZE' ? 'One of the photos is over 12 MB. Choose a smaller photo.'
        : err.code === 'LIMIT_FILE_COUNT' ? 'You can add up to 3 photos.' : 'The photos couldn’t be uploaded. Try again with JPG or PNG photos.';
      return res.status(400).json({ error: msg });
    }
    const b = req.body || {};
    if (b.website) { drop(); return res.json({ ok: true, message: site.request.success }); } // honeypot
    const name = clean(b.name, 120), phone = clean(b.phone, 40), email = clean(b.email, 160);
    if (!name) { drop(); return res.status(400).json({ error: 'Add your name so your artist knows who to contact.' }); }
    if (!phone && !email) { drop(); return res.status(400).json({ error: 'Add a phone number or an email so your artist can reach you.' }); }
    const services = [].concat(b.services || []).map(s => clean(s, 80)).filter(Boolean).join(', ');
    const row = {
      created_at: new Date().toISOString(), kind: clean(b.kind, 80), name, phone, email, services,
      artist: clean(b.artist, 80), client_type: clean(b.client_type, 80), timing: clean(b.timing, 200), details: clean(b.details, 2000),
      photos: JSON.stringify(files.map(f => f.filename)),
    };
    const info = db.prepare(`INSERT INTO requests (created_at,kind,name,phone,email,services,artist,client_type,timing,details,photos)
      VALUES (@created_at,@kind,@name,@phone,@email,@services,@artist,@client_type,@timing,@details,@photos)`).run(row);
    notify({ id: info.lastInsertRowid, ...row }, files).catch(e => console.error('notify failed:', e.message));
    res.json({ ok: true, message: site.request.success });
  });
});

// Optional email alert (Gmail app password works): NOTIFY_EMAIL, SMTP_USER, SMTP_PASS [, SMTP_HOST, SMTP_PORT]
async function notify(r, files) {
  const to = process.env.NOTIFY_EMAIL, user = process.env.SMTP_USER, pass = process.env.SMTP_PASS;
  if (!to || !user || !pass) return;
  const nodemailer = require('nodemailer');
  const t = process.env.SMTP_HOST
    ? nodemailer.createTransport({ host: process.env.SMTP_HOST, port: +(process.env.SMTP_PORT || 587), auth: { user, pass } })
    : nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });
  const lines = [['Request', r.kind], ['Name', r.name], ['Phone', r.phone], ['Email', r.email], ['Services', r.services], ['Artist', r.artist || 'No preference'],
    ['Client', r.client_type], ['Good times', r.timing], ['Details', r.details]].filter(l => l[1]);
  await t.sendMail({
    from: `"${site.name} website" <${user}>`, to, replyTo: r.email || undefined,
    subject: `New request: ${r.name}${r.kind ? ' — ' + r.kind : ''}`,
    text: lines.map(l => `${l[0]}: ${l[1]}`).join('\n') + `\n\nOpen the dashboard: ${site.siteUrl}/admin`,
    attachments: files.map(f => ({ filename: f.originalname || f.filename, path: f.path })),
  });
}

// ---------- admin (password only) ----------
const sign = exp => exp + '.' + crypto.createHmac('sha256', SECRET).update(String(exp)).digest('hex');
function authed(req) {
  if (!ADMIN_PASSWORD) return false;
  const c = (req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith('atl='));
  if (!c) return false;
  const tok = decodeURIComponent(c.slice(4)); const exp = +tok.split('.')[0];
  if (!exp || exp < Date.now()) return false;
  const good = sign(exp);
  return tok.length === good.length && crypto.timingSafeEqual(Buffer.from(tok), Buffer.from(good));
}
const guard = (req, res, next) => authed(req) ? next() : res.status(401).json({ error: 'Signed out. Enter the password again.' });

app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'views', 'admin.html')));
app.get('/api/session', (req, res) => res.json({ authed: authed(req), configured: !!ADMIN_PASSWORD, name: site.name }));
app.post('/api/login', (req, res) => {
  if (!ADMIN_PASSWORD) return res.status(503).json({ error: 'The dashboard is locked until ADMIN_PASSWORD is set on the server.' });
  if (throttle('l' + req.ip, 8, 15 * 60 * 1000)) return res.status(429).json({ error: 'Too many tries. Wait 15 minutes and try again.' });
  const a = crypto.createHash('sha256').update(String(req.body?.password || '')).digest();
  const b = crypto.createHash('sha256').update(ADMIN_PASSWORD).digest();
  if (!crypto.timingSafeEqual(a, b)) return res.status(401).json({ error: 'That password isn’t right.' });
  const exp = Date.now() + 30 * 24 * 3600 * 1000;
  res.set('Set-Cookie', `atl=${encodeURIComponent(sign(exp))}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${30 * 24 * 3600}${req.secure ? '; Secure' : ''}`);
  res.json({ ok: true });
});
app.post('/api/logout', (req, res) => { res.set('Set-Cookie', 'atl=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0'); res.json({ ok: true }); });

const parse = r => ({ ...r, photos: JSON.parse(r.photos || '[]') });
app.get('/api/requests', guard, (req, res) => {
  res.json({ statuses: STATUSES, requests: db.prepare('SELECT * FROM requests ORDER BY id DESC').all().map(parse) });
});
app.patch('/api/requests/:id', guard, (req, res) => {
  const r = db.prepare('SELECT id FROM requests WHERE id=?').get(+req.params.id);
  if (!r) return res.status(404).json({ error: 'That request was already deleted.' });
  if (req.body.status !== undefined) {
    if (!STATUSES.includes(req.body.status)) return res.status(400).json({ error: 'Unknown status.' });
    db.prepare('UPDATE requests SET status=? WHERE id=?').run(req.body.status, r.id);
  }
  if (req.body.notes !== undefined) db.prepare('UPDATE requests SET notes=? WHERE id=?').run(clean(req.body.notes, 4000), r.id);
  res.json({ ok: true });
});
app.delete('/api/requests/:id', guard, (req, res) => {
  const r = db.prepare('SELECT * FROM requests WHERE id=?').get(+req.params.id);
  if (!r) return res.status(404).json({ error: 'That request was already deleted.' });
  JSON.parse(r.photos || '[]').forEach(f => fs.unlink(path.join(UPLOAD_DIR, path.basename(f)), () => {}));
  db.prepare('DELETE FROM requests WHERE id=?').run(r.id);
  res.json({ ok: true });
});
app.get('/api/uploads/:file', guard, (req, res) => {
  const f = path.join(UPLOAD_DIR, path.basename(req.params.file));
  if (!fs.existsSync(f)) return res.status(404).end();
  res.set('Cache-Control', 'private, max-age=86400').sendFile(f);
});
app.get('/api/requests.csv', guard, (req, res) => {
  const cols = ['id', 'created_at', 'status', 'kind', 'name', 'phone', 'email', 'services', 'artist', 'client_type', 'timing', 'details', 'notes'];
  const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = db.prepare('SELECT * FROM requests ORDER BY id DESC').all();
  res.attachment(`${site.shortName.toLowerCase()}-requests.csv`).type('csv')
    .send([cols.join(','), ...rows.map(r => cols.map(c => q(r[c])).join(','))].join('\n'));
});

app.use((req, res) => res.redirect('/'));
app.listen(PORT, () => console.log(`${site.name} running on :${PORT}${ADMIN_PASSWORD ? '' : ' (admin locked: set ADMIN_PASSWORD)'}`));
