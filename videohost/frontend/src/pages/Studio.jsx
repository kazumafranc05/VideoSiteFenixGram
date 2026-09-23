import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['music', 'gaming', 'education', 'sport', 'tech', 'news', 'other'];

export default function Studio() {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    api.get('/videos/my/list').then((r) => setVideos(r.data));
  };

  useEffect(load, []);

  const startEdit = (video) => {
    setEditing({ ...video });
    setMessage('');
    setError('');
  };

  const cancelEdit = () => setEditing(null);

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      await api.put(`/videos/${editing.id}`, {
        title: editing.title,
        description: editing.description,
        tags: editing.tags,
        category: editing.category,
        visibility: editing.visibility,
      });
      setMessage('Изменения сохранены');
      setEditing(null);
      load();
    } catch (e) {
      setError(e.response?.data?.error || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id, title) => {
    if (!confirm(`Удалить видео «${title}»? Действие необратимо.`)) return;
    try {
      await api.delete(`/videos/${id}`);
      setVideos(videos.filter((v) => v.id !== id));
      setMessage('Видео удалено');
    } catch (e) {
      setError(e.response?.data?.error || 'Ошибка удаления');
    }
  };

  if (!user) return null;

  return (
    <div className="container">
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <h2 style={{ flex: 1 }}>Студия — {user.username}</h2>
        <Link to="/upload" className="btn primary">+ Загрузить видео</Link>
      </div>

      {message && <p style={{ color: '#6f6', marginBottom: 12 }}>{message}</p>}
      {error && <p style={{ color: '#f66', marginBottom: 12 }}>{error}</p>}

      {videos.length === 0 ? (
        <div className="empty">
          У вас пока нет видео. <Link to="/upload" style={{ color: '#3ea6ff' }}>Загрузите первое</Link>.
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #333', textAlign: 'left' }}>
              <th style={{ padding: 10 }}>Видео</th>
              <th style={{ padding: 10 }}>Статус</th>
              <th style={{ padding: 10 }}>Просмотры</th>
              <th style={{ padding: 10 }}>👍 / 👎</th>
              <th style={{ padding: 10 }}>💬</th>
              <th style={{ padding: 10 }}>Дата</th>
              <th style={{ padding: 10 }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((v) => (
              <tr key={v.id} style={{ borderBottom: '1px solid #222' }}>
                <td style={{ padding: 10, maxWidth: 320 }}>
                  <Link to={`/watch/${v.id}`} style={{ color: '#fff' }}>
                    <b>{v.title}</b>
                  </Link>
                  <div style={{ fontSize: 12, color: '#888' }}>
                    {v.category} • {v.tags || 'без тегов'}
                  </div>
                </td>
                <td style={{ padding: 10 }}>
                  {v.visibility === 'public' ? '🌐 Публичное' : '🔒 Приватное'}
                </td>
                <td style={{ padding: 10 }}>{v.views}</td>
                <td style={{ padding: 10 }}>{v.likes} / {v.dislikes}</td>
                <td style={{ padding: 10 }}>{v.comments}</td>
                <td style={{ padding: 10, fontSize: 12, color: '#aaa' }}>
                  {new Date(v.created_at).toLocaleDateString('ru')}
                </td>
                <td style={{ padding: 10, whiteSpace: 'nowrap' }}>
                  <button className="btn" onClick={() => startEdit(v)}>Редактировать</button>
                  <button
                    className="btn danger"
                    style={{ marginLeft: 8 }}
                    onClick={() => remove(v.id, v.title)}
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editing && (
        <div
          onClick={cancelEdit}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 100, padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#1a1a1a', padding: 24, borderRadius: 12,
              width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto',
            }}
          >
            <h3 style={{ marginBottom: 16 }}>Редактировать видео</h3>

            <label style={{ fontSize: 12, color: '#aaa' }}>Название</label>
            <input
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              style={{
                width: '100%', padding: 10, marginBottom: 12,
                background: '#121212', border: '1px solid #333',
                borderRadius: 8, color: '#fff',
              }}
            />

            <label style={{ fontSize: 12, color: '#aaa' }}>Описание</label>
            <textarea
              rows={4}
              value={editing.description}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              style={{
                width: '100%', padding: 10, marginBottom: 12,
                background: '#121212', border: '1px solid #333',
                borderRadius: 8, color: '#fff', resize: 'vertical',
              }}
            />

            <label style={{ fontSize: 12, color: '#aaa' }}>Теги (через запятую)</label>
            <input
              value={editing.tags}
              onChange={(e) => setEditing({ ...editing, tags: e.target.value })}
              style={{
                width: '100%', padding: 10, marginBottom: 12,
                background: '#121212', border: '1px solid #333',
                borderRadius: 8, color: '#fff',
              }}
            />

            <label style={{ fontSize: 12, color: '#aaa' }}>Категория</label>
            <select
              value={editing.category}
              onChange={(e) => setEditing({ ...editing, category: e.target.value })}
              style={{
                width: '100%', padding: 10, marginBottom: 12,
                background: '#121212', border: '1px solid #333',
                borderRadius: 8, color: '#fff',
              }}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <label style={{ fontSize: 12, color: '#aaa' }}>Видимость</label>
            <select
              value={editing.visibility}
              onChange={(e) => setEditing({ ...editing, visibility: e.target.value })}
              style={{
                width: '100%', padding: 10, marginBottom: 16,
                background: '#121212', border: '1px solid #333',
                borderRadius: 8, color: '#fff',
              }}
            >
              <option value="public">Публичное</option>
              <option value="private">Приватное</option>
            </select>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn" onClick={cancelEdit} disabled={saving}>Отмена</button>
              <button className="btn primary" onClick={save} disabled={saving}>
                {saving ? 'Сохранение…' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}