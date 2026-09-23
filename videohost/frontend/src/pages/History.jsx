import { useEffect, useState } from 'react';
import api from '../api';
import VideoCard from '../components/VideoCard';

export default function History() {
  const [videos, setVideos] = useState([]);
  useEffect(() => { api.get('/users/history').then((r) => setVideos(r.data)); }, []);
  return (
    <div className="container">
      <h2 style={{ marginBottom: 20 }}>История просмотров</h2>
      {videos.length ? (
        <div className="grid">{videos.map((v) => <VideoCard key={v.id} video={v} />)}</div>
      ) : <div className="empty">История пуста</div>}
    </div>
  );
}