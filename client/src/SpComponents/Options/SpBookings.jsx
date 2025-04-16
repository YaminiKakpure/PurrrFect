import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./SpBookings.css";
import { ChevronLeft, Calendar, Clock, User, MapPin, CheckCircle, XCircle, Clock as PendingIcon } from 'lucide-react';

const SpBookings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("current");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Demo data for when no bookings exist
  const demoBookings = [
    {
      id: "demo-booking-1",
      provider: {
        id: 5,
        name: "Raghav Ahuja",
        email: "raghav@gmail.com",
        phone: "8852274985",
        location: "Tukdoji Square, Nagpur",
        service_title: "Ahuja's Pet Clinic"
      },
      service: {
        name: "Vaccination",
        price: "1000.00",
        duration: 15
      },
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
      time: "10:00",
      status: "confirmed",
      paymentStatus: "pending",
      paymentMethod: "cash",
      amount: 1000,
      user: {
        name: "Demo User",
        phone: "9876543210",
        email: "demo@example.com"
      },
      pet: {
        name: "Max",
        breed: "Golden Retriever",
        profile_image: "https://images.unsplash.com/photo-1552053831-71594a27632d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NTYyMDF8MHwxfHNlYXJjaHwzfHxkb2d8ZW58MHx8fHwxNzM5ODAyMTI4fDA&ixlib=rb-4.0.3&q=80&w=1080"
      }
    }
  ];

  // Fetch bookings from localStorage
  useEffect(() => {
    const fetchBookings = () => {
      try {
        const storedBookings = JSON.parse(localStorage.getItem('petCareBookings')) || [];
        const currentUserId = localStorage.getItem('userId');
        
        // Filter bookings for this provider and enhance data
        const providerBookings = storedBookings
          .filter(booking => booking.provider?.id == currentUserId) // Use == for loose comparison
          .map(booking => ({
            ...booking,
            // Ensure all required fields exist
            user: booking.user || {
              name: "Customer",
              phone: "Not provided",
              email: "Not provided"
            },
            pet: booking.pet || getPetFromLocalStorage(booking.petId) || {
              name: "Pet",
              breed: "Unknown Breed",
              profile_image: "https://via.placeholder.com/150"
            }
          }));

        // Use actual bookings if they exist, otherwise use demo data
        const bookingsToShow = providerBookings.length > 0 ? providerBookings : demoBookings;
        
        setBookings(bookingsToShow);
      } catch (error) {
        console.error("Error loading bookings:", error);
        toast.error("Failed to load bookings");
        setBookings(demoBookings); // Fallback to demo data
      } finally {
        setLoading(false);
      }
    };

    // Helper function to get pet data from localStorage
    const getPetFromLocalStorage = (petId) => {
      try {
        const pets = JSON.parse(localStorage.getItem('pets')) || [];
        const pet = pets.find(p => p.id == petId);
        return pet ? {
          name: pet.name,
          breed: pet.breed,
          profile_image: pet.profile_image || "https://via.placeholder.com/150"
        } : null;
      } catch (e) {
        return null;
      }
    };

    fetchBookings();
    
    // Set up storage event listener
    const handleStorageChange = () => fetchBookings();
    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleAcceptBooking = (bookingId) => {
    if (bookingId.startsWith('demo-')) {
      toast.info("This is a demo booking. Create a real booking to use this feature.");
      return;
    }

    const updatedBookings = bookings.map(booking => 
      booking.id === bookingId ? { ...booking, status: 'confirmed' } : booking
    );
    
    localStorage.setItem('petCareBookings', JSON.stringify(updatedBookings));
    setBookings(updatedBookings);
    toast.success("Booking accepted!");
  };

  const handleCancelBooking = (bookingId) => {
    if (bookingId.startsWith('demo-')) {
      toast.info("This is a demo booking. Create a real booking to use this feature.");
      return;
    }

    const updatedBookings = bookings.map(booking => 
      booking.id === bookingId ? { ...booking, status: 'cancelled' } : booking
    );
    
    localStorage.setItem('petCareBookings', JSON.stringify(updatedBookings));
    setBookings(updatedBookings);
    toast.success("Booking cancelled!");
  };

  const handleCompleteBooking = (bookingId) => {
    if (bookingId.startsWith('demo-')) {
      toast.info("This is a demo booking. Create a real booking to use this feature.");
      return;
    }

    const updatedBookings = bookings.map(booking => 
      booking.id === bookingId ? { ...booking, status: 'completed' } : booking
    );
    
    localStorage.setItem('petCareBookings', JSON.stringify(updatedBookings));
    setBookings(updatedBookings);
    toast.success("Booking marked as completed!");
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
    ['completed', 'cancelled'].includes(booking.status) ||
    (new Date(booking.date) < new Date() && !isToday(new Date(booking.date))
  ));

  function isToday(date) {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  const formatTime = (timeString) => {
    return timeString || '--:--';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <PendingIcon size={16} color="#FFA500" />;
      case 'completed': return <CheckCircle size={16} color="#4CAF50" />;
      case 'cancelled': return <XCircle size={16} color="#F44336" />;
      default: return null;
    }
  };

  const isDemoBooking = (bookingId) => {
    return bookingId.startsWith('demo-');
  };

  if (loading) {
    return (
      <div className="sp-bookings-loading">
        <div className="spinner"></div>
        <p>Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="sp-bookings-container">
      {/* Header */}
      <div className="sp-bookings-header">
        <button onClick={() => navigate(-1)} className="back-button">
          <ChevronLeft size={24} />
        </button>
        <h1>My Bookings</h1>
      </div>

      {/* Tabs */}
      <div className="sp-bookings-tabs">
        <button 
          className={`tab ${activeTab === 'current' ? 'active' : ''}`}
          onClick={() => setActiveTab('current')}
        >
          Today's
        </button>
        <button
          className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming
        </button>
        <button
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending ({pendingBookings.length})
        </button>
        <button
          className={`tab ${activeTab === 'past' ? 'active' : ''}`}
          onClick={() => setActiveTab('past')}
        >
          History
        </button>
      </div>

      {/* Content */}
      <div className="sp-bookings-content">
        {activeTab === 'current' && (
          <div className="current-bookings">
            <h2>Today's Appointments</h2>
            {currentBookings.length > 0 ? (
              currentBookings.map(booking => (
                <div key={booking.id} className="booking-card">
                  <div className="booking-header">
                    <div className="user-info">
                      <div className="user-avatar">
                        {booking.pet?.profile_image ? (
                          <img 
                            src={booking.pet.profile_image} 
                            alt={booking.pet.name} 
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/150";
                            }}
                          />
                        ) : (
                          <User size={20} />
                        )}
                      </div>
                      <div>
                        <h3>{booking.user?.name || 'Customer'}</h3>
                        <p className="pet-info">
                          {booking.pet?.name || 'Pet'} • {booking.pet?.breed || 'Unknown breed'}
                        </p>
                      </div>
                    </div>
                    <div className="booking-status">
                      {getStatusIcon(booking.status)}
                      <span>{booking.status}</span>
                    </div>
                  </div>

                  <div className="booking-details">
                    <div className="detail-row">
                      <Calendar size={14} />
                      <span>{formatDate(booking.date)} at {formatTime(booking.time)}</span>
                    </div>
                    <div className="detail-row">
                      <MapPin size={14} />
                      <span>{booking.provider?.location || 'Location not specified'}</span>
                    </div>
                    <div className="detail-row">
                      <span>Service:</span>
                      <span>{booking.service?.name || 'Service'}</span>
                    </div>
                  </div>

                  <div className="booking-footer">
                    <div className="booking-price">
                      ₹{booking.amount || booking.service?.price || '0'}
                    </div>
                    <div className="booking-actions">
                      <button 
                        className="complete-button"
                        onClick={() => handleCompleteBooking(booking.id)}
                        disabled={isDemoBooking(booking.id)}
                      >
                        Complete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-bookings">
                <p>No appointments scheduled for today</p>
                {bookings === demoBookings && (
                  <p className="demo-notice">This is demo data. Create real bookings to see them here.</p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'upcoming' && (
          <div className="upcoming-bookings">
            <h2>Upcoming Appointments</h2>
            {upcomingBookings.length > 0 ? (
              upcomingBookings.map(booking => (
                <div key={booking.id} className="booking-card">
                  {/* Similar structure as current bookings */}
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
                <p>No upcoming appointments</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'pending' && (
          <div className="pending-bookings">
            <h2>Pending Approvals</h2>
            {pendingBookings.length > 0 ? (
              pendingBookings.map(booking => (
                <div key={booking.id} className="booking-card">
                  {/* Similar header as current bookings */}
                  <div className="booking-actions">
                    <button
                      className="accept-button"
                      onClick={() => handleAcceptBooking(booking.id)}
                    >
                      Accept
                    </button>
                    <button
                      className="decline-button"
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-bookings">
                <p>No pending bookings requiring approval</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'past' && (
          <div className="past-bookings">
            <h2>Booking History</h2>
            {pastBookings.length > 0 ? (
              pastBookings.map(booking => (
                <div key={booking.id} className="booking-card">
                  {/* Similar structure as current bookings */}
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
                <p>No past bookings yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpBookings;