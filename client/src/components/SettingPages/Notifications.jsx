import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Notifications.css';
import { ChevronLeft } from 'lucide-react';

const Notifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);

    // Sample notification templates
    const notificationTemplates = {
        paymentSuccess: (service, amount) => ({
            title: "Payment Successful",
            message: `You've successfully paid ₹${amount} for ${service}`,
            icon: "credit-card",
            type: "payment"
        }),
        bookingConfirmed: (provider, date, time) => ({
            title: "Booking Confirmed",
            message: `Your appointment with ${provider} is confirmed for ${date} at ${time}`,
            icon: "calendar-check",
            type: "booking"
        }),
        reminder: (service, date, time) => ({
            title: "Reminder",
            message: `Don't forget your ${service} appointment tomorrow at ${time}`,
            icon: "bell",
            type: "reminder"
        }),
        offer: (discount, service) => ({
            title: "Special Offer!",
            message: `Limited-time ${discount}% off on ${service}. Book now!`,
            icon: "tag",
            type: "offer"
        }),
        newService: (service) => ({
            title: "New Service Available",
            message: `We now offer ${service} for your pets! Check it out.`,
            icon: "plus-circle",
            type: "info"
        })
    };

    // Generate random notifications
    const generateRandomNotifications = () => {
        const now = new Date();
        const storedBookings = JSON.parse(localStorage.getItem('petCareBookings')) || [];
        const storedPayments = JSON.parse(localStorage.getItem('paymentHistory')) || [];

        // Notifications from existing data
        const existingNotifications = [
            ...storedBookings.map(booking => {
                const providerName = booking.provider?.name || 'Unknown Provider';
                const bookingDate = booking.date || 'Unknown Date';
                const bookingTime = booking.time || 'Unknown Time';
                
                return {
                    ...notificationTemplates.bookingConfirmed(
                        providerName,
                        bookingDate,
                        bookingTime
                    ),
                    timestamp: new Date(booking.date || Date.now()).getTime(),
                    read: false
                };
            }),
            ...storedPayments.map(payment => ({
                ...notificationTemplates.paymentSuccess(
                    payment.service || 'Unknown Service', 
                    payment.amount || 0
                ),
                timestamp: new Date(payment.date || Date.now()).getTime(),
                read: false
            }))
        ];

        // Random additional notifications
        const randomNotifications = [
            {
                ...notificationTemplates.reminder(
                    "grooming session", 
                    "Feb 20", 
                    "3 PM"
                ),
                timestamp: now.getTime() - 3600000, // 1 hour ago
                read: false
            },
            {
                ...notificationTemplates.offer(
                    15, 
                    "pet training services"
                ),
                timestamp: now.getTime() - 86400000, // 1 day ago
                read: false
            },
            {
                ...notificationTemplates.newService(
                    "pet spa treatments"
                ),
                timestamp: now.getTime() - 172800000, // 2 days ago
                read: false
            }
        ];

        // Combine and sort by timestamp (newest first)
        const allNotifications = [...existingNotifications, ...randomNotifications]
            .sort((a, b) => b.timestamp - a.timestamp);

        setNotifications(allNotifications);
    };

    // Simulate real-time notifications
    useEffect(() => {
        generateRandomNotifications();

        // Check for new notifications periodically
        const interval = setInterval(() => {
            // 20% chance to add a new notification
            if (Math.random() < 0.2) {
                const offerTypes = ["grooming", "training", "vet consultation", "pet sitting"];
                const randomOffer = offerTypes[Math.floor(Math.random() * offerTypes.length)];
                
                const newNotification = {
                    ...notificationTemplates.offer(
                        Math.floor(Math.random() * 20) + 10, // 10-30% discount
                        randomOffer
                    ),
                    timestamp: new Date().getTime(),
                    read: false
                };

                setNotifications(prev => [newNotification, ...prev]);
            }
        }, 300000); // Check every 5 minutes

        return () => clearInterval(interval);
    }, []);

    // Mark notification as read
    const markAsRead = (index) => {
        const updatedNotifications = [...notifications];
        updatedNotifications[index].read = true;
        setNotifications(updatedNotifications);
    };

    // Format time difference (e.g., "2 hours ago")
    const formatTime = (timestamp) => {
        const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
        
        if (seconds < 60) return "Just now";
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        return `${Math.floor(seconds / 86400)} days ago`;
    };

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="notificationsContainer">
            <div className="notificationsHeader">
                <button className="backButton" onClick={handleBack}>
                    <ChevronLeft size={24} />
                </button>
                <h1>Notifications</h1>
                <p>Stay updated with your pet care activities</p>
            </div>

            <div className="notificationsContent">
                {notifications.length === 0 ? (
                    <div className="emptyState">
                        <i className="fas fa-bell-slash"></i>
                        <p>No notifications yet</p>
                    </div>
                ) : (
                    notifications.map((notification, index) => (
                        <div 
                            key={index} 
                            className={`notificationCard ${notification.read ? 'read' : 'unread'}`}
                            onClick={() => markAsRead(index)}
                        >
                            <div className="notificationIcon">
                                <i className={`fas fa-${notification.icon}`}></i>
                            </div>
                            <div className="notificationDetails">
                                <h3>{notification.title}</h3>
                                <p>{notification.message}</p>
                                <span>{formatTime(notification.timestamp)}</span>
                                {!notification.read && <div className="unreadBadge"></div>}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notifications;