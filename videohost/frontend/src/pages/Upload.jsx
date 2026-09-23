import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Upload() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', tags: '', category: 'other', visibility: 'public',
  });
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return setError('Выберите файл');
    setError('');
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append('video', file);

    try {
      const { data } = await api.post('/videos', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => setProgress(Math.round((e.loaded * 100) / e.total)),
      });
      nav(`/watch/${data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка загрузки');
    }
  };

  return (
    <form className="form" style={{ maxWidth: 600 }} onSubmit={submit}>
      <h2>Загрузка видео</h2>
      {error && <p style={{ color: '#f66', marginBottom: 12 }}>{error}</p>}

      <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files[0])} required />
      <input placeholder="Название" value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })} required />
      <textarea placeholder="Описание" rows="4" value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <input placeholder="Теги через запятую" value={form.tags}
        onChange={(e) => setForm({ ...form, tags: e.target.value })} />
      <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
        <option value="other">Другое</option>
        <option value="music">Музыка</option>
        <option value="gaming">Игры</option>
        <option value="education">Образование</option>
        <option value="sport">Спорт</option>
        <option value="tech">Технологии</option>
        <option value="news">Новости</option>
      </select>
      <select value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value })}>
        <option value="public">Публичное</option>
        <option value="private">Приватное</option>
      </select>

      {progress > 0 && (
        <div className="progress"><div style={{ width: `${progress}%` }} /></div>
      )}

      <button className="btn primary" type="submit">Опубликовать</button>
    </form>
  );
}