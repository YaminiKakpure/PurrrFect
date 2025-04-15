import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SpNotif.css";

const SpNotif = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch notifications from localStorage
  useEffect(() => {
    const fetchNotifications = () => {
      try {
        const storedNotifications = JSON.parse(localStorage.getItem('spNotifications')) || [];
        setNotifications(storedNotifications);
      } catch (error) {
        console.error("Error loading notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    
    // Set up storage event listener to sync across tabs
    const handleStorageChange = () => fetchNotifications();
    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleDeleteAll = () => {
    localStorage.setItem('spNotifications', JSON.stringify([]));
    setNotifications([]);
  };

  const handleDeleteNotification = (id) => {
    const updatedNotifications = notifications.filter(notif => notif.id !== id);
    localStorage.setItem('spNotifications', JSON.stringify(updatedNotifications));
    setNotifications(updatedNotifications);
  };

  const handleMarkAsRead = (id) => {
    const updatedNotifications = notifications.map(notif => {
      if (notif.id === id) {
        return { ...notif, read: true };
      }
      return notif;
    });
    
    localStorage.setItem('spNotifications', JSON.stringify(updatedNotifications));
    setNotifications(updatedNotifications);
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const notificationDate = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <div className="sp-notif-page">
        <div className="sp-app-bar">
          <button className="back-button" onClick={() => navigate(-1)}>
            ←
          </button>
          <h1>Notifications</h1>
          <button className="delete-button">🗑️</button>
        </div>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="sp-notif-page">
      {/* App Bar */}
      <div className="sp-app-bar">
        <button className="back-button" onClick={() => navigate(-1)}>
          ←
        </button>
        <h1>Notifications</h1>
        <button 
          className="delete-button" 
          onClick={handleDeleteAll}
          disabled={notifications.length === 0}
        >
          🗑️
        </button>
      </div>

      {/* Notifications List */}
      <div className="sp-notifications-list">
        {notifications.length > 0 ? (
          notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification-card ${notification.read ? 'read' : 'unread'}`}
              onClick={() => handleMarkAsRead(notification.id)}
            >
              <div className="notification-icon">{notification.icon || '🔔'}</div>
              <div className="notification-details">
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>
                <div className="notification-footer">
                  <span>{formatTime(notification.timestamp)}</span>
                  <button 
                    className="delete-notification"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNotification(notification.id);
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-notifications">
            <p>No notifications yet</p>
            <p>You'll see important updates here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpNotif;