import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://lms-backend-u90k.onrender.com/api';

const MessagesPage = () => {
  const [convos, setConvos] = useState([]);
  const headers = { Authorization: `Bearer ${localStorage.getItem('token') || ''}` };

  useEffect(() => {
    const load = async () => {
      const res = await axios.get(`${API_URL}/messages/conversations`, { headers });
      setConvos(res.data?.data?.conversations || []);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Messages</h1>
        <div className="space-y-3">
          {convos.map(c => (
            <a key={c._id} className="card block hover:bg-gray-50" href={`/messages/with/${c._id}`}>
              <div className="text-gray-900 font-medium">Conversation</div>
              <div className="text-xs text-gray-500">Last activity {new Date(c.last).toLocaleString()}</div>
            </a>
          ))}
          {convos.length === 0 && <div className="text-sm text-gray-600">No conversations yet.</div>}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;


