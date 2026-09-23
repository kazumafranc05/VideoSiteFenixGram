import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import VideoCard from '../components/VideoCard';

export default function Search() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    if (q) api.get('/videos', { params: { search: q } }).then((r) => setVideos(r.data));
  }, [q]);

  return (
    <div className="container">
      <h2 style={{ marginBottom: 20 }}>Результаты: «{q}»</h2>
      {videos.length ? (
        <div className="grid">{videos.map((v) => <VideoCard key={v.id} video={v} />)}</div>
      ) : <div className="empty">Ничего не найдено</div>}
    </div>
  );
}