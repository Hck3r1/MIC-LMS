import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ChatBubbleLeftRightIcon, UserCircleIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const API_URL = process.env.REACT_APP_API_URL || 'https://lms-backend-u90k.onrender.com/api';

const MessagesPage = () => {
  const [convos, setConvos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const headers = { Authorization: `Bearer ${localStorage.getItem('token') || ''}` };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/messages/conversations`, { headers });
        setConvos(res.data?.data?.conversations || []);
      } catch (error) {
        console.error('Error loading conversations:', error);
        setConvos([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const searchUsers = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    try {
      setSearching(true);
      const response = await axios.get(`${API_URL}/users/search?q=${encodeURIComponent(query)}`, { headers });
      if (response.data.success) {
        setSearchResults(response.data.data || []);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchUsers(query);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ChatBubbleLeftRightIcon className="w-8 h-8 text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              {convos.length} conversation{convos.length !== 1 ? 's' : ''}
            </div>
            <button
              onClick={() => setShowNewMessage(!showNewMessage)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              New Message
            </button>
          </div>
        </div>

        {/* New Message Search */}
        {showNewMessage && (
          <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-medium text-gray-900">Start a new conversation</h3>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search for users by name or email..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {searching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                </div>
              )}
            </div>
            
            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                {searchResults.map(user => (
                  <Link
                    key={user._id}
                    to={`/messages/with/${user._id}?name=${encodeURIComponent(`${user.firstName} ${user.lastName}`)}`}
                    className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setShowNewMessage(false)}
                  >
                    <div className="flex-shrink-0">
                      {user.avatar ? (
                        <img
                          className="w-10 h-10 rounded-full object-cover"
                          src={user.avatar}
                          alt={`${user.firstName} ${user.lastName}`}
                        />
                      ) : (
                        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {getInitials(user.firstName, user.lastName)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {user.firstName} {user.lastName}
                        </h4>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'tutor' 
                            ? 'bg-blue-100 text-blue-800' 
                            : user.role === 'student'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role === 'tutor' ? 'Instructor' : user.role === 'student' ? 'Student' : user.role}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{user.email}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {convos.length === 0 ? (
          <div className="text-center py-12">
            <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
            <p className="text-gray-600">Start a conversation with your instructors or fellow students!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {convos.map(convo => (
              <Link
                key={convo._id}
                to={`/messages/with/${convo._id}?name=${encodeURIComponent(`${convo.user.firstName} ${convo.user.lastName}`)}`}
                className="block"
              >
                <div className="card hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {convo.user.avatar ? (
                        <img
                          className="w-12 h-12 rounded-full object-cover"
                          src={convo.user.avatar}
                          alt={`${convo.user.firstName} ${convo.user.lastName}`}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {getInitials(convo.user.firstName, convo.user.lastName)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {convo.user.firstName} {convo.user.lastName}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            convo.user.role === 'tutor' 
                              ? 'bg-blue-100 text-blue-800' 
                              : convo.user.role === 'student'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {convo.user.role === 'tutor' ? 'Instructor' : convo.user.role === 'student' ? 'Student' : convo.user.role}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(convo.last)}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Click to view conversation
                      </p>
                    </div>

                    {/* Arrow */}
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;


