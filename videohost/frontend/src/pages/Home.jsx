import { useEffect, useState } from 'react';
import api from '../api';
import VideoCard from '../components/VideoCard';

const CATEGORIES = ['all', 'music', 'gaming', 'education', 'sport', 'tech', 'news', 'other'];

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [category, setCategory] = useState('all');

  useEffect(() => {
    api.get('/videos', { params: { category } }).then((r) => setVideos(r.data));
  }, [category]);

  return (
    <div className="container">
      <div className="tabs">
        {CATEGORIES.map((c) => (
          <button key={c} className={category === c ? 'active' : ''} onClick={() => setCategory(c)}>
            {c === 'all' ? 'Все' : c}
          </button>
        ))}
      </div>
      {videos.length === 0 ? (
        <div className="empty">Пока нет видео. Загрузите первое!</div>
      ) : (
        <div className="grid">
          {videos.map((v) => <VideoCard key={v.id} video={v} />)}
        </div>
      )}
    </div>
  );
}