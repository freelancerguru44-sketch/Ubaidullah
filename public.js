import { Router } from 'express';
import pool from '../db.js';

const router = Router();
// MariaDB (XAMPP) JSON ko text bana ke deta hai, isliye yahan parse kar lete hain
const parseJson = (v) => { if (typeof v !== 'string') return v; try { return JSON.parse(v); } catch { return null; } };
const fixRow = (r) => ({ ...r, tech: parseJson(r.tech), ...(r.features !== undefined && { features: parseJson(r.features) }) });

const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

router.get('/profile', wrap(async (req, res) => {
  const [rows] = await pool.query('SELECT profile FROM site_settings WHERE id = 1');
  const value = rows[0]?.profile ?? null;
  res.json(typeof value === 'string' ? JSON.parse(value) : value);
}));

router.get('/projects', wrap(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, slug, title, summary, category, status, tech, cover_image, live_url, github_url
     FROM projects WHERE is_published = 1 ORDER BY sort_order ASC, id DESC`
  );
  res.json(rows.map(fixRow));
}));

router.get('/projects/:slug', wrap(async (req, res) => {
  const [rows] = await pool.query(
    'SELECT * FROM projects WHERE slug = ? AND is_published = 1 LIMIT 1',
    [req.params.slug]
  );
  if (!rows.length) return res.status(404).json({ error: 'Project not found' });
  res.json(fixRow(rows[0]));
}));

router.get('/creative', wrap(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, title, category, description, media_type, media_url, thumb_url
     FROM creative_items WHERE is_published = 1 ORDER BY sort_order ASC, id DESC`
  );
  res.json(rows);
}));

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clean = (v, max) => String(v ?? '').trim().slice(0, max);

router.post('/contact', wrap(async (req, res) => {
  const b = req.body || {};
  // Honeypot: bots yeh field bharte hain, insaan nahi
  if (b.website) return res.json({ ok: true });

  const name = clean(b.name, 100);
  const email = clean(b.email, 160);
  const details = clean(b.details, 3000);
  const errors = {};
  if (name.length < 2) errors.name = 'Please enter your name.';
  if (!EMAIL_RE.test(email)) errors.email = 'Please enter a valid email address.';
  if (details.length < 10) errors.details = 'Please add a few details about your project.';
  if (Object.keys(errors).length) return res.status(400).json({ errors });

  await pool.query(
    `INSERT INTO messages (name, email, project_type, budget, timeline, details)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, email, clean(b.projectType, 80) || null, clean(b.budget, 80) || null, clean(b.timeline, 80) || null, details]
  );
  res.status(201).json({ ok: true });
}));

export default router;
