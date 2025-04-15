import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SpBookings.css";

const SpBookings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("current");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch bookings from localStorage
  useEffect(() => {
    const fetchBookings = () => {
      try {
        const storedBookings = JSON.parse(localStorage.getItem('petCareBookings')) || [];
        const currentUserId = localStorage.getItem('userId'); // Assuming provider ID is stored
        
        // Filter bookings for this provider
        const providerBookings = storedBookings.filter(booking => 
          booking.provider.id === currentUserId
        );
        
        setBookings(providerBookings);
      } catch (error) {
        console.error("Error loading bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
    
    // Set up storage event listener to sync across tabs
    const handleStorageChange = () => fetchBookings();
    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleAcceptBooking = (bookingId) => {
    const updatedBookings = bookings.map(booking => {
      if (booking.id === bookingId) {
        return { ...booking, status: 'confirmed' };
      }
      return booking;
    });
    
    localStorage.setItem('petCareBookings', JSON.stringify(updatedBookings));
    setBookings(updatedBookings);
    
    // Add notification
    addNotification(`Booking accepted for ${updatedBookings.find(b => b.id === bookingId).service.name}`, '📅');
  };

  const handleCancelBooking = (bookingId) => {
    const updatedBookings = bookings.map(booking => {
      if (booking.id === bookingId) {
        return { ...booking, status: 'cancelled' };
      }
      return booking;
    });
    
    localStorage.setItem('petCareBookings', JSON.stringify(updatedBookings));
    setBookings(updatedBookings);
    
    // Add notification
    addNotification(`Booking cancelled for ${updatedBookings.find(b => b.id === bookingId).service.name}`, '❌');
  };

  const addNotification = (message, icon) => {
    const newNotification = {
      id: `notif-${Date.now()}`,
      title: 'Booking Update',
      message,
      icon,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    const existingNotifications = JSON.parse(localStorage.getItem('spNotifications')) || [];
    localStorage.setItem('spNotifications', JSON.stringify([newNotification, ...existingNotifications]));
  };

  // Filter bookings based on status and date
  const currentBookings = bookings.filter(booking => 
    booking.status === 'confirmed' && 
    isToday(new Date(booking.date))
  );

  const upcomingBookings = bookings.filter(booking => 
    booking.status === 'confirmed' && 
    new Date(booking.date) > new Date() &&
    !isToday(new Date(booking.date))
  );

  const pendingBookings = bookings.filter(booking => 
    booking.status === 'pending'
  );

  const pastBookings = bookings.filter(booking => 
    (booking.status === 'completed' || booking.status === 'cancelled') ||
    (new Date(booking.date) < new Date() && !isToday(new Date(booking.date))
  ));

  function isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  }

  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  if (loading) {
    return (
      <div className="sp-bookings-page">
        <div className="sp-app-bar">
          <button className="back-button" onClick={() => navigate(-1)}>
            ←
          </button>
          <h1>View Bookings</h1>
        </div>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="sp-bookings-page">
      {/* App Bar */}
      <div className="sp-app-bar">
        <button className="back-button" onClick={() => navigate(-1)}>
          ←
        </button>
        <h1>View Bookings</h1>
      </div>

      {/* Tab Bar */}
      <div className="sp-tab-bar">
        <button
          className={activeTab === "current" ? "active-tab" : ""}
          onClick={() => setActiveTab("current")}
        >
          Current
        </button>
        <button
          className={activeTab === "upcoming" ? "active-tab" : ""}
          onClick={() => setActiveTab("upcoming")}
        >
          Upcoming
        </button>
        <button
          className={activeTab === "pending" ? "active-tab" : ""}
          onClick={() => setActiveTab("pending")}
        >
          Pending ({pendingBookings.length})
        </button>
        <button
          className={activeTab === "past" ? "active-tab" : ""}
          onClick={() => setActiveTab("past")}
        >
          Past
        </button>
      </div>

      {/* Tab Content */}
      <div className="sp-tab-content">
        {activeTab === "current" && (
          <div className="current-bookings">
            <h2>Ongoing Bookings</h2>
            {currentBookings.length > 0 ? (
              currentBookings.map(booking => (
                <div className="booking-card" key={booking.id}>
                  <div className="booking-info">
                    <img
                      src={booking.petImage || "https://images.unsplash.com/photo-1552053831-71594a27632d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NTYyMDF8MHwxfHNlYXJjaHwzfHxkb2d8ZW58MHx8fHwxNzM5ODAyMTI4fDA&ixlib=rb-4.0.3&q=80&w=1080"}
                      alt={booking.petName || "Pet"}
                    />
                    <div className="booking-details">
                      <h3>{booking.petName || "Pet"} - {booking.petBreed || "Breed"}</h3>
                      <p>{booking.service.name} • {formatDate(booking.date)}</p>
                      <div className="booking-meta">
                        <span className="booking-status confirmed">In Progress</span>
                        <span className="payment-status">
                          {booking.paymentStatus === 'paid' ? '💰 Paid' : '⌛ Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="booking-actions">
                    <button 
                      className="complete-button"
                      onClick={() => handleCompleteBooking(booking.id)}
                    >
                      Mark Complete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-bookings">
                <p>No ongoing bookings today.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "upcoming" && (
          <div className="upcoming-bookings">
            <h2>Upcoming Bookings</h2>
            {upcomingBookings.length > 0 ? (
              upcomingBookings.map(booking => (
                <div className="booking-card" key={booking.id}>
                  <div className="booking-info">
                    <img
                      src={booking.petImage || "https://images.unsplash.com/photo-1536590158209-e9d615d525e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NTYyMDF8MHwxfHNlYXJjaHwxOXx8Y2F0fGVufDB8fHx8MTczOTgxNzk5OXww&ixlib=rb-4.0.3&q=80&w=1080"}
                      alt={booking.petName || "Pet"}
                    />
                    <div className="booking-details">
                      <h3>{booking.petName || "Pet"} - {booking.petBreed || "Breed"}</h3>
                      <p>{booking.service.name} • {formatDate(booking.date)}</p>
                      <div className="booking-meta">
                        <span className="booking-status confirmed">Confirmed</span>
                        <span className="payment-status">
                          {booking.paymentStatus === 'paid' ? '💰 Paid' : '⌛ ' + booking.paymentMethod}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="booking-actions">
                    <button 
                      className="cancel-button"
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-bookings">
                <p>No upcoming bookings scheduled.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "pending" && (
          <div className="pending-bookings">
            <h2>Pending Approval</h2>
            {pendingBookings.length > 0 ? (
              pendingBookings.map(booking => (
                <div className="booking-card" key={booking.id}>
                  <div className="booking-info">
                    <img
                      src={booking.petImage || "https://images.unsplash.com/photo-1586671267731-da2cf3ceeb80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NTYyMDF8MHwxfHNlYXJjaHw5fHxkb2d8ZW58MHx8fHwxNzM5ODAyMTI4fDA&ixlib=rb-4.0.3&q=80&w=1080"}
                      alt={booking.petName || "Pet"}
                    />
                    <div className="booking-details">
                      <h3>{booking.petName || "Pet"} - {booking.petBreed || "Breed"}</h3>
                      <p>{booking.service.name} • {formatDate(booking.date)}</p>
                      <span className="booking-status pending">Pending Approval</span>
                    </div>
                  </div>
                  <div className="booking-actions">
                    <button 
                      className="accept-button"
                      onClick={() => handleAcceptBooking(booking.id)}
                    >
                      Accept
                    </button>
                    <button 
                      className="cancel-button"
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-bookings">
                <p>No pending bookings requiring approval.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "past" && (
          <div className="past-bookings">
            <h2>Past Bookings</h2>
            {pastBookings.length > 0 ? (
              pastBookings.map(booking => (
                <div className="booking-card" key={booking.id}>
                  <div className="booking-info">
                    <img
                      src={booking.petImage || "https://images.unsplash.com/photo-1517849845537-4d257902454a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NTYyMDF8MHwxfHNlYXJjaHwxfHxkb2d8ZW58MHx8fHwxNzM5ODAyMTI4fDA&ixlib=rb-4.0.3&q=80&w=1080"}
                      alt={booking.petName || "Pet"}
                    />
                    <div className="booking-details">
                      <h3>{booking.petName || "Pet"} - {booking.petBreed || "Breed"}</h3>
                      <p>{booking.service.name} • {formatDate(booking.date)}</p>
                      <div className="booking-meta">
                        <span className={`booking-status ${booking.status}`}>
                          {booking.status === 'cancelled' ? 'Cancelled' : 'Completed'}
                        </span>
                        <span className="payment-status">
                          {booking.paymentStatus === 'paid' ? '💰 Paid' : 
                           booking.paymentMethod === 'cash' ? '💵 Cash' : '⌛ Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {booking.status === 'completed' && (
                    <div className="booking-actions">
                      <button 
                        className="review-button"
                        onClick={() => navigate(`/review/${booking.id}`)}
                      >
                        Add Review
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-bookings">
                <p>No past bookings yet.</p>
                <p>Let's make history! 🐾</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpBookings;