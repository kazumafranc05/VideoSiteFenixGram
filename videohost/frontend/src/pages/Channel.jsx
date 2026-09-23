import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import VideoCard from '../components/VideoCard';
import { useAuth } from '../context/AuthContext';

export default function Channel() {
  const { id } = useParams();
  const { user } = useAuth();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);

  const load = () => {
    api.get(`/users/${id}`).then((r) => setChannel(r.data));
    api.get('/videos', { params: { userId: id } }).then((r) => setVideos(r.data));
  };
  useEffect(load, [id]);

  const toggleSubscribe = async () => {
    if (!user) return alert('Войдите');
    await api.post(`/users/${id}/subscribe`);
    load();
  };

  if (!channel) return <div className="container">Загрузка...</div>;

  return (
    <div className="container">
      <div className="channel-row">
        <div className="avatar" style={{ width: 80, height: 80, fontSize: 32 }}>
          {channel.username[0].toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <h2>{channel.username}</h2>
          <div style={{ color: '#888' }}>
            {channel.subscribers} подписчиков • {channel.videoCount} видео
          </div>
        </div>
        {user?.id !== Number(id) && (
          <button className={channel.isSubscribed ? 'btn' : 'btn primary'} onClick={toggleSubscribe}>
            {channel.isSubscribed ? 'Отписаться' : 'Подписаться'}
          </button>
        )}
      </div>
      {videos.length ? (
        <div className="grid">
          {videos.map((v) => <VideoCard key={v.id} video={v} />)}
        </div>
      ) : <div className="empty">Нет видео</div>}
    </div>
  );
}