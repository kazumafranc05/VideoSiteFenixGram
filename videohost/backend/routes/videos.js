import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuid } from 'uuid';
import db from '../db.js';
import { authRequired, authOptional } from '../middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

const videosDir = path.join(__dirname, '..', 'uploads', 'videos');
if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, videosDir),
  filename: (_req, file, cb) => cb(null, uuid() + path.extname(file.originalname)),
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 * 1024 } });

// Список видео
router.get('/', authOptional, (req, res) => {
  const { search, category, userId, subscribed } = req.query;
  let sql = `SELECT v.*, u.username, u.avatar,
    (SELECT COUNT(*) FROM likes WHERE video_id=v.id AND value=1) AS likes,
    (SELECT COUNT(*) FROM likes WHERE video_id=v.id AND value=-1) AS dislikes,
    (SELECT COUNT(*) FROM comments WHERE video_id=v.id) AS comments
    FROM videos v JOIN users u ON u.id = v.user_id
    WHERE v.visibility='public'`;
  const params = [];
  if (search) {
    sql += ` AND (v.title LIKE ? OR v.description LIKE ? OR v.tags LIKE ?)`;
    const q = `%${search}%`;
    params.push(q, q, q);
  }
  if (category && category !== 'all') { sql += ` AND v.category = ?`; params.push(category); }
  if (userId) { sql += ` AND v.user_id = ?`; params.push(userId); }
  if (subscribed && req.user) {
    sql += ` AND v.user_id IN (SELECT channel_id FROM subscriptions WHERE subscriber_id=?)`;
    params.push(req.user.id);
  }
  sql += ` ORDER BY v.created_at DESC LIMIT 100`;

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Одно видео
router.get('/:id', authOptional, (req, res) => {
  db.get(
    `SELECT v.*, u.username, u.avatar,
      (SELECT COUNT(*) FROM likes WHERE video_id=v.id AND value=1) AS likes,
      (SELECT COUNT(*) FROM likes WHERE video_id=v.id AND value=-1) AS dislikes,
      (SELECT COUNT(*) FROM comments WHERE video_id=v.id) AS comments
     FROM videos v JOIN users u ON u.id = v.user_id WHERE v.id=?`,
    [req.params.id],
    (err, video) => {
      if (err || !video) return res.status(404).json({ error: 'Видео не найдено' });

      db.run('UPDATE videos SET views = views + 1 WHERE id=?', [video.id]);

      let userLike = 0;
      const finish = () => res.json({ ...video, userLike });

      if (req.user) {
        db.run('INSERT INTO history (user_id, video_id) VALUES (?, ?)', [req.user.id, video.id]);
        db.get('SELECT value FROM likes WHERE user_id=? AND video_id=?',
          [req.user.id, video.id], (_e, row) => {
            userLike = row?.value || 0;
            finish();
          });
      } else finish();
    }
  );
});

// Загрузка
router.post('/', authRequired, upload.single('video'), (req, res) => {
  const { title, description, tags, category, visibility } = req.body;
  if (!req.file) return res.status(400).json({ error: 'Видео не загружено' });
  if (!title) return res.status(400).json({ error: 'Название обязательно' });

  db.run(
    `INSERT INTO videos (user_id, title, description, tags, category, filename, visibility)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [req.user.id, title, description || '', tags || '', category || 'other',
     req.file.filename, visibility || 'public'],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// Удаление
router.delete('/:id', authRequired, (req, res) => {
  db.get('SELECT * FROM videos WHERE id=?', [req.params.id], (err, video) => {
    if (err || !video) return res.status(404).json({ error: 'Не найдено' });
    if (video.user_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Нет прав' });

    db.run('DELETE FROM videos WHERE id=?', [video.id]);
    db.run('DELETE FROM comments WHERE video_id=?', [video.id]);
    db.run('DELETE FROM likes WHERE video_id=?', [video.id]);
    res.json({ ok: true });
  });
});

// Список СВОИХ видео (для студии)
router.get('/my/list', authRequired, (req, res) => {
  db.all(
    `SELECT v.*,
      (SELECT COUNT(*) FROM likes WHERE video_id=v.id AND value=1) AS likes,
      (SELECT COUNT(*) FROM likes WHERE video_id=v.id AND value=-1) AS dislikes,
      (SELECT COUNT(*) FROM comments WHERE video_id=v.id) AS comments
     FROM videos v
     WHERE v.user_id = ?
     ORDER BY v.created_at DESC`,
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Редактирование своего видео
router.put('/:id', authRequired, (req, res) => {
  const { title, description, tags, category, visibility } = req.body;

  db.get('SELECT * FROM videos WHERE id=?', [req.params.id], (err, video) => {
    if (err || !video) return res.status(404).json({ error: 'Видео не найдено' });
    if (video.user_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Нет прав' });

    if (!title || !title.trim())
      return res.status(400).json({ error: 'Название обязательно' });

    db.run(
      `UPDATE videos
         SET title=?, description=?, tags=?, category=?, visibility=?
       WHERE id=?`,
      [
        title.trim(),
        description ?? '',
        tags ?? '',
        category ?? 'other',
        visibility ?? 'public',
        video.id,
      ],
      function (updErr) {
        if (updErr) return res.status(500).json({ error: updErr.message });
        db.get('SELECT * FROM videos WHERE id=?', [video.id], (_e, updated) =>
          res.json(updated)
        );
      }
    );
  });
});

// storage для картинок
const thumbsDir = path.join(__dirname, '..', 'uploads', 'thumbnails');
if (!fs.existsSync(thumbsDir)) fs.mkdirSync(thumbsDir, { recursive: true });

const thumbStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, thumbsDir),
  filename: (_req, file, cb) => cb(null, uuid() + path.extname(file.originalname)),
});
const uploadThumb = multer({ storage: thumbStorage, limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/:id/thumbnail', authRequired, uploadThumb.single('thumbnail'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Файл не загружен' });
  db.get('SELECT * FROM videos WHERE id=?', [req.params.id], (err, video) => {
    if (err || !video) return res.status(404).json({ error: 'Не найдено' });
    if (video.user_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Нет прав' });
    db.run(
      'UPDATE videos SET thumbnail=? WHERE id=?',
      [req.file.filename, video.id],
      () => res.json({ thumbnail: req.file.filename })
    );
  });
});

export default router;