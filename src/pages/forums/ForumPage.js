import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://lms-backend-u90k.onrender.com/api';

const ForumPage = () => {
  const { courseId } = useParams();
  const [threads, setThreads] = useState([]);
  const [title, setTitle] = useState('');
  const headers = { Authorization: `Bearer ${localStorage.getItem('token') || ''}` };

  const load = async () => {
    const res = await axios.get(`${API_URL}/forums/course/${courseId}`, { headers });
    setThreads(res.data?.data?.threads || []);
  };

  useEffect(() => { load(); }, [courseId]);

  const onCreate = async (e) => {
    e.preventDefault();
    await axios.post(`${API_URL}/forums`, { courseId, title }, { headers });
    setTitle('');
    await load();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Course Forum</h1>
        <p className="muted mb-4">Start a discussion or join existing threads</p>
        <form onSubmit={onCreate} className="card mb-6 flex gap-2">
          <input className="input-field flex-1" placeholder="Start a discussion..." value={title} onChange={(e) => setTitle(e.target.value)} />
          <button className="btn-primary" type="submit">Post</button>
        </form>
        <div className="space-y-3">
          {threads.map(t => (
            <a key={t._id} className="card block hover:bg-gray-50" href={`/forums/thread/${t._id}`}>
              <div className="text-gray-900 font-medium">{t.title}</div>
              <div className="text-xs text-gray-500">Updated {new Date(t.updatedAt).toLocaleString()}</div>
            </a>
          ))}
          {threads.length === 0 && <div className="text-sm text-center muted">No threads yet.</div>}
        </div>
      </div>
    </div>
  );
};

export default ForumPage;


