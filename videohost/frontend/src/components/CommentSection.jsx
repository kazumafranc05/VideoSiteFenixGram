import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function CommentSection({ videoId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const load = () => api.get(`/comments/video/${videoId}`).then((r) => setComments(r.data));

  useEffect(() => { load(); }, [videoId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await api.post('/comments', { video_id: videoId, text });
    setText('');
    load();
  };

  const submitReply = async (parentId) => {
    if (!replyText.trim()) return;
    await api.post('/comments', { video_id: videoId, text: replyText, parent_id: parentId });
    setReplyText('');
    setReplyTo(null);
    load();
  };

  const remove = async (id) => {
    if (!confirm('Удалить комментарий?')) return;
    await api.delete(`/comments/${id}`);
    load();
  };

  const roots = comments.filter((c) => !c.parent_id);
  const repliesOf = (id) => comments.filter((c) => c.parent_id === id);

  const renderComment = (c, isReply = false) => (
    <div className="comment" key={c.id} style={isReply ? { marginLeft: 44 } : {}}>
      <div className="head">
        <div className="avatar">{c.username[0].toUpperCase()}</div>
        <b>{c.username}</b>
        <span>{new Date(c.created_at).toLocaleString('ru')}</span>
      </div>
      <div className="text">{c.text}</div>
      <div className="actions">
        {user && !isReply && (
          <button onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}>Ответить</button>
        )}
        {user && (user.id === c.user_id || user.role === 'admin') && (
          <button onClick={() => remove(c.id)}>Удалить</button>
        )}
      </div>
      {replyTo === c.id && (
        <div style={{ marginTop: 10, marginLeft: 44 }}>
          <input
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Ответ..."
            style={{ width: '100%', padding: 8, background: '#121212', border: '1px solid #333', color: '#fff', borderRadius: 6 }}
          />
          <button className="btn primary" style={{ marginTop: 6 }} onClick={() => submitReply(c.id)}>Отправить</button>
        </div>
      )}
      {repliesOf(c.id).map((r) => renderComment(r, true))}
    </div>
  );

  return (
    <div>
      <h3 style={{ marginBottom: 12 }}>{comments.length} комментариев</h3>
      {user ? (
        <form className="comment-form" onSubmit={submit}>
          <div className="avatar">{user.username[0].toUpperCase()}</div>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Оставьте комментарий..." />
          <button className="btn primary" type="submit">Отправить</button>
        </form>
      ) : (
        <p style={{ color: '#888', marginBottom: 16 }}>
          <a href="/login" style={{ color: '#3ea6ff' }}>Войдите</a>, чтобы оставить комментарий.
        </p>
      )}
      {roots.map((c) => renderComment(c))}
    </div>
  );
}