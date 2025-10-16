import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'https://lms-backend-u90k.onrender.com/api';

const ConversationPage = () => {
  const { userId } = useParams();
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const bottomRef = useRef(null);
  const headers = { Authorization: `Bearer ${localStorage.getItem('token') || ''}` };

  const load = async () => {
    const res = await axios.get(`${API_URL}/messages/with/${userId}`, { headers });
    setMessages(res.data?.data?.messages || []);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
  };

  useEffect(() => { load(); }, [userId]);

  const onSend = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    await axios.post(`${API_URL}/messages`, { to: userId, content }, { headers });
    setContent('');
    await load();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Conversation</h1>
        <p className="muted mb-4">Chat with your tutor/student</p>
        <div className="card h-[60vh] overflow-y-auto">
          {messages.map((m) => (
            <div key={m._id} className={`py-2 ${m.from === userId ? '' : 'text-right'}`}>
              <div className={`inline-block px-3 py-2 rounded-lg ${m.from === userId ? 'bg-gray-100 text-gray-800' : 'bg-primary-100 text-primary-900'}`}>{m.content}</div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={onSend} className="mt-3 flex gap-2">
          <input className="input-field flex-1" placeholder="Type a message" value={content} onChange={(e) => setContent(e.target.value)} />
          <button className="btn-primary" type="submit">Send</button>
        </form>
      </div>
    </div>
  );
};

export default ConversationPage;


