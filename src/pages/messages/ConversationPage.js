import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'https://lms-backend-u90k.onrender.com/api';

const ConversationPage = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const peerName = new URLSearchParams(window.location.search).get('name');
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const bottomRef = useRef(null);
  const headers = { Authorization: `Bearer ${localStorage.getItem('token') || ''}` };

  const load = async () => {
    try {
      setError('');
      const res = await axios.get(`${API_URL}/messages/with/${userId}`, { headers });
      setMessages(res.data?.data?.messages || []);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
    } catch (e) {
      // Gracefully handle routes not available yet
      setMessages([]);
      setError(e.response?.data?.message || 'Unable to load messages.');
    }
  };

  useEffect(() => { load(); }, [userId]);

  const onSend = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      setError('');
      await axios.post(`${API_URL}/messages`, { to: userId, content }, { headers });
      setContent('');
      await load();
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to send message.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{peerName ? `Chat with ${peerName}` : 'Conversation'}</h1>
            <p className="muted">{peerName ? '' : 'Chat with your tutor/student'}</p>
          </div>
          <Link to="/messages" className="btn-outline text-sm">All Messages</Link>
        </div>

        <div className="card h-[65vh] flex flex-col">
          {error && <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded mb-3 text-sm">{error}</div>}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {messages.map((m) => {
              const isMine = String(m.from) === String(user?._id || '');
              return (
                <div key={m._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  {!isMine && (
                    <div className="avatar mr-2">
                      <span className="text-xs text-gray-600">{(userId || '').slice(0,2).toUpperCase()}</span>
                    </div>
                  )}
                  <div className={`max-w-[75%] px-3 py-2 rounded-2xl shadow-sm ${isMine ? 'bg-primary-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                    <div className="whitespace-pre-wrap break-words text-sm">{m.content}</div>
                    {m.createdAt && (<div className={`text-[10px] mt-1 opacity-75 ${isMine ? 'text-white' : 'text-gray-600'}`}>{new Date(m.createdAt).toLocaleTimeString()}</div>)}
                  </div>
                </div>
              );
            })}
            {messages.length === 0 && !error && (
              <div className="muted text-center mt-8">No messages yet. Say hello 👋</div>
            )}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={onSend} className="mt-3 flex gap-2 border-t pt-3">
            <input className="input-field flex-1" placeholder="Type a message" value={content} onChange={(e) => setContent(e.target.value)} />
            <button className="btn-primary" type="submit">Send</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ConversationPage;


