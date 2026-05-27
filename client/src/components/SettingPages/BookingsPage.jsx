import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar, Clock, MapPin, CheckCircle, XCircle, Clock as PendingIcon } from 'lucide-react';
import './BookingsPage.css';

const BookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('upcoming');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBookings = () => {
            try {
                setLoading(true);
                const storedBookings = JSON.parse(localStorage.getItem('petCareBookings')) || [];
                console.log("Retrieved bookings:", storedBookings); // Add this line
                console.log("Booking dates:", storedBookings.map(b => b.date));
                setBookings(storedBookings);
                setLoading(false);
            } catch (err) {
                console.error('Error loading bookings:', err);
                setError('Failed to load bookings');
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    const filteredBookings = bookings.filter(booking => {
        const now = new Date();
        // Handle both possible date locations
        const bookingDate = new Date(booking.date || (booking.booking_data && booking.booking_data.date));
        
        if (isNaN(bookingDate)) {
            console.error('Invalid date for booking:', booking);
            return false;
        }

        console.log("Processing booking:", booking); // Add this
        console.log("Booking date:", bookingDate, "Now:", now); // Add this
  
        switch (activeTab) {
            case 'upcoming':
                return bookingDate >= now && booking.status !== 'cancelled';
            case 'past':
                return bookingDate < now && booking.status !== 'cancelled';
            case 'cancelled':
                return booking.status === 'cancelled';
            default:
                return true;
        }
    });

    const formatDate = (dateString) => {
        const options = { weekday: 'short', day: 'numeric', month: 'short' };
        return new Date(dateString).toLocaleDateString('en-IN', options);
    };

    const handleBack = () => navigate(-1);

    const handleCancelBooking = (bookingId) => {
        if (window.confirm('Are you sure you want to cancel this booking?')) {
            try {
                // Update the booking status in localStorage
                const updatedBookings = bookings.map(booking => 
                    booking.id === bookingId ? { ...booking, status: 'cancelled' } : booking
                );
                
                localStorage.setItem('petCareBookings', JSON.stringify(updatedBookings));
                setBookings(updatedBookings);
                
                alert('Booking cancelled successfully');
            } catch (err) {
                console.error('Error cancelling booking:', err);
                alert('Failed to cancel booking');
            }
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'confirmed':
                return <PendingIcon size={16} color="#FFA500" />;
            case 'completed':
                return <CheckCircle size={16} color="#4CAF50" />;
            case 'cancelled':
                return <XCircle size={16} color="#F44336" />;
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading your bookings...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }

    return (
        <div className="bookings-page">
            <div className="bookings-header">
                <button className="back-button" onClick={handleBack}>
                    <ChevronLeft size={24} />
                </button>
                <h1>My Bookings</h1>
            </div>

            <div className="bookings-tabs">
                <button 
                    className={`tab-button ${activeTab === 'upcoming' ? 'active' : ''}`}
                    onClick={() => setActiveTab('upcoming')}
                >
                    Upcoming
                </button>
                <button 
                    className={`tab-button ${activeTab === 'past' ? 'active' : ''}`}
                    onClick={() => setActiveTab('past')}
                >
                    Past
                </button>
                <button 
                    className={`tab-button ${activeTab === 'cancelled' ? 'active' : ''}`}
                    onClick={() => setActiveTab('cancelled')}
                >
                    Cancelled
                </button>
            </div>

            <div className="bookings-list">
                {filteredBookings.length === 0 ? (
                    <div className="no-bookings">
                        <p>No {activeTab} bookings found</p>
                    </div>
                ) : (
                    filteredBookings.map(booking => (
                        <div key={booking.id} className="booking-card">
                            <div className="booking-header">
                                <div className="provider-info">
                                    <div>
                                        <h3>{booking.provider.name}</h3>
                                        <p className="service-name">{booking.service.name}</p>
                                    </div>
                                </div>
                                <div className="booking-status">
                                    {getStatusIcon(booking.status)}
                                    <span>{booking.status}</span>
                                </div>
                            </div>
                            
                            <div className="booking-details">
                                <div className="detail-item">
                                    <Calendar size={16} />
                                    <span>{formatDate(booking.date)}</span>
                                </div>
                                <div className="detail-item">
                                    <Clock size={16} />
                                    <span>{booking.time}</span>
                                </div>
                                <div className="detail-item">
                                    <MapPin size={16} />
                                    <span>{booking.provider.location}</span>
                                </div>
                            </div>
                            
                            <div className="booking-footer">
                                <div className="booking-price">
                                    ₹{booking.amount}
                                </div>
                                <div className="booking-actions">
                                    {activeTab === 'upcoming' && booking.status === 'confirmed' && (
                                        <button 
                                            className="cancel-action"
                                            onClick={() => handleCancelBooking(booking.id)}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default BookingsPage;