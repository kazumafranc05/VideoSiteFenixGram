import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.user);
      nav('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка входа');
    }
  };

  return (
    <form className="form" onSubmit={submit}>
      <h2>Вход</h2>
      {error && <p style={{ color: '#f66', marginBottom: 12 }}>{error}</p>}
      <input type="email" placeholder="Email" value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })} required />
      <input type="password" placeholder="Пароль" value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })} required />
      <button className="btn primary">Войти</button>
      <p style={{ marginTop: 16, textAlign: 'center', color: '#888' }}>
        Нет аккаунта? <Link to="/register" style={{ color: '#3ea6ff' }}>Регистрация</Link>
      </p>
    </form>
  );
}