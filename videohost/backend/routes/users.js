import express from 'express';
import db from '../db.js';
import { authRequired, authOptional } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', authRequired, (req, res) => {
  db.get(
    `SELECT id, username, email, avatar, bio, role FROM users WHERE id=?`,
    [req.user.id],
    (err, user) => res.json(user)
  );
});

router.get('/history', authRequired, (req, res) => {
  db.all(
    `SELECT DISTINCT v.*, u.username,
      (SELECT COUNT(*) FROM likes WHERE video_id=v.id AND value=1) AS likes
     FROM history h JOIN videos v ON v.id=h.video_id JOIN users u ON u.id=v.user_id
     WHERE h.user_id=? ORDER BY h.watched_at DESC LIMIT 50`,
    [req.user.id],
    (err, rows) => res.json(rows || [])
  );
});

router.get('/:id', authOptional, (req, res) => {
  db.get(
    `SELECT u.id, u.username, u.avatar, u.bio, u.created_at,
      (SELECT COUNT(*) FROM subscriptions WHERE channel_id=u.id) AS subscribers,
      (SELECT COUNT(*) FROM videos WHERE user_id=u.id) AS videoCount
     FROM users u WHERE u.id=?`,
    [req.params.id],
    (err, user) => {
      if (err || !user) return res.status(404).json({ error: 'Не найден' });
      let isSubscribed = false;
      if (req.user) {
        db.get('SELECT 1 FROM subscriptions WHERE subscriber_id=? AND channel_id=?',
          [req.user.id, user.id], (_e, row) => {
            isSubscribed = !!row;
            res.json({ ...user, isSubscribed });
          });
      } else res.json({ ...user, isSubscribed });
    }
  );
});

// Подписка/отписка
router.post('/:id/subscribe', authRequired, (req, res) => {
  const channelId = req.params.id;
  if (Number(channelId) === req.user.id)
    return res.status(400).json({ error: 'Нельзя подписаться на себя' });

  db.get('SELECT 1 FROM subscriptions WHERE subscriber_id=? AND channel_id=?',
    [req.user.id, channelId], (_e, row) => {
      if (row) {
        db.run('DELETE FROM subscriptions WHERE subscriber_id=? AND channel_id=?',
          [req.user.id, channelId], () => res.json({ subscribed: false }));
      } else {
        db.run('INSERT INTO subscriptions (subscriber_id, channel_id) VALUES (?, ?)',
          [req.user.id, channelId], () => res.json({ subscribed: true }));
      }
    });
});

export default router;