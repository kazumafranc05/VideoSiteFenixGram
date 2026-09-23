import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div className="navbar">
      <Link to="/" className="logo">▶ VideoHost</Link>
      <form className="search" onSubmit={submit}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск" />
        <button type="submit">🔍</button>
      </form>
      <div className="user">
        {user ? (
          <>
            <Link to="/upload" className="btn">Загрузить</Link>
            <Link to="/subscriptions">Подписки</Link>
            <Link to="/history">История</Link>
            <Link to="/studio" className="btn">Студия</Link>
            {user.role === 'admin' && <Link to="/admin">Админ</Link>}
            <Link to={`/channel/${user.id}`}>
              <div className="avatar">{user.username[0].toUpperCase()}</div>
            </Link>
            <button className="btn" onClick={logout}>Выйти</button>
          </>
        ) : (
          <>
            <Link to="/login">Войти</Link>
            <Link to="/register" className="btn primary">Регистрация</Link>
          </>
        )}
      </div>
    </div>
  );
}