import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './ConfirmationPage.css';
import { ChevronLeft } from 'lucide-react';

const ConfirmationPage = () => {
    const { state: locationState } = useLocation();
    const navigate = useNavigate();
    
    const [state, setState] = useState({
        razorpayReady: false,
        bookingDetails: null,
        loading: {
            page: true,
            payment: false,
            cashPayment: false
        },
        error: null,
        paymentStatus: null,
        paymentMethod: 'online'
    });

    // Enhanced Razorpay loading with retry mechanism
    useEffect(() => {
        const loadRazorpay = async (attempt = 1) => {
            if (window.Razorpay) {
                setState(prev => ({ ...prev, razorpayReady: true }));
                return true;
            }

            return new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.async = true;
                script.onload = () => {
                    setState(prev => ({ ...prev, razorpayReady: true }));
                    resolve(true);
                };
                script.onerror = () => {
                    if (attempt < 3) {
                        setTimeout(() => resolve(loadRazorpay(attempt + 1)), 1000 * attempt);
                    } else {
                        setState(prev => ({
                            ...prev,
                            error: 'Payment system failed to load. Please refresh the page.'
                        }));
                        resolve(false);
                    }
                };
                document.body.appendChild(script);
            });
        };

        const validateBookingData = () => {
            const { service, selectedService, date, time } = locationState || {};
            const errors = [];
            
            if (!service) errors.push('Service provider not selected');
            if (!selectedService) errors.push('Service not selected');
            if (!date) errors.push('Date not selected');
            if (!time) errors.push('Time not selected');
            
            if (errors.length > 0) {
                throw new Error(errors.join(', '));
            }

            return {
                provider: service,
                selectedService,
                date,
                time
            };
        };

        const initializePage = async () => {
            try {
                const [razorpayLoaded, bookingDetails] = await Promise.all([
                    loadRazorpay(),
                    Promise.resolve(validateBookingData())
                ]);
        
                setState(prev => ({
                    ...prev,
                    bookingDetails,
                    razorpayReady: razorpayLoaded,  // <-- FIXED HERE
                    loading: { ...prev.loading, page: false }
                }));
            } catch (error) {
                console.error('Initialization error:', error);
                setState(prev => ({
                    ...prev,
                    error: error.message,
                    loading: { ...prev.loading, page: false }
                }));
            }
        };

        initializePage();

        return () => {
            // Cleanup
            const razorpayScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
            if (razorpayScript && document.body.contains(razorpayScript)) {
                document.body.removeChild(razorpayScript);
            }
            window.Razorpay = undefined;
        };
    }, [locationState]);

    const calculateTotalAmount = () => {
        if (!state.bookingDetails) return 0;
        return Number(state.bookingDetails.selectedService.price);
    };

    const handlePaymentMethodChange = (method) => {
        setState(prev => ({ ...prev, paymentMethod: method }));
    };

    const createBookingData = (paymentStatus, paymentMethod) => {
        const userData = JSON.parse(localStorage.getItem('userData')) || {};
        
        return {
            id: `booking-${Date.now()}`,
            user: {
                id: userData.id,
                name: userData.name || 'Customer',
                email: userData.email,
                phone: userData.phone
            },
            provider: state.bookingDetails.provider,
            service: state.bookingDetails.selectedService,
            date: state.bookingDetails.date,
            time: state.bookingDetails.time,
            status: 'confirmed',
            paymentStatus,
            paymentMethod,
            amount: calculateTotalAmount(),
            createdAt: new Date().toISOString()
        };
    };

    const saveBookingToLocalStorage = (bookingData) => {
        try {
            const existingBookings = JSON.parse(localStorage.getItem('petCareBookings')) || [];
            const updatedBookings = [...existingBookings, bookingData];
            localStorage.setItem('petCareBookings', JSON.stringify(updatedBookings));
            return bookingData;
        } catch (error) {
            console.error('Error saving booking:', error);
            throw new Error('Failed to save booking');
        }
    };

    const handleCashPayment = async () => {
        try {
            setState(prev => ({
                ...prev,
                loading: { ...prev.loading, cashPayment: true },
                paymentStatus: 'processing'
            }));

            const bookingData = createBookingData('pending', 'cash');
            const savedBooking = saveBookingToLocalStorage(bookingData);

            toast.success('Booking Confirmed! Pay at the time of service.');
            navigate('/end', { 
                state: { 
                    booking: savedBooking,
                    provider: state.bookingDetails.provider
                } 
            });
        } catch (error) {
            console.error("Cash payment error:", error);
            toast.error(error.message);
            setState(prev => ({
                ...prev,
                error: error.message,
                loading: { ...prev.loading, cashPayment: false },
                paymentStatus: 'failed'
            }));
        }
    };

    const handlePayment = async () => {
        try {
            if (!window.Razorpay) {
                throw new Error("Payment system is not ready");
            }

            setState(prev => ({
                ...prev,
                loading: { ...prev.loading, payment: true },
                paymentStatus: 'initiating'
            }));

            const amount = Math.round(calculateTotalAmount()); // Convert to paise

            // Create order on backend
            const orderResponse = await fetch('http://localhost:3000/api/payments/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ 
                    amount,
                    provider_id: state.bookingDetails.provider.id,
                    service_type: state.bookingDetails.provider.service_type,
                    booking_date: state.bookingDetails.date,
                    booking_time: state.bookingDetails.time
                })
            });

            if (!orderResponse.ok) {
                const errorData = await orderResponse.json();
                throw new Error(errorData.error || 'Failed to create payment order');
            }

            const orderData = await orderResponse.json();

            // Configure Razorpay options
            const options = {
                key: 'rzp_test_zvUvHBloF8oAEy',
                amount: orderData.order.amount,
                currency: "INR",
                name: "Purrfect Love Pet Care",
                description: `${state.bookingDetails.provider.service_title} Booking`,
                order_id: orderData.order.id,
                handler: async (response) => {
                    try {
                        setState(prev => ({ ...prev, paymentStatus: 'verifying' }));
                        
                        // Verify payment
                        const verification = await fetch('http://localhost:3000/api/payments/verify', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            },
                            body: JSON.stringify({
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                                booking_data: {
                                    provider_id: state.bookingDetails.provider.id,
                                    service_type: state.bookingDetails.provider.service_type,
                                    date: state.bookingDetails.date,
                                    time: state.bookingDetails.time,
                                    amount: amount / 100
                                }
                            })
                        });

                        const verificationData = await verification.json();
                        
                        if (!verificationData.success) {
                            throw new Error(verificationData.error || "Payment verification failed");
                        }

                        // Create complete booking data
                        const bookingData = {
                            id: `booking-${Date.now()}`,
                            date: state.bookingDetails.date,
                            time: state.bookingDetails.time,
                            user: JSON.parse(localStorage.getItem('userData')) || {},
                            provider: state.bookingDetails.provider,
                            service: state.bookingDetails.selectedService,
                            status: 'confirmed',
                            paymentStatus: 'paid',
                            paymentMethod: 'online',
                            amount: amount / 100,
                            paymentId: response.razorpay_payment_id,
                            createdAt: new Date().toISOString(),
                            // Add pet information if available
                            pet: JSON.parse(localStorage.getItem('selectedPet')) || null
                        };

                        // Save to local storage
                        saveBookingToLocalStorage(bookingData);

                        // Save to payment history
                        const paymentHistory = JSON.parse(localStorage.getItem('paymentHistory')) || [];
                        localStorage.setItem('paymentHistory', JSON.stringify([
                            ...paymentHistory,
                            {
                                id: response.razorpay_payment_id,
                                amount: amount / 100,
                                date: new Date().toISOString(),
                                service: state.bookingDetails.selectedService.name,
                                providerId: state.bookingDetails.provider.id
                            }
                        ]));

                        toast.success('Payment Successful!');
                        navigate('/end', { 
                            state: { 
                                booking: bookingData,
                                provider: state.bookingDetails.provider
                            } 
                        });
                    } catch (error) {
                        console.error("Payment verification error:", error);
                        toast.error(error.message);
                        setState(prev => ({
                            ...prev,
                            error: error.message,
                            paymentStatus: 'failed',
                            loading: { ...prev.loading, payment: false }
                        }));
                    }
                },
                prefill: {
                    name: localStorage.getItem('userName') || 'Customer',
                    email: localStorage.getItem('userEmail') || 'customer@example.com',
                    contact: localStorage.getItem('userPhone') || '0000000000',
                },
                theme: {
                    color: "#4CAF50"
                },
                modal: {
                    ondismiss: () => {
                        setState(prev => ({
                            ...prev,
                            loading: { ...prev.loading, payment: false },
                            paymentStatus: 'cancelled'
                        }));
                        toast.info('Payment cancelled');
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error("Payment error:", error);
            toast.error("Payment failed: " + error.message);
            setState(prev => ({
                ...prev,
                error: error.message,
                loading: { ...prev.loading, payment: false },
                paymentStatus: 'failed'
            }));
        }
    };

    const handleCancel = () => navigate(-1);

    const formatDate = (dateString) => {
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-IN', options);
    };

    if (state.loading.page) {
        return (
            <div className="loading-overlay">
                <div className="loading-spinner"></div>
                <p>Loading your booking details...</p>
            </div>
        );
    }

    if (state.error) {
        return (
            <div className="error-overlay">
                <div className="error-icon">!</div>
                <h3>Error Loading Page</h3>
                <p>{state.error}</p>
                <button 
                    className="retry-button"
                    onClick={retryPayment}
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!state.bookingDetails) {
        return (
            <div className="confirmationContainer">
                <div className="error-message">Booking information not found</div>
                <button onClick={() => navigate('/HomePage')}>Back to Home</button>
            </div>
        );
    }

    const totalAmount = calculateTotalAmount();
    const servicePrice = state.bookingDetails.selectedService.price;
    const taxAmount = totalAmount - servicePrice;

    return (
        <div className="confirmation-page">
            {/* Header */}
            <div className="confirmation-header">
                <button className="back-button" onClick={handleCancel}>
                    <ChevronLeft size={24} />
                </button>
                <h1>Booking Confirmation</h1>
            </div>

            {/* Provider Card */}
            <div className="provider-card">
                <div className="provider-info">
                    <h2>{state.bookingDetails.provider.name}</h2>
                    <p className="clinic-name">{state.bookingDetails.provider.service_title}</p>
                </div>
            </div>

            {/* Selected Service Card */}
            <div className="selected-service-card">
                <h3>Selected Service</h3>
                <div className="service-details">
                    <div className="service-name-price">
                        <h4>{state.bookingDetails.selectedService.name || state.bookingDetails.selectedService.service_name}</h4>
                        <span className="service-price">₹{servicePrice}</span>
                    </div>
                    <p className="service-description">
                        {state.bookingDetails.selectedService.description || 'Professional pet care service'}
                    </p>
                    <div className="service-meta">
                        <span className="duration">
                            ⏱️ {state.bookingDetails.selectedService.duration || '30'} mins
                        </span>
                    </div>
                </div>
            </div>

            {/* Booking Details Card */}
            <div className="details-card">
                <h3>Appointment Details</h3>
                <div className="detail-row">
                    <span>Date:</span>
                    <span>{formatDate(state.bookingDetails.date)}</span>
                </div>
                <div className="detail-row">
                    <span>Time:</span>
                    <span>{state.bookingDetails.time}</span>
                </div>
                <div className="detail-row">
                    <span>Location:</span>
                    <span>{state.bookingDetails.provider.location || 'Address not specified'}</span>
                </div>
            </div>

            {/* Payment Summary */}
            <div className="payment-summary">
                <h3>Payment Summary</h3>
                <div className="summary-row">
                    <span>Service Fee:</span>
                    <span>₹{servicePrice}</span>
                </div>
                <div className="summary-row">
                    <span>Taxes:</span>
                    <span>₹{taxAmount.toFixed(2)}</span>
                </div>
                <div className="summary-row total">
                    <span>Total Amount:</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                </div>
            </div>

            {/* Payment Method Selection */}
            <div className="payment-method">
                <h3>Payment Method</h3>
                <div className="method-options">
                    <label className={`method-option ${state.paymentMethod === 'online' ? 'active' : ''}`}>
                        <input
                            type="radio"
                            name="paymentMethod"
                            checked={state.paymentMethod === 'online'}
                            onChange={() => handlePaymentMethodChange('online')}
                        />
                        <span>Online Payment</span>
                    </label>
                    <label className={`method-option ${state.paymentMethod === 'cash' ? 'active' : ''}`}>
                        <input
                            type="radio"
                            name="paymentMethod"
                            checked={state.paymentMethod === 'cash'}
                            onChange={() => handlePaymentMethodChange('cash')}
                        />
                        <span>Cash on Delivery</span>
                    </label>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
                <button 
                    className="cancel-btn"
                    onClick={handleCancel}
                    disabled={state.loading.payment || state.loading.cashPayment}
                >
                    Cancel
                </button>
                {state.paymentMethod === 'online' ? (
                    <button 
                        className="confirm-btn"
                        onClick={handlePayment}
                        disabled={!state.razorpayReady || state.loading.payment}
                    >
                        {state.loading.payment ? "Processing..." : `Pay ₹${totalAmount.toFixed(2)}`}
                    </button>
                ) : (
                    <button 
                        className="confirm-btn cash-btn"
                        onClick={handleCashPayment}
                        disabled={state.loading.cashPayment}
                    >
                        {state.loading.cashPayment ? "Confirming..." : `Confirm Booking`}
                    </button>
                )}
            </div>
        </div>
    );
};

export default ConfirmationPage;