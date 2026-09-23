import { useEffect, useState } from 'react';
import api from '../api';
import VideoCard from '../components/VideoCard';

export default function Subscriptions() {
  const [videos, setVideos] = useState([]);
  useEffect(() => {
    api.get('/videos', { params: { subscribed: 1 } }).then((r) => setVideos(r.data));
  }, []);
  return (
    <div className="container">
      <h2 style={{ marginBottom: 20 }}>Подписки</h2>
      {videos.length ? (
        <div className="grid">{videos.map((v) => <VideoCard key={v.id} video={v} />)}</div>
      ) : <div className="empty">Пока нет видео от подписок</div>}
    </div>
  );
}