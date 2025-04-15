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
        paymentMethod: 'online' // 'online' or 'cash'
    });

    useEffect(() => {
        console.log('[DEBUG] Component mounted, loading Razorpay');

        const loadRazorpay = async () => {
            if (window.Razorpay) {
                console.log('[DEBUG] Razorpay already loaded');
                setState(prev => ({ ...prev, razorpayReady: true }));
                return true;
            }

            console.log('[DEBUG] Loading Razorpay script');
            return new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.async = true;
                script.onload = () => {
                    console.log('[DEBUG] Razorpay script loaded successfully');
                    setState(prev => ({ ...prev, razorpayReady: true }));
                    resolve(true);
                };
                script.onerror = () => {
                    console.error('[DEBUG] Razorpay script failed to load');
                    setState(prev => ({ ...prev, razorpayReady: false }));
                    resolve(false);
                };
                document.body.appendChild(script);
            });
        };

        const fetchBookingData = async () => {
            try {
                const { service, selectedService, date, time } = locationState || {};
                
                if (!service || !date || !time || !selectedService) {
                    throw new Error('Missing booking information');
                }

                setState(prev => ({
                    ...prev,
                    bookingDetails: {
                        provider: service,
                        selectedService,
                        date,
                        time
                    },
                    loading: { ...prev.loading, page: false }
                }));
            } catch (err) {
                console.error('Error fetching booking data:', err);
                setState(prev => ({
                    ...prev,
                    error: err.message || 'Failed to load booking details',
                    loading: { ...prev.loading, page: false }
                }));
            }
        };

        const loadAll = async () => {
            try {
                const [razorpayLoaded] = await Promise.all([
                    loadRazorpay(),
                    fetchBookingData()
                ]);
                
                if (!razorpayLoaded) {
                    setState(prev => ({
                        ...prev,
                        error: 'Failed to load payment system. Please refresh the page.'
                    }));
                }
            } catch (err) {
                console.error('[DEBUG] Initialization error:', err);
                setState(prev => ({
                    ...prev,
                    error: 'Failed to initialize. Please try again.'
                }));
            }
        };

        loadAll();

        return () => {
            if (window.Razorpay) {
                window.Razorpay = undefined;
            }
        };
    }, [locationState]);

    const retryPayment = async () => {
        setState(prev => ({ ...prev, error: null }));
        await handlePayment();
    };

    const calculateTotalAmount = () => {
        if (!state.bookingDetails) return 0;
        const servicePrice = state.bookingDetails.selectedService.price;
        const taxRate = 0.00; // Change this if you want to add taxes
        return servicePrice * (1 + taxRate);
    };

    const handlePaymentMethodChange = (method) => {
        setState(prev => ({ ...prev, paymentMethod: method }));
    };

    const handleCashPayment = async () => {
        try {
            setState(prev => ({
                ...prev,
                loading: { ...prev.loading, cashPayment: true },
                paymentStatus: 'processing'
            }));
    
            if (!state.bookingDetails) {
                throw new Error('Booking details not loaded');
            }
    
            const bookingData = {
                id: `booking-${Date.now()}`,
                provider: state.bookingDetails.provider,
                service: state.bookingDetails.selectedService,
                date: state.bookingDetails.date,
                time: state.bookingDetails.time,
                status: 'confirmed',
                paymentStatus: 'pending',
                amount: calculateTotalAmount(),
                paymentMethod: 'cash'
            };
    
            // Save to localStorage - ensure we're merging with existing bookings
            const existingBookings = JSON.parse(localStorage.getItem('petCareBookings')) || [];
            const updatedBookings = [...existingBookings, bookingData];
            localStorage.setItem('petCareBookings', JSON.stringify(updatedBookings));
    
            setState(prev => ({ ...prev, paymentStatus: 'completed' }));
            
            toast.success('Booking Confirmed! Pay at the time of service.');
            navigate('/end', { 
                state: { 
                    booking: bookingData,
                    provider: state.bookingDetails.provider
                } 
            });
        } catch (error) {
            console.error("Cash payment error:", error);
            toast.error("Failed to confirm booking: " + error.message);
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
                toast.error("Payment system is still loading. Please wait...");
                return;
            }

            setState(prev => ({
                ...prev,
                loading: { ...prev.loading, payment: true },
                paymentStatus: 'initiating'
            }));

            if (!state.bookingDetails) {
                throw new Error('Booking details not loaded');
            }

            // Calculate total amount in paise (Razorpay expects amount in smallest currency unit)
            const amount = Math.round(calculateTotalAmount());

            // Step 1: Create an order on the backend
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

            // Step 2: Configure Razorpay options
            const options = {
                key: 'rzp_test_zvUvHBloF8oAEy',
                amount: orderData.order.amount,
                currency: "INR",
                name: "Purrfect Love Pet Care",
                description: `${state.bookingDetails.provider.service_title} Booking`,
                order_id: orderData.order.id,
                handler: async (response) => {
                    setState(prev => ({ ...prev, paymentStatus: 'verifying' }));
                    try {
                        // Step 3: Verify payment and save booking
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

                        // Save payment to history
                        const paymentData = {
                            service: state.bookingDetails.selectedService.name,
                            amount: amount / 100,
                            date: new Date().toISOString(),
                            paymentId: response.razorpay_payment_id
                        };
                        const existingPayments = JSON.parse(localStorage.getItem('paymentHistory')) || [];
                        localStorage.setItem('paymentHistory', JSON.stringify([...existingPayments, paymentData]));
                    
                        // Save booking
                        const bookingData = {
                            ...verificationData.booking,
                            provider: state.bookingDetails.provider, // Make sure to include provider
                            service: state.bookingDetails.selectedService, // Include service details
                            paymentMethod: 'online',
                            paymentStatus: 'completed',
                            status: 'confirmed'
                        };
                        const existingBookings = JSON.parse(localStorage.getItem('petCareBookings')) || [];
                        localStorage.setItem('petCareBookings', JSON.stringify([...existingBookings, bookingData]));

                        setState(prev => ({ ...prev, paymentStatus: 'completed' }));
                        
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
                    contact: state.bookingDetails.provider.phone || '0000000000',
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

            // Step 4: Open Razorpay Payment UI
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