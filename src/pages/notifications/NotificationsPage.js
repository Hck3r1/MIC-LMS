import React, { useEffect, useState } from 'react';
import { useNotifications } from '../../contexts/NotificationsContext';

const NotificationsPage = () => {
  const { items, unreadCount, listNotifications, loadMore, markSeen, markRead, loading, error } = useNotifications();
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    listNotifications();
    // mark as seen on page view
    markSeen().catch(() => {});
  }, [listNotifications, markSeen]);

  const toggle = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const markSelectedRead = async () => {
    if (selected.length === 0) return;
    await markRead(selected);
    setSelected([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Notifications</h1>
            <p className="text-gray-600 dark:text-gray-400">{unreadCount} unread</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" 
              onClick={() => listNotifications({ unread: true })}
            >
              Show Unread
            </button>
            <button 
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" 
              onClick={() => listNotifications({})}
            >
              Show All
            </button>
            <button 
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
              onClick={markSelectedRead} 
              disabled={selected.length === 0}
            >
              Mark Selected Read
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4">{error}</div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
          {(items || []).map(n => (
            <div key={n._id} className="p-4 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <input 
                type="checkbox" 
                className="mt-1 w-4 h-4 text-primary-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 dark:focus:ring-primary-400 dark:ring-offset-gray-800" 
                checked={selected.includes(n._id)} 
                onChange={() => toggle(n._id)} 
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="text-gray-900 dark:text-gray-100 font-medium">{n.title}</div>
                  {!n.readAt && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                      New
                    </span>
                  )}
                </div>
                <div className="text-gray-600 dark:text-gray-400 mt-1">{n.body}</div>
                {n.link && (
                  <a 
                    href={n.link} 
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm mt-2 inline-block transition-colors"
                  >
                    Open
                  </a>
                )}
              </div>
            </div>
          ))}
          {(!items || items.length === 0) && (
            <div className="p-6 text-center text-gray-600 dark:text-gray-400">No notifications</div>
          )}
        </div>

        <div className="mt-4 flex justify-center">
          <button 
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
            onClick={loadMore} 
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;



