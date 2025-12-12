// src/components/NotificationItem/NotificationItem.js
import React from 'react';

const NotificationItem = ({ notification, onMarkAsRead }) => {
  return (
    <div className={`p-4 rounded-lg ${notification.read ? 'bg-gray-50' : 'bg-blue-50 border-l-4 border-blue-500'}`}>
      <p className="font-semibold">{notification.title}</p>
      <p className="text-gray-600">{notification.message}</p>
      {!notification.read && (
        <button onClick={onMarkAsRead} className="text-sm text-blue-500 hover:text-blue-700 mt-2">Mark as Read</button>
      )}
    </div>
  );
};

export default NotificationItem;