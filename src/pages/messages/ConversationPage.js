import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeftIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link 
              to="/messages" 
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {peerName ? `Chat with ${peerName}` : 'Conversation'}
              </h1>
              <p className="text-sm text-gray-600">
                {peerName ? 'Send a message to start the conversation' : 'Chat with your tutor/student'}
              </p>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[70vh] flex flex-col">
          {/* Error Message */}
          {error && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 m-4 rounded">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4">
            {messages.map((m) => {
              const isMine = String(m.from._id || m.from) === String(user?._id || '');
              const messageDate = new Date(m.createdAt);
              const now = new Date();
              const isToday = messageDate.toDateString() === now.toDateString();
              
              return (
                <div key={m._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-3`}>
                  <div className={`flex items-end max-w-[80%] ${isMine ? 'flex-row-reverse' : ''}`}>
                    {/* Avatar for received messages only */}
                    {!isMine && (
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center mr-2">
                        <span className="text-white text-xs font-medium">
                          {m.from.firstName?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                    
                    {/* Message Bubble */}
                    <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                      isMine 
                        ? 'bg-green-500 text-white rounded-br-md' 
                        : 'bg-gray-200 text-gray-900 rounded-bl-md'
                    }`}>
                      <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                        {m.content}
                      </div>
                      <div className={`text-xs mt-1 ${
                        isMine ? 'text-green-100' : 'text-gray-500'
                      }`}>
                        {isToday 
                          ? messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : messageDate.toLocaleDateString() + ' ' + messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        }
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {messages.length === 0 && !error && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">💬</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                  <p className="text-gray-600">Say hello to start the conversation! 👋</p>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 p-4">
            <form onSubmit={onSend} className="flex items-end space-x-3">
              <div className="flex-1">
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Type your message..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      onSend(e);
                    }
                  }}
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                />
              </div>
              <button
                type="submit"
                disabled={!content.trim()}
                className="flex items-center justify-center w-12 h-12 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationPage;


