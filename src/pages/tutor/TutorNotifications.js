import React, { useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationsContext';

const TutorNotifications = () => {
  const { items, unreadCount, nextCursor, listNotifications, loadMore, markRead } = useNotifications();
  const list = Array.isArray(items) ? items : [];

  useEffect(() => {
    listNotifications({ unread: false });
  }, [listNotifications]);

  const handleMarkAllRead = async () => {
    const unreadIds = list.filter(n => !n.readAt).map(n => n._id);
    if (unreadIds.length) await markRead(unreadIds);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Notifications</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Unread: {unreadCount}</span>
            <button 
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" 
              onClick={handleMarkAllRead}
            >
              Mark all read
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
          {list.length === 0 ? (
            <div className="p-6 text-sm text-gray-600 dark:text-gray-400">No notifications</div>
          ) : (
            list.map(n => (
              <div key={n._id} className={`p-4 ${!n.readAt ? 'bg-gray-50 dark:bg-gray-700/50' : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'} transition-colors`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{n.title}</div>
                    {n.body && <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{n.body}</div>}
                  </div>
                  {!n.readAt && (
                    <button 
                      className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors" 
                      onClick={() => markRead([n._id])}
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {nextCursor && (
          <div className="mt-4 text-center">
            <button 
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" 
              onClick={loadMore}
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorNotifications;


