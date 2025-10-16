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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Unread: {unreadCount}</span>
          <button className="btn-outline" onClick={handleMarkAllRead}>Mark all read</button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg divide-y">
        {list.length === 0 ? (
          <div className="p-6 text-sm text-gray-600">No notifications</div>
        ) : (
          list.map(n => (
            <div key={n._id} className={`p-4 ${!n.readAt ? 'bg-gray-50' : ''}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-semibold text-gray-900">{n.title}</div>
                  {n.body && <div className="text-sm text-gray-600 mt-1">{n.body}</div>}
                </div>
                {!n.readAt && (
                  <button className="text-sm text-primary-600" onClick={() => markRead([n._id])}>Mark read</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {nextCursor && (
        <div className="mt-4 text-center">
          <button className="btn-outline" onClick={loadMore}>Load more</button>
        </div>
      )}
    </div>
  );
};

export default TutorNotifications;


