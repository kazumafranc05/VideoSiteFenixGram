import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/register', form);
      login(data.token, data.user);
      nav('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка регистрации');
    }
  };

  return (
    <form className="form" onSubmit={submit}>
      <h2>Регистрация</h2>
      {error && <p style={{ color: '#f66', marginBottom: 12 }}>{error}</p>}
      <input placeholder="Имя пользователя" value={form.username}
        onChange={(e) => setForm({ ...form, username: e.target.value })} required />
      <input type="email" placeholder="Email" value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })} required />
      <input type="password" placeholder="Пароль (мин. 6)" value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
      <button className="btn primary">Создать аккаунт</button>
      <p style={{ marginTop: 16, textAlign: 'center', color: '#888' }}>
        Уже есть аккаунт? <Link to="/login" style={{ color: '#3ea6ff' }}>Войти</Link>
      </p>
    </form>
  );
}