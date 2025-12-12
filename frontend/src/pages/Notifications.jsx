// src/pages/Notifications.js
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import NotificationItem from '../components/NotificationItem/NotificationItem';
import { markAsRead, markAllNotificationsAsRead } from '../store/slices/notificationsSlice';
import { toast } from 'react-toastify';

const Notifications = () => {
  const dispatch = useDispatch();
  const { notifications } = useSelector((state) => state.notifications);

  const handleMarkAsRead = (id) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead());
  };

  const unread = notifications.filter(n => n && !n.read);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">You have {unread.length} unread notifications</p>
        </div>
        {unread.length > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>
      <div className="space-y-4">
        {notifications.filter(n => n).map((notification) => (
          <NotificationItem
            key={notification._id}
            notification={notification}
            onMarkAsRead={() => handleMarkAsRead(notification._id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Notifications;