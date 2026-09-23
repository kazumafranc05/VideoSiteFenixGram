import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    if (user && user.role !== 'admin') nav('/');
    api.get('/admin/stats').then((r) => setStats(r.data));
    api.get('/admin/users').then((r) => setUsers(r.data));
    api.get('/videos').then((r) => setVideos(r.data));
  }, [user]);

  const setRole = async (id, role) => {
    await api.post(`/admin/users/${id}/role`, { role });
    api.get('/admin/users').then((r) => setUsers(r.data));
  };

  const removeUser = async (id) => {
    if (!confirm('Удалить пользователя?')) return;
    await api.delete(`/admin/users/${id}`);
    api.get('/admin/users').then((r) => setUsers(r.data));
  };

  const removeVideo = async (id) => {
    if (!confirm('Удалить видео?')) return;
    await api.delete(`/videos/${id}`);
    setVideos(videos.filter((v) => v.id !== id));
  };

  return (
    <div className="container">
      <h2 style={{ marginBottom: 20 }}>Админ-панель</h2>

      {stats && (
        <div className="grid" style={{ marginBottom: 30, gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))' }}>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 32, fontWeight: 'bold' }}>{stats.users}</div>
            <div style={{ color: '#888' }}>Пользователей</div>
          </div>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 32, fontWeight: 'bold' }}>{stats.videos}</div>
            <div style={{ color: '#888' }}>Видео</div>
          </div>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 32, fontWeight: 'bold' }}>{stats.comments}</div>
            <div style={{ color: '#888' }}>Комментариев</div>
          </div>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 32, fontWeight: 'bold' }}>{stats.views}</div>
            <div style={{ color: '#888' }}>Просмотров</div>
          </div>
        </div>
      )}

      <h3 style={{ marginBottom: 12 }}>Пользователи</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 30 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #333', textAlign: 'left' }}>
            <th style={{ padding: 8 }}>ID</th>
            <th style={{ padding: 8 }}>Имя</th>
            <th style={{ padding: 8 }}>Email</th>
            <th style={{ padding: 8 }}>Роль</th>
            <th style={{ padding: 8 }}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} style={{ borderBottom: '1px solid #222' }}>
              <td style={{ padding: 8 }}>{u.id}</td>
              <td style={{ padding: 8 }}>{u.username}</td>
              <td style={{ padding: 8 }}>{u.email}</td>
              <td style={{ padding: 8 }}>{u.role}</td>
              <td style={{ padding: 8 }}>
                <button className="btn" onClick={() => setRole(u.id, u.role === 'admin' ? 'user' : 'admin')}>
                  {u.role === 'admin' ? 'Снять админа' : 'Сделать админом'}
                </button>
                <button className="btn danger" style={{ marginLeft: 8 }} onClick={() => removeUser(u.id)}>Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ marginBottom: 12 }}>Видео</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #333', textAlign: 'left' }}>
            <th style={{ padding: 8 }}>ID</th>
            <th style={{ padding: 8 }}>Название</th>
            <th style={{ padding: 8 }}>Автор</th>
            <th style={{ padding: 8 }}>Просмотры</th>
            <th style={{ padding: 8 }}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {videos.map((v) => (
            <tr key={v.id} style={{ borderBottom: '1px solid #222' }}>
              <td style={{ padding: 8 }}>{v.id}</td>
              <td style={{ padding: 8 }}>{v.title}</td>
              <td style={{ padding: 8 }}>{v.username}</td>
              <td style={{ padding: 8 }}>{v.views}</td>
              <td style={{ padding: 8 }}>
                <button className="btn danger" onClick={() => removeVideo(v.id)}>Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}