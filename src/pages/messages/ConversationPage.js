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
      // Scroll to bottom of chat container only, not the entire page
      setTimeout(() => {
        if (bottomRef.current) {
          const chatContainer = bottomRef.current.closest('.overflow-y-auto');
          if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }
        }
      }, 100);
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
      // Scroll to bottom after sending message
      setTimeout(() => {
        if (bottomRef.current) {
          const chatContainer = bottomRef.current.closest('.overflow-y-auto');
          if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }
        }
      }, 100);
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to send message.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link 
              to="/messages" 
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {peerName ? `Chat with ${peerName}` : 'Conversation'}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {peerName ? 'Send a message to start the conversation' : 'Chat with your tutor/student'}
              </p>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-[70vh] flex flex-col">
          {/* Error Message */}
          {error && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 p-4 m-4 rounded">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Messages Area with WhatsApp-like background */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f3f4f6' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}>
            {messages.map((m) => {
              // Try multiple ways to compare user IDs
              const fromId = m.from._id || m.from;
              const currentUserId = user?._id || user?.id;
              
              // Try different comparison methods
              let isMine = false;
              if (fromId && currentUserId) {
                isMine = String(fromId) === String(currentUserId);
              }
              
              // Fallback: check if the message was sent by the current user
              // by looking at the message structure
              if (!isMine && m.from && user) {
                isMine = (
                  (m.from._id && user._id && String(m.from._id) === String(user._id)) ||
                  (m.from.id && user.id && String(m.from.id) === String(user.id)) ||
                  (m.from === user._id) ||
                  (m.from === user.id)
                );
              }
              
              const messageDate = new Date(m.createdAt);
              const now = new Date();
              const isToday = messageDate.toDateString() === now.toDateString();
              
              // Debug: Log the message info
              console.log('Message debug:', {
                messageId: m._id,
                fromId: fromId,
                currentUserId: currentUserId,
                userObject: user,
                isMine: isMine,
                content: m.content.substring(0, 20) + '...'
              });
              
              if (isMine) {
                // YOUR MESSAGES - RIGHT SIDE
                return (
                  <div key={m._id} className="w-full flex justify-end mb-4">
                    <div className="max-w-[70%]">
                      <div className="px-4 py-2 rounded-2xl shadow-sm bg-green-500 text-white rounded-br-sm">
                        <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                          {m.content}
                        </div>
                        <div className="flex items-center justify-end mt-1 space-x-1 text-green-100">
                          <span className="text-xs">
                            {isToday 
                              ? messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : messageDate.toLocaleDateString() + ' ' + messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            }
                          </span>
                          <span className="text-xs">✓✓</span>
                          <span className="text-xs bg-green-600 px-1 rounded">You</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              } else {
                // RECIPIENT MESSAGES - LEFT SIDE
                return (
                  <div key={m._id} className="w-full flex justify-start mb-4">
                    <div className="max-w-[70%] flex items-end">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-400 dark:bg-gray-600 rounded-full flex items-center justify-center mr-2 mb-1">
                        <span className="text-white text-xs font-medium">
                          {m.from.firstName?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div className="px-4 py-2 rounded-2xl shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-sm border border-gray-200 dark:border-gray-600">
                        <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                          {m.content}
                        </div>
                        <div className="flex items-center justify-end mt-1 space-x-1 text-gray-500 dark:text-gray-400">
                          <span className="text-xs">
                            {isToday 
                              ? messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : messageDate.toLocaleDateString() + ' ' + messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
            })}
            
            {messages.length === 0 && !error && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">💬</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No messages yet</h3>
                  <p className="text-gray-600 dark:text-gray-400">Say hello to start the conversation! 👋</p>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Message Input - WhatsApp Style */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
            <form onSubmit={onSend} className="flex items-end space-x-3">
              <div className="flex-1">
                <div className="relative">
                  <textarea
                    className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-full resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Type a message..."
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
                  {/* Emoji button placeholder */}
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    😊
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={!content.trim()}
                className="flex items-center justify-center w-12 h-12 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
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


