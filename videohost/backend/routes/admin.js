import express from 'express';
import db from '../db.js';
import { adminRequired } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', adminRequired, (_req, res) => {
  const stats = {};
  db.get('SELECT COUNT(*) AS c FROM users', (_e, r) => {
    stats.users = r.c;
    db.get('SELECT COUNT(*) AS c FROM videos', (_e2, r2) => {
      stats.videos = r2.c;
      db.get('SELECT COUNT(*) AS c FROM comments', (_e3, r3) => {
        stats.comments = r3.c;
        db.get('SELECT SUM(views) AS c FROM videos', (_e4, r4) => {
          stats.views = r4.c || 0;
          res.json(stats);
        });
      });
    });
  });
});

router.get('/users', adminRequired, (_req, res) => {
  db.all('SELECT id, username, email, role, created_at FROM users ORDER BY id', (_e, rows) => res.json(rows));
});

router.post('/users/:id/role', adminRequired, (req, res) => {
  db.run('UPDATE users SET role=? WHERE id=?', [req.body.role, req.params.id], () => res.json({ ok: true }));
});

router.delete('/users/:id', adminRequired, (req, res) => {
  db.run('DELETE FROM users WHERE id=?', [req.params.id], () => res.json({ ok: true }));
});

export default router;