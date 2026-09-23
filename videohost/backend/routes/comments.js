import express from 'express';
import db from '../db.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

router.get('/video/:videoId', (req, res) => {
  db.all(
    `SELECT c.*, u.username, u.avatar,
      (SELECT COUNT(*) FROM likes WHERE video_id=-c.id AND value=1) AS likes
     FROM comments c JOIN users u ON u.id=c.user_id
     WHERE c.video_id=? ORDER BY c.created_at DESC`,
    [req.params.videoId],
    (err, rows) => res.json(rows || [])
  );
});

router.post('/', authRequired, (req, res) => {
  const { video_id, text, parent_id } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: 'Пустой комментарий' });
  db.run(
    'INSERT INTO comments (user_id, video_id, parent_id, text) VALUES (?, ?, ?, ?)',
    [req.user.id, video_id, parent_id || null, text.trim()],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get(
        `SELECT c.*, u.username, u.avatar FROM comments c JOIN users u ON u.id=c.user_id WHERE c.id=?`,
        [this.lastID],
        (_e, row) => res.json(row)
      );
    }
  );
});

router.delete('/:id', authRequired, (req, res) => {
  db.get('SELECT * FROM comments WHERE id=?', [req.params.id], (err, c) => {
    if (err || !c) return res.status(404).json({ error: 'Не найдено' });
    if (c.user_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Нет прав' });
    db.run('DELETE FROM comments WHERE id=?', [c.id]);
    res.json({ ok: true });
  });
});

// Лайк видео
router.post('/like', authRequired, (req, res) => {
  const { video_id, value } = req.body;
  db.get('SELECT * FROM likes WHERE user_id=? AND video_id=?',
    [req.user.id, video_id], (_e, existing) => {
      if (existing && existing.value === value) {
        db.run('DELETE FROM likes WHERE id=?', [existing.id], () => res.json({ userLike: 0 }));
      } else if (existing) {
        db.run('UPDATE likes SET value=? WHERE id=?', [value, existing.id],
          () => res.json({ userLike: value }));
      } else {
        db.run('INSERT INTO likes (user_id, video_id, value) VALUES (?, ?, ?)',
          [req.user.id, video_id, value], () => res.json({ userLike: value }));
      }
    });
});

export default router;