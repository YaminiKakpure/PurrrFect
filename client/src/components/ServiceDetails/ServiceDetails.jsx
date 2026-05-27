import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import './ServiceDetails.css';
import { ChevronLeft } from 'lucide-react';

// Import local images
import vetImage from '../../assets/vet.jpg';
import groomingImage from '../../assets/GROOMING.jpeg';
import boardingImage from '../../assets/TRAINING.jpeg';
import trainingImage from '../../assets/SHOP.jpeg';

const ServiceDetails = () => {
    const { state } = useLocation();
    const service = state?.service;
    const navigate = useNavigate();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [selectedService, setSelectedService] = useState(null);

    // Universal service images
    const serviceImages = [vetImage, groomingImage, boardingImage, trainingImage];

    // Universal random reviews
    const universalReviews = [
        {
            rating: 5,
            text: 'Excellent service! My pet was treated with great care and professionalism.',
            author: 'Shruti Mahure',
            date: '2 weeks ago'
        },
        {
            rating: 4,
            text: 'Very friendly staff and clean facility. Would recommend to other pet owners.',
            author: 'Aman Nikhar',
            date: '1 month ago'
        },
        {
            rating: 5,
            text: 'They truly care about animals. My pet always comes back happy!',
            author: 'Vaishnavi Hemke',
            date: '3 weeks ago'
        },
        {
            rating: 3,
            text: 'Good service but a bit pricey. Overall satisfied with the results.',
            author: 'Shreyash Meshram',
            date: '2 months ago'
        },
        {
            rating: 4,
            text: 'Convenient location and knowledgeable staff. My pet enjoys the visits.',
            author: 'Ruchit Prasad',
            date: '1 week ago'
        },
        {
            rating: 5,
            text: 'Good Services.',
            author: 'Chomya Kori',
            date: '1 day ago'
        }
    ];

    // Function to generate random rating between 3.5 and 5 with 0.5 increments
    const generateRandomRating = () => {
        const possibleRatings = [3.5, 4.0, 4.5, 5.0];
        return possibleRatings[Math.floor(Math.random() * possibleRatings.length)];
    };

    // Function to generate random experience between 1 and 10 years
    const generateRandomExperience = () => {
        return Math.floor(Math.random() * 10) + 1;
    };

    const defaultService = {
        name: 'Service Provider',
        service_title: 'Professional Pet Services',
        service_description: 'Quality care for your beloved pets',
        rating: generateRandomRating(),
        reviews_count: universalReviews.length,
        location: 'Address not specified',
        phone: 'Contact number not available',
        opening_time: '09:00',
        closing_time: '18:00',
        home_service: false,
        emergency_service: false,
        experience: generateRandomExperience(),
        services: [
            { name: 'Basic Service', price: 500, duration: '1 hour', description: 'Standard care package' },
            { name: 'Premium Service', price: 800, duration: '2 hours', description: 'Includes additional treatments' },
            { name: 'Deluxe Package', price: 1200, duration: '3 hours', description: 'Complete care with premium options' }
        ]
    };

    const displayService = service || defaultService;

    // Function to get random reviews
    const getRandomReviews = () => {
        const count = Math.floor(Math.random() * 2) + 2; // 2-3 reviews
        return [...universalReviews]
            .sort(() => 0.5 - Math.random())
            .slice(0, count);
    };

    const [reviews] = useState(getRandomReviews());
    const handleServiceSelect = (service) => {
        setSelectedService(service);
    };

    const handleBookNow = () => {
        if (!selectedService) {
            alert('Please select a service before booking');
            return;
        }
        setIsModalOpen(true);
    };

    const handleConfirmation = () => {
        if (selectedDate && selectedTime && selectedService) {
            navigate('/confirmation', {
                state: {
                    service: displayService,
                    selectedService,
                    date: selectedDate,
                    time: selectedTime
                }
            });
        } else {
            alert('Please select date and time to continue');
        }
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <span key={i} className={`sd-star ${i < Math.round(rating) ? 'filled' : ''}`}>
                ★
            </span>
        ));
    };

    if (!service) {
        return (
            <div className="sd-container">
                <div className="sd-header">
                    <button className="sd-back-button" onClick={() => navigate(-1)}>
                        <ChevronLeft size={24} />
                    </button>
                    <h1>Service Details</h1>
                </div>
                <div className="sd-no-service-message">
                    <p>Service details not available</p>
                    <button className="sd-home-button" onClick={() => navigate('/')}>Return to Home</button>
                </div>
            </div>
        );
    }

    return (
        <div className="sd-container">
            <div className="sd-header">
                <button className="sd-back-button" onClick={() => navigate(-1)}>
                    <ChevronLeft size={24} />
                </button>
                <h1>{displayService.service_title}</h1>
            </div>

            <div className="sd-carousel">
              <Carousel 
                showThumbs={false} 
                infiniteLoop={true} 
                showStatus={false}
                showIndicators={true}
                autoPlay={true}
                interval={5000}
                stopOnHover={true}
                emulateTouch={true}
                dynamicHeight={false}
                centerMode={true}
                centerSlidePercentage={80}
              >
                {serviceImages.slice(0, 3).map((image, index) => ( // Only show first 3 images
                  <div key={index} className="sd-carousel-slide">
                    <img
                      src={image}
                      alt={`Service ${index + 1}`}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/800x400?text=Pet+Service';
                      }}
                    />
                  </div>
                ))}
              </Carousel>
            </div>

            <div className="sd-content">
                <section className="sd-info">
                <div className="sd-rating-section">
                  <div className="sd-stars">
                    {[...Array(5)].map((_, i) => (
                      <span 
                        key={i} 
                        className={`star ${i < Math.round(displayService.rating) ? 'filled' : ''}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <div className="sd-review-count">({reviews.length} reviews)</div>
                </div>

                    <p className="sd-description">{displayService.service_description}</p>

                    <div className="sd-meta">
                        <div className="sd-meta-item">
                            <span className="sd-meta-icon">⏱️</span>
                            <span>{displayService.experience}+ years experience</span>
                        </div>
                        {displayService.home_service && (
                            <div className="sd-meta-item">
                                <span className="sd-meta-icon">🏠</span>
                                <span>Home service available</span>
                            </div>
                        )}
                        {displayService.emergency_service && (
                            <div className="sd-meta-item">
                                <span className="sd-meta-icon">🚨</span>
                                <span>Emergency services</span>
                            </div>
                        )}
                    </div>
                </section>

                <section className="sd-services-selection">
                    <h2>Available Services</h2>
                    <p className="sd-selection-instruction">Select one service to continue:</p>

                    <div className="sd-service-cards">
                        {displayService.services.map((service, index) => (
                            <div
                                key={index}
                                className={`sd-service-card ${selectedService?.name === service.name ? 'selected' : ''}`}
                                onClick={() => handleServiceSelect(service)}
                            >
                                <div className="sd-card-content">
                                    <h3>{service.name}</h3>
                                    <p className="sd-service-duration">{service.duration} min</p>
                                    <p className="sd-description">{service.description}</p>
                                    <div className="sd-price">₹{service.price}</div>
                                </div>
                                <div className="sd-selection-indicator">
                                    {selectedService?.name === service.name ? (
                                        <span className="sd-selected-icon">✓ Selected</span>
                                    ) : (
                                        <button className="sd-select-button">Select</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="sd-location-section">
                    <h2>Location & Contact</h2>
                    <div className="sd-location-details">
                        <div className="sd-detail-item">
                            <span className="sd-detail-icon">📍</span>
                            <span>{displayService.location}</span>
                        </div>
                        <div className="sd-detail-item">
                            <span className="sd-detail-icon">⏰</span>
                            <span>{displayService.opening_time} - {displayService.closing_time}</span>
                        </div>
                        <div className="sd-detail-item">
                            <span className="sd-detail-icon">📞</span>
                            <span>{displayService.phone}</span>
                        </div>
                    </div>
                </section>

                <section className="sd-reviews-section">
                <h2>Customer Reviews</h2>
                    {reviews.length > 0 ? (
                        <div className="sd-reviews-list">
                            {reviews.map((review, index) => (
                                <div className="sd-review-item" key={index}>
                                    <div className="sd-review-header">
                                        <div className="sd-review-rating">{renderStars(review.rating)}</div>
                                        <div className="sd-review-author">{review.author}</div>
                                        <div className="sd-review-date">{review.date}</div>
                                    </div>
                                    <p className="sd-review-text">{review.text}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="sd-no-reviews">No reviews yet</p>
                    )}
                </section>

                <div className="sd-booking-footer">
                    {selectedService && (
                        <div className="sd-selected-service-info">
                            <span className="sd-service-name">{selectedService.name}</span>
                            <span className="sd-service-price">₹{selectedService.price}</span>
                        </div>
                    )}
                    <button className="sd-book-now-button" onClick={handleBookNow}>Book Now</button>
                </div>

                {isModalOpen && (
                    <div className="sd-booking-modal">
                        <div className="sd-modal-content">
                            <h2>Booking Summary</h2>
                            <div className="sd-booking-summary">
                                <div className="sd-form-group">
                                    <label>Select Date:</label>
                                    <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                                </div>
                                <div className="sd-form-group">
                                    <label>Select Time:</label>
                                    <input type="time" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} />
                                </div>
                            </div>
                            <div className="sd-modal-actions">
                                <button className="sd-cancel-button" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button className="sd-confirm-button" onClick={handleConfirmation}>Confirm</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServiceDetails;
