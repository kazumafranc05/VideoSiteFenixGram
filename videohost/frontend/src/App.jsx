import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Watch from './pages/Watch';
import Upload from './pages/Upload';
import Channel from './pages/Channel';
import Search from './pages/Search';
import Subscriptions from './pages/Subscriptions';
import History from './pages/History';
import Admin from './pages/Admin';
import { useAuth } from './context/AuthContext';
import Studio from './pages/Studio';

function Private({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="container">Загрузка...</div>;
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/watch/:id" element={<Watch />} />
        <Route path="/upload" element={<Private><Upload /></Private>} />
        <Route path="/channel/:id" element={<Channel />} />
        <Route path="/search" element={<Search />} />
        <Route path="/subscriptions" element={<Private><Subscriptions /></Private>} />
        <Route path="/history" element={<Private><History /></Private>} />
        <Route path="/admin" element={<Private><Admin /></Private>} />
        <Route path="/studio" element={<Private><Studio /></Private>} />
      </Routes>
    </>
  );
}