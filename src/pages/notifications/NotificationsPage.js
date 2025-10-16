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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="muted">{unreadCount} unread</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-outline" onClick={() => listNotifications({ unread: true })}>Show Unread</button>
            <button className="btn-outline" onClick={() => listNotifications({})}>Show All</button>
            <button className="btn-primary" onClick={markSelectedRead} disabled={selected.length === 0}>Mark Selected Read</button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y">
          {(items || []).map(n => (
            <div key={n._id} className="p-4 flex items-start gap-3">
              <input type="checkbox" className="mt-1" checked={selected.includes(n._id)} onChange={() => toggle(n._id)} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="text-gray-900 font-medium">{n.title}</div>
                  {!n.readAt && <span className="badge badge-success">New</span>}
                </div>
                <div className="muted mt-1">{n.body}</div>
                {n.link && (
                  <a href={n.link} className="text-primary-600 hover:text-primary-700 text-sm mt-2 inline-block">Open</a>
                )}
              </div>
            </div>
          ))}
          {(!items || items.length === 0) && (
            <div className="p-6 text-center muted">No notifications</div>
          )}
        </div>

        <div className="mt-4 flex justify-center">
          <button className="btn-outline" onClick={loadMore} disabled={loading}>Load More</button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;



