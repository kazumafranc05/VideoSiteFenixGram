import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import authRoutes from './routes/auth.js';
import videoRoutes from './routes/videos.js';
import commentRoutes from './routes/comments.js';
import userRoutes from './routes/users.js';
import adminRoutes from './routes/admin.js';
import db from './db.js';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json());

// Статика
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Создаём админа при первом запуске
const ADMIN_EMAILS = [
  'admin@videohost.local',
  'svyatoslavk0111@gmail.com',           // ← впишите email, которому нужны права
];

(async () => {
  const hash = await bcrypt.hash('admin123', 10);

  // Гарантируем существование основного админа
  db.run(
    'INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
    ['admin', 'admin@videohost.local', hash, 'admin']
  );

  // Повышаем указанные email до админа при каждом старте
  for (const email of ADMIN_EMAILS) {
    db.run("UPDATE users SET role='admin' WHERE email=?", [email], function (err) {
      if (err) return console.error('Ошибка повышения прав:', err.message);
      if (this.changes > 0) console.log(`✅ ${email} повышен до администратора`);
    });
  }
})();

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Backend на http://localhost:${PORT}`));
