import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SpNotif.css";
import { ChevronLeft, Trash2, Bell, Calendar, CreditCard, AlertCircle, CheckCircle } from "lucide-react";

const SpNotif = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Icon component mapping
  const iconComponents = {
    calendar: Calendar,
    creditCard: CreditCard,
    alert: AlertCircle,
    check: CheckCircle,
    bell: Bell
  };

  // Notification templates specific to service providers
  const notificationTemplates = {
    newBooking: (customerName, service, date, time) => ({
      title: "New Booking",
      message: `${customerName} booked ${service} for ${date} at ${time}`,
      icon: "calendar",
      type: "booking"
    }),
    paymentReceived: (customerName, amount) => ({
      title: "Payment Received",
      message: `You received ₹${amount} from ${customerName}`,
      icon: "creditCard",
      type: "payment"
    }),
    bookingCancellation: (customerName, service, date) => ({
      title: "Booking Cancelled",
      message: `${customerName} cancelled ${service} on ${date}`,
      icon: "alert",
      type: "cancellation"
    }),
    reviewReceived: (customerName, rating) => ({
      title: "New Review",
      message: `${customerName} gave you ${rating} stars`,
      icon: "check",
      type: "review"
    }),
    systemAlert: (message) => ({
      title: "System Alert",
      message: message,
      icon: "bell",
      type: "system"
    })
  };

  // Generate sample notifications or fetch from localStorage
  useEffect(() => {
    const fetchNotifications = () => {
      try {
        // Get provider data
        const providerData = JSON.parse(localStorage.getItem('provider')) || {};
        const providerId = providerData.id;

        // Get all bookings from localStorage
        const storedBookings = JSON.parse(localStorage.getItem('petCareBookings')) || [];
        
        // Get payments from localStorage
        const paymentHistory = JSON.parse(localStorage.getItem('paymentHistory')) || [];

        // Generate notifications from existing data
        const generatedNotifications = [
          // From bookings
          ...storedBookings
            .filter(booking => booking.provider?.id === providerId)
            .map(booking => ({
              ...notificationTemplates.newBooking(
                booking.user?.name || 'Customer',
                booking.service?.name || 'Service',
                booking.date,
                booking.time
              ),
              id: `booking-${booking.id}`,
              timestamp: new Date(booking.createdAt || Date.now()).getTime(),
              read: false,
              bookingId: booking.id
            })),
          
          // From payments
          ...paymentHistory
            .filter(payment => payment.providerId === providerId)
            .map(payment => ({
              ...notificationTemplates.paymentReceived(
                'Customer',
                payment.amount
              ),
              id: `payment-${payment.id}`,
              timestamp: new Date(payment.date || Date.now()).getTime(),
              read: false,
              paymentId: payment.id
            })),
          
          // Sample system notifications
          {
            ...notificationTemplates.systemAlert("Your profile has been approved"),
            id: `system-${Date.now()}`,
            timestamp: Date.now() - 3600000, // 1 hour ago
            read: false
          },
          {
            ...notificationTemplates.reviewReceived("Happy Customer", 5),
            id: `review-${Date.now()}`,
            timestamp: Date.now() - 86400000, // 1 day ago
            read: false
          }
        ];

        // Sort by timestamp (newest first)
        generatedNotifications.sort((a, b) => b.timestamp - a.timestamp);

        // Save to localStorage if empty (initial load)
        const storedNotifications = JSON.parse(localStorage.getItem('spNotifications')) || [];
        if (storedNotifications.length === 0 && generatedNotifications.length > 0) {
          localStorage.setItem('spNotifications', JSON.stringify(generatedNotifications));
        }

        // Use stored notifications if they exist, otherwise use generated ones
        setNotifications(storedNotifications.length > 0 ? storedNotifications : generatedNotifications);
      } catch (error) {
        console.error("Error loading notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    
    // Set up storage event listener
    const handleStorageChange = () => fetchNotifications();
    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Clear all notifications
  const handleDeleteAll = () => {
    if (window.confirm("Are you sure you want to clear all notifications?")) {
      localStorage.setItem('spNotifications', JSON.stringify([]));
      setNotifications([]);
      alert("All notifications have been cleared");
    }
  };

  // Delete single notification
  const handleDeleteNotification = (id, e) => {
    e.stopPropagation();
    const updatedNotifications = notifications.filter(notif => notif.id !== id);
    localStorage.setItem('spNotifications', JSON.stringify(updatedNotifications));
    setNotifications(updatedNotifications);
  };

  // Mark as read
  const handleMarkAsRead = (id) => {
    const updatedNotifications = notifications.map(notif => {
      if (notif.id === id && !notif.read) {
        return { ...notif, read: true };
      }
      return notif;
    });
    
    localStorage.setItem('spNotifications', JSON.stringify(updatedNotifications));
    setNotifications(updatedNotifications);
  };

  // Format time display
  const formatTime = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  if (loading) {
    return (
      <div className="sp-notif-page">
        <div className="sp-app-bar">
          {/* <button className="back-button" onClick={() => navigate(-1)}>
            <ChevronLeft size={24} />
          </button> */}
          <h1>Notifications</h1>
          <div className="delete-button-placeholder"></div>
        </div>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="sp-notif-page">
      {/* App Bar with clear all button */}
      <div className="sp-app-bar">
        {/* <button className="back-button" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button> */}
        <h1>Notifications</h1>
        {notifications.length > 0 && (
          <button 
            className="delete-all-button"
            onClick={handleDeleteAll}
            title="Clear all notifications"
          >
            <Trash2 size={20} />
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="sp-notifications-list">
        {notifications.length > 0 ? (
          notifications.map(notification => {
            const IconComponent = iconComponents[notification.icon];
            return (
              <div 
                key={notification.id} 
                className={`notification-card ${notification.read ? 'read' : 'unread'}`}
                onClick={() => handleMarkAsRead(notification.id)}
              >
                <div className="notification-icon">
                  {IconComponent ? <IconComponent size={18} /> : <Bell size={18} />}
                </div>
                <div className="notification-details">
                  <h3>{notification.title}</h3>
                  <p>{notification.message}</p>
                  <div className="notification-footer">
                    <span className="timestamp">{formatTime(notification.timestamp)}</span>
                    <button 
                      className="delete-notification"
                      onClick={(e) => handleDeleteNotification(notification.id, e)}
                      title="Delete this notification"
                    >
                      ×
                    </button>
                  </div>
                  {!notification.read && <div className="unread-indicator"></div>}
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-notifications">
            <Bell size={48} className="empty-icon" />
            <p>No notifications yet</p>
            <p className="subtext">Your important updates will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpNotif;