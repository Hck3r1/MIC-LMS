import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://lms-backend-u90k.onrender.com/api';

const ThreadPage = () => {
  const { threadId } = useParams();
  const [thread, setThread] = useState(null);
  const [content, setContent] = useState('');
  const headers = { Authorization: `Bearer ${localStorage.getItem('token') || ''}` };

  const load = async () => {
    const res = await axios.get(`${API_URL}/forums/${threadId}`, { headers });
    setThread(res.data?.data?.thread || null);
  };

  useEffect(() => { load(); }, [threadId]);

  const onReply = async (e) => {
    e.preventDefault();
    await axios.post(`${API_URL}/forums/${threadId}/reply`, { content }, { headers });
    setContent('');
    await load();
  };

  if (!thread) return <div className="p-6">Loading…</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{thread.title}</h1>
        <div className="card">
          {(thread.posts || []).map((p) => (
            <div key={p._id} className="py-3 border-b last:border-none">
              <div className="text-sm text-gray-600">{new Date(p.createdAt).toLocaleString()}</div>
              <div className="text-gray-800 whitespace-pre-wrap">{p.content}</div>
            </div>
          ))}
        </div>
        <form onSubmit={onReply} className="card mt-4 space-y-3">
          <textarea className="input-field" rows={4} placeholder="Write a reply…" value={content} onChange={(e) => setContent(e.target.value)} />
          <div className="flex justify-end"><button className="btn-primary" type="submit">Reply</button></div>
        </form>
      </div>
    </div>
  );
};

export default ThreadPage;


