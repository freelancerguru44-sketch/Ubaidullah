import { Router } from 'express';
import crypto from 'node:crypto';
import pool from '../db.js';

const router = Router();
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

// Har admin request mein header chahiye:  x-admin-key: <ADMIN_KEY>
router.use((req, res, next) => {
  const key = process.env.ADMIN_KEY || 'Ubaid@123';
  const sent = String(req.get('x-admin-key') || 'Ubaid@123');
  const isProduction = process.env.NODE_ENV === 'production';
  const meetsMinimumLength = isProduction ? key.length >= 16 : key.length > 0;
  const ok = meetsMinimumLength && sent.length === key.length &&
    crypto.timingSafeEqual(Buffer.from(sent), Buffer.from(key));
  if (!ok) return res.status(401).json({ error: 'Unauthorized' });
  next();
});

const PROJECT_FIELDS = ['slug','title','summary','category','status','tech','features','problem','solution','role','challenges','cover_image','live_url','github_url','sort_order','is_published'];
const JSON_FIELDS = ['tech', 'features'];
const CREATIVE_FIELDS = ['title','category','description','media_type','media_url','thumb_url','sort_order','is_published'];

function pick(body, allowed) {
  const out = {};
  for (const f of allowed) {
    if (body[f] === undefined) continue;
    out[f] = JSON_FIELDS.includes(f) ? JSON.stringify(body[f]) : body[f];
  }
  return out;
}

router.get('/messages', wrap(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM messages ORDER BY id DESC LIMIT 200');
  res.json(rows);
}));

router.get('/projects', wrap(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM projects ORDER BY sort_order ASC, id DESC');
  res.json(rows.map((row) => ({
    ...row,
    tech: typeof row.tech === 'string' ? JSON.parse(row.tech || 'null') : row.tech,
    features: typeof row.features === 'string' ? JSON.parse(row.features || 'null') : row.features,
  })));
}));

router.post('/projects', wrap(async (req, res) => {
  const data = pick(req.body || {}, PROJECT_FIELDS);
  if (!data.slug || !data.title || !data.summary || !data.category) {
    return res.status(400).json({ error: 'slug, title, summary, category required' });
  }
  const [r] = await pool.query('INSERT INTO projects SET ?', [data]);
  res.status(201).json({ id: r.insertId });
}));

router.put('/projects/:id', wrap(async (req, res) => {
  const data = pick(req.body || {}, PROJECT_FIELDS);
  if (!Object.keys(data).length) return res.status(400).json({ error: 'Nothing to update' });
  await pool.query('UPDATE projects SET ? WHERE id = ?', [data, req.params.id]);
  res.json({ ok: true });
}));

router.delete('/projects/:id', wrap(async (req, res) => {
  await pool.query('DELETE FROM projects WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
}));

router.get('/creative', wrap(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM creative_items ORDER BY sort_order ASC, id DESC');
  res.json(rows);
}));

router.post('/creative', wrap(async (req, res) => {
  const data = pick(req.body || {}, CREATIVE_FIELDS);
  if (!data.title || !data.category || !data.media_url) {
    return res.status(400).json({ error: 'title, category, media_url required' });
  }
  const [r] = await pool.query('INSERT INTO creative_items SET ?', [data]);
  res.status(201).json({ id: r.insertId });
}));

router.put('/creative/:id', wrap(async (req, res) => {
  const data = pick(req.body || {}, CREATIVE_FIELDS);
  if (!Object.keys(data).length) return res.status(400).json({ error: 'Nothing to update' });
  await pool.query('UPDATE creative_items SET ? WHERE id = ?', [data, req.params.id]);
  res.json({ ok: true });
}));

router.delete('/creative/:id', wrap(async (req, res) => {
  await pool.query('DELETE FROM creative_items WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
}));

router.patch('/messages/:id', wrap(async (req, res) => {
  if (typeof req.body?.is_read !== 'boolean') {
    return res.status(400).json({ error: 'is_read must be a boolean' });
  }
  await pool.query('UPDATE messages SET is_read = ? WHERE id = ?', [req.body.is_read, req.params.id]);
  res.json({ ok: true });
}));

router.get('/profile', wrap(async (req, res) => {
  const [rows] = await pool.query('SELECT profile FROM site_settings WHERE id = 1');
  const value = rows[0]?.profile ?? {};
  res.json(typeof value === 'string' ? JSON.parse(value) : value);
}));

router.put('/profile', wrap(async (req, res) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ error: 'A profile object is required' });
  }
  await pool.query(
    `INSERT INTO site_settings (id, profile) VALUES (1, ?)
     ON DUPLICATE KEY UPDATE profile = VALUES(profile)`,
    [JSON.stringify(req.body)]
  );
  res.json({ ok: true });
}));

export default router;
