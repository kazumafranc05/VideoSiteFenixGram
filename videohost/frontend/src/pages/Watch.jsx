import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api';
import CommentSection from '../components/CommentSection';
import { useAuth } from '../context/AuthContext';

export default function Watch() {
  const { id } = useParams();
  const { user } = useAuth();
  const [video, setVideo] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    api.get(`/videos/${id}`).then((r) => {
      setVideo(r.data);
      api.get('/videos').then((rr) => setRecommended(rr.data.filter((v) => v.id !== Number(id)).slice(0, 8)));
      api.get(`/users/${r.data.user_id}`).then((rr) => setSubscribed(rr.data.isSubscribed));
    });
  }, [id]);

  const like = async (value) => {
    if (!user) return alert('Войдите');
    const { data } = await api.post('/comments/like', { video_id: video.id, value });
    setVideo((v) => ({
      ...v,
      userLike: data.userLike,
      likes: v.likes + (data.userLike === 1 && v.userLike !== 1 ? 1 : 0) - (v.userLike === 1 && data.userLike !== 1 ? 1 : 0),
      dislikes: v.dislikes + (data.userLike === -1 && v.userLike !== -1 ? 1 : 0) - (v.userLike === -1 && data.userLike !== -1 ? 1 : 0),
    }));
  };

  const toggleSubscribe = async () => {
    if (!user) return alert('Войдите');
    const { data } = await api.post(`/users/${video.user_id}/subscribe`);
    setSubscribed(data.subscribed);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Ссылка скопирована');
  };

  if (!video) return <div className="container">Загрузка...</div>;

  return (
    <div className="container watch">
      <div>
        <div className="player">
          <video
  src={`${import.meta.env.VITE_API_URL || ''}/uploads/videos/${video.filename}`}
  controls
  autoPlay
/>
        </div>

        <div className="video-header">
          <h1>{video.title}</h1>
          <div className="video-actions">
            <div className="likes">
              <button onClick={() => like(1)}>
                👍 {video.likes} {video.userLike === 1 && '✓'}
              </button>
              <button onClick={() => like(-1)}>
                👎 {video.dislikes} {video.userLike === -1 && '✓'}
              </button>
            </div>
            <button className="btn" onClick={copyLink}>Поделиться</button>
            <span style={{ color: '#888' }}>{video.views} просмотров</span>
          </div>
        </div>
		
		{user && (user.id === video.user_id || user.role === 'admin') && (
  <>
    <Link to="/studio" className="btn">Редактировать</Link>
    <button
      className="btn danger"
      onClick={async () => {
        if (!confirm(`Удалить «${video.title}»?`)) return;
        await api.delete(`/videos/${video.id}`);
        nav('/studio');
      }}
    >
      Удалить
    </button>
  </>
)}

        <div className="channel-row">
          <Link to={`/channel/${video.user_id}`}>
            <div className="avatar">{video.username[0].toUpperCase()}</div>
          </Link>
          <div style={{ flex: 1 }}>
            <Link to={`/channel/${video.user_id}`}><b>{video.username}</b></Link>
          </div>
          <button className={subscribed ? 'btn' : 'btn primary'} onClick={toggleSubscribe}>
            {subscribed ? 'Отписаться' : 'Подписаться'}
          </button>
        </div>

        <div style={{ padding: 12, background: '#1a1a1a', borderRadius: 10, fontSize: 14, whiteSpace: 'pre-wrap' }}>
          {video.description || 'Без описания'}
        </div>

        <CommentSection videoId={video.id} />
      </div>

      <div>
        <h3 style={{ marginBottom: 12 }}>Похожие видео</h3>
        {recommended.map((v) => (
          <Link to={`/watch/${v.id}`} key={v.id} className="sidebar-video">
            <div className="thumb">▶</div>
            <div>
              <div className="title">{v.title}</div>
              <div className="meta">{v.username} • {v.views} просм.</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
