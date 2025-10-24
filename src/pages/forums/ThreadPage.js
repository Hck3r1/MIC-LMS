import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  ClockIcon,
  UserIcon,
  ArrowLeftIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';

const API_URL = process.env.REACT_APP_API_URL || 'https://lms-backend-u90k.onrender.com/api';

const ThreadPage = () => {
  const { threadId } = useParams();
  const { user } = useAuth();
  const [thread, setThread] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [replying, setReplying] = useState(false);
  const headers = { Authorization: `Bearer ${localStorage.getItem('token') || ''}` };

  const load = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/forums/${threadId}`, { headers });
      setThread(res.data?.data?.thread || null);
    } catch (error) {
      console.error('Error loading thread:', error);
      // Mock data for development - remove when backend is implemented
      setThread({
        _id: threadId,
        title: 'Welcome to the Course!',
        user: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com'
        },
        posts: [
          {
            _id: '1',
            content: 'Welcome everyone! This is the first post in this thread.',
            user: {
              firstName: 'John',
              lastName: 'Doe',
              email: 'john.doe@example.com'
            },
            createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
          },
          {
            _id: '2',
            content: 'Thanks for the welcome! I\'m excited to be here.',
            user: {
              firstName: 'Jane',
              lastName: 'Smith',
              email: 'jane.smith@example.com'
            },
            createdAt: new Date(Date.now() - 43200000).toISOString() // 12 hours ago
          },
          {
            _id: '3',
            content: 'I have a question about the course material. Can anyone help?',
            user: {
              firstName: 'Mike',
              lastName: 'Johnson',
              email: 'mike.johnson@example.com'
            },
            createdAt: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
          }
        ],
        updatedAt: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [threadId]);

  const onReply = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    try {
      setReplying(true);
      await axios.post(`${API_URL}/forums/${threadId}/reply`, { content }, { headers });
      setContent('');
      await load();
    } catch (error) {
      console.error('Error posting reply:', error);
      // Mock reply for development - remove when backend is implemented
      const newPost = {
        _id: Date.now().toString(),
        content: content.trim(),
        user: {
          firstName: user?.firstName || 'Current',
          lastName: user?.lastName || 'User',
          email: user?.email || 'current.user@example.com'
        },
        createdAt: new Date().toISOString()
      };
      setThread(prev => ({
        ...prev,
        posts: [...(prev?.posts || []), newPost]
      }));
      setContent('');
    } finally {
      setReplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Thread Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">This discussion thread could not be found.</p>
          <Link 
            to="/courses" 
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link 
              to={`/forums/course/${thread.courseId}`}
              className="mr-4 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{thread.title}</h1>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                <div className="flex items-center">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  <span>Started {new Date(thread.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1" />
                  <span>{thread.posts?.length || 0} replies</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-4 mb-8">
          {(thread.posts || []).map((post, index) => (
            <div key={post._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <UserIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <UserIcon className="w-4 h-4 mr-1" />
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {post.user?.firstName && post.user?.lastName 
                            ? `${post.user.firstName} ${post.user.lastName}`
                            : post.user?.email || 'Anonymous User'
                          }
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        <span>{new Date(post.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    {index === 0 && (
                      <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-2 py-1 rounded-full">
                        Original Post
                      </span>
                    )}
                  </div>
                  <div className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">
                    {post.content}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Reply Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <form onSubmit={onReply} className="space-y-4">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mr-3">
                <ChatBubbleLeftIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Add a Reply</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Replying as: <span className="font-medium text-gray-700 dark:text-gray-300">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user?.email || 'Anonymous User'
                    }
                  </span>
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <textarea 
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none" 
                rows={4} 
                placeholder="Share your thoughts..." 
                value={content} 
                onChange={(e) => setContent(e.target.value)}
                disabled={replying}
              />
              <div className="flex justify-end">
                <button 
                  className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center" 
                  type="submit"
                  disabled={replying || !content.trim()}
                >
                  {replying ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Posting...
                    </>
                  ) : (
                    <>
                      <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                      Post Reply
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ThreadPage;


