import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar, Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';
// import './BookingDetailsPage.css';

const BookingDetailsPage = () => {
    const { state } = useLocation();
    const booking = state?.booking;
    const navigate = useNavigate();

    if (!booking) {
        return (
            <div className="booking-details-container">
                <p>Booking details not found</p>
                <button onClick={() => navigate('/bookings')}>Back to Bookings</button>
            </div>
        );
    }

    const formatDate = (dateString) => {
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-IN', options);
    };

    return (
        <div className="booking-details-page">
            <div className="booking-header">
                <button className="back-button" onClick={() => navigate(-1)}>
                    <ChevronLeft size={24} />
                </button>
                <h1>Booking Details</h1>
            </div>

            <div className="booking-card">
                <div className="booking-status-badge">
                    {booking.status === 'completed' ? (
                        <CheckCircle size={20} color="#4CAF50" />
                    ) : booking.status === 'cancelled' ? (
                        <XCircle size={20} color="#F44336" />
                    ) : null}
                    <span>{booking.status}</span>
                </div>

                <div className="provider-info">
                    <img 
                        src={booking.provider.profile_photo} 
                        alt={booking.provider.name}
                        className="provider-image"
                    />
                    <div>
                        <h2>{booking.provider.name}</h2>
                        <p className="service-title">{booking.provider.service_title}</p>
                    </div>
                </div>

                <div className="booking-details-section">
                    <h3>Service Details</h3>
                    <div className="detail-item">
                        <span>Service:</span>
                        <span>{booking.service.name}</span>
                    </div>
                    <div className="detail-item">
                        <span>Duration:</span>
                        <span>{booking.service.duration}</span>
                    </div>
                    <div className="detail-item">
                        <span>Amount:</span>
                        <span>₹{booking.amount}</span>
                    </div>
                </div>

                <div className="booking-details-section">
                    <h3>Appointment Details</h3>
                    <div className="detail-item">
                        <Calendar size={18} />
                        <span>{formatDate(booking.date)}</span>
                    </div>
                    <div className="detail-item">
                        <Clock size={18} />
                        <span>{booking.time}</span>
                    </div>
                    <div className="detail-item">
                        <MapPin size={18} />
                        <span>{booking.provider.location}</span>
                    </div>
                </div>

                <div className="booking-details-section">
                    <h3>Payment Information</h3>
                    <div className="detail-item">
                        <span>Payment Status:</span>
                        <span>{booking.paymentStatus}</span>
                    </div>
                    <div className="detail-item">
                        <span>Payment Method:</span>
                        <span>Razorpay (Online)</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingDetailsPage;