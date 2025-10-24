import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import {
  ChatBubbleLeftRightIcon,
  PlusIcon,
  ClockIcon,
  UserIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const API_URL = process.env.REACT_APP_API_URL || 'https://lms-backend-u90k.onrender.com/api';

const ForumPage = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const headers = { Authorization: `Bearer ${localStorage.getItem('token') || ''}` };

  const load = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/forums/course/${courseId}`, { headers });
      setThreads(res.data?.data?.threads || []);
    } catch (error) {
      console.error('Error loading threads:', error);
      // Mock data for development - remove when backend is implemented
      setThreads([
        {
          _id: '1',
          title: 'Welcome to the Course!',
          user: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com'
          },
          posts: [
            { _id: '1', content: 'Welcome everyone!', createdAt: new Date().toISOString() }
          ],
          updatedAt: new Date().toISOString()
        },
        {
          _id: '2',
          title: 'Question about Assignment 1',
          user: {
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com'
          },
          posts: [
            { _id: '2', content: 'I have a question about the first assignment...', createdAt: new Date().toISOString() }
          ],
          updatedAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [courseId]);

  const onCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    try {
      setPosting(true);
      await axios.post(`${API_URL}/forums`, { courseId, title }, { headers });
      setTitle('');
      await load();
    } catch (error) {
      console.error('Error creating thread:', error);
      // Mock creation for development - remove when backend is implemented
      const newThread = {
        _id: Date.now().toString(),
        title: title.trim(),
        user: {
          firstName: user?.firstName || 'Current',
          lastName: user?.lastName || 'User',
          email: user?.email || 'current.user@example.com'
        },
        posts: [],
        updatedAt: new Date().toISOString()
      };
      setThreads(prev => [newThread, ...prev]);
      setTitle('');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link 
              to="/courses" 
              className="mr-4 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Course Forum</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Start a discussion or join existing threads</p>
            </div>
          </div>
        </div>

        {/* Create Thread Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <form onSubmit={onCreate} className="space-y-4">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mr-3">
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Start a New Discussion</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Posting as: <span className="font-medium text-gray-700 dark:text-gray-300">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user?.email || 'Anonymous User'
                    }
                  </span>
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <input 
                className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200" 
                placeholder="What would you like to discuss?" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                disabled={posting}
              />
              <button 
                className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center" 
                type="submit"
                disabled={posting || !title.trim()}
              >
                {posting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Posting...
                  </>
                ) : (
                  <>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Post
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Threads List */}
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : threads.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 text-center py-16">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">No Discussions Yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Be the first to start a discussion in this course!</p>
            </div>
          ) : (
            threads.map(thread => (
              <Link 
                key={thread._id} 
                to={`/forums/thread/${thread._id}`}
                className="block bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:border-primary-300 dark:hover:border-primary-600 group"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-2">
                        {thread.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4 mb-2">
                        <div className="flex items-center">
                          <UserIcon className="w-4 h-4 mr-1" />
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {thread.user?.firstName && thread.user?.lastName 
                              ? `${thread.user.firstName} ${thread.user.lastName}`
                              : thread.user?.email || 'Anonymous User'
                            }
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                        <div className="flex items-center">
                          <ClockIcon className="w-4 h-4 mr-1" />
                          <span>Updated {new Date(thread.updatedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center">
                          <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1" />
                          <span>{thread.posts?.length || 0} replies</span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                        <ChatBubbleLeftRightIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ForumPage;


