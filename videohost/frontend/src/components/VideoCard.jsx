import { Link } from 'react-router-dom';

export default function VideoCard({ video }) {
  const formatDate = (d) => new Date(d).toLocaleDateString('ru');
  return (
    <Link to={`/watch/${video.id}`} className="card">
      <div className="thumb">▶</div>
      <div className="info">
        <div className="title">{video.title}</div>
        <div className="meta">
          {video.username} • {video.views} просмотров • {formatDate(video.created_at)}
        </div>
      </div>
    </Link>
  );
}