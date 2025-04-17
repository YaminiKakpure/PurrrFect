import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar, Clock, User, CheckCircle, XCircle, Clock as PendingIcon } from 'lucide-react';
import './SpBookings.css';

const SpBookings = () => {
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
                const currentProviderId = localStorage.getItem('sp_id');
                
                // Normalize and filter bookings
                const providerBookings = storedBookings
                    .map(normalizeBooking)
                    .filter(booking => booking.provider?.id == currentProviderId);

                console.log("Normalized provider bookings:", providerBookings);
                setBookings(providerBookings);
                setLoading(false);
            } catch (err) {
                console.error('Error loading bookings:', err);
                setError('Failed to load bookings');
                setLoading(false);
            }
        };

        // Helper function to normalize booking data
        const normalizeBooking = (booking) => {
            // If already in correct format, return as-is
            if (booking.date && booking.time) return booking;
            
            // Try to extract from nested structures
            return {
                ...booking,
                id: booking.id || `booking-${Date.now()}`,
                date: booking.date || 
                     (booking.booking_data && booking.booking_data.date) ||
                     new Date().toISOString().split('T')[0],
                time: booking.time ||
                     (booking.booking_data && booking.booking_data.time) ||
                     '12:00',
                user: booking.user || { name: 'Customer' },
                service: booking.service || { name: 'Service', price: 0 },
                status: booking.status || 'confirmed',
                paymentStatus: booking.paymentStatus || (booking.paymentId ? 'paid' : 'pending'),
                paymentMethod: booking.paymentMethod || (booking.paymentId ? 'online' : 'cash'),
                amount: booking.amount || (booking.service?.price || 0),
                pet: booking.pet || null
            };
        };

        fetchBookings();
    }, []);

    const filteredBookings = bookings.filter(booking => {
        try {
            const now = new Date();
            const bookingDate = new Date(booking.date);
            
            if (isNaN(bookingDate.getTime())) {
                console.warn('Invalid booking date:', booking.date, 'for booking:', booking);
                return false;
            }
            
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
        } catch (error) {
            console.error('Error filtering booking:', booking, error);
            return false;
        }
    });

    const formatDate = (dateString) => {
        try {
            const options = { weekday: 'short', day: 'numeric', month: 'short' };
            return new Date(dateString).toLocaleDateString('en-IN', options);
        } catch {
            return 'Invalid date';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'confirmed': return <PendingIcon size={16} color="#FFA500" />;
            case 'completed': return <CheckCircle size={16} color="#4CAF50" />;
            case 'cancelled': return <XCircle size={16} color="#F44336" />;
            default: return null;
        }
    };

    const handleCancelBooking = (bookingId) => {
        if (window.confirm('Are you sure you want to cancel this booking?')) {
            try {
                const updatedBookings = bookings.map(booking => 
                    booking.id === bookingId ? { ...booking, status: 'cancelled' } : booking
                );
                
                localStorage.setItem('petCareBookings', JSON.stringify(updatedBookings));
                setBookings(updatedBookings);
                toast.success('Booking cancelled successfully');
            } catch (err) {
                console.error('Error cancelling booking:', err);
                toast.error('Failed to cancel booking');
            }
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading your appointments...</p>
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
                <button className="back-button" onClick={() => navigate(-1)}>
                    <ChevronLeft size={24} />
                </button>
                <h1>Pet Appointments</h1>
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
                        <p>No {activeTab} appointments found</p>
                        <p className="debug-info">
                            Debug: Found {bookings.length} total bookings for your clinic
                        </p>
                    </div>
                ) : (
                    filteredBookings.map(booking => (
                        <div key={booking.id} className="booking-card">
                            <div className="booking-header">
                                <div className="pet-info">
                                    <div className="pet-avatar">
                                        {booking.pet?.profile_image ? (
                                            <img src={booking.pet.profile_image} alt={booking.pet.name} />
                                        ) : (
                                            <User size={20} />
                                        )}
                                    </div>
                                    <div>
                                        <h3>{booking.pet?.name || 'Pet'}</h3>
                                        <p>{booking.pet?.breed || 'Unknown breed'}</p>
                                        <p className="customer-name">
                                            {booking.user?.name || 'Customer'}
                                        </p>
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
                                    <span>{booking.time || '--:--'}</span>
                                </div>
                                <div className="detail-item">
                                    <span>Service:</span>
                                    <span>{booking.service?.name || 'Service'}</span>
                                </div>
                                <div className="detail-item">
                                    <span>Payment:</span>
                                    <span className={`payment-status ${booking.paymentStatus}`}>
                                        {booking.paymentMethod === 'online' ? 'Paid online' : 'Cash'}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="booking-footer">
                                <div className="booking-price">
                                    ₹{booking.amount || booking.service?.price || '0'}
                                </div>
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
                    ))
                )}
            </div>
        </div>
    );
};

export default SpBookings;