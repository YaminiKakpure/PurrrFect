import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import './PlacesDetails.css';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import axios from 'axios';
import { ChevronLeft, Star, MapPin, Clock, IndianRupeeIcon, Heart } from 'lucide-react';
import place1 from '../../assets/place1.jpeg';
import place2 from '../../assets/place2.jpeg';

const PlaceDetails = () => {
  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();

  // Initialize with default values if no state is passed
  const [place, setPlace] = useState(state?.initialPlace || state?.initialPark || {
    id: id || 'default-id',
    name: 'Place Name',
    description: 'Default description for this place',
    address: 'Address not specified',
    hours: '09:00 - 18:00',
    price: 'Free entry',
    features: 'Pet-friendly, Outdoor seating, Water available'
  });

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  // Default images
  const defaultImages = [place1, place2];
  
  // Generate mock reviews
  const generateMockReviews = () => {
    const mockUsers = ['Pet Lover', 'Dog Owner', 'Cat Enthusiast'];
    const mockComments = [
      'Great place for pets! My dog loved it.',
      'Clean and well-maintained area.',
      'Plenty of space for dogs to run around.'
    ];
    
    return Array.from({ length: 3 }, (_, i) => ({
      id: `mock-${i}`,
      user_name: mockUsers[i % mockUsers.length],
      rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
      review: mockComments[i % mockComments.length],
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // If we have place data from state, use it directly
        if (state?.initialPlace || state?.initialPark) {
          setReviews(generateMockReviews());
          return;
        }

        // Otherwise try to fetch data if we have an ID
        if (!id) {
          throw new Error('Place ID is missing');
        }

        // Simulate API call (replace with actual axios calls)
        await new Promise(resolve => setTimeout(resolve, 500));
        setReviews(generateMockReviews());
        
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
        setReviews(generateMockReviews()); // Fallback to mock data
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, state]);

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length || 0;

  const renderStars = (rating) => {
    const safeRating = Math.min(5, Math.max(0, isNaN(rating) ? 0 : rating));
    return (
      <div className="stars-container">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star}
            size={18}
            fill={safeRating >= star ? '#FFD700' : 'none'}
            color="#FFD700"
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="placeDetailsContainer">
        <div className="loading-spinner"></div>
        <p>Loading place details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="placeDetailsContainer">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="placeDetailsContainer">
      {/* Header Section */}
      <div className="placeDetailsHeader">
        <button className="backButton" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <h1>{place.name}</h1>
        <button 
          className={`favoriteButton ${isFavorite ? 'active' : ''}`}
          onClick={() => setIsFavorite(!isFavorite)}
        >
          <Heart size={24} fill={isFavorite ? 'red' : 'none'} color={isFavorite ? 'red' : 'currentColor'} />
        </button>
      </div>

      {/* Image Carousel */}
      <div className="carouselContainer">
        <Carousel showThumbs={false} infiniteLoop={true} autoPlay={false}>
          {defaultImages.map((img, index) => (
            <div key={index}>
              <img 
                src={img} 
                alt={`${place.name} view ${index + 1}`}
                className="carouselImage"
              />
            </div>
          ))}
        </Carousel>
      </div>

      {/* Ratings and Info Section */}
      <div className="ratingsAndInfo">
        <div className="ratingSummary">
          <span className="ratingValue">{averageRating.toFixed(1)}</span>
          <div className="ratingStars">{renderStars(averageRating)}</div>
          <span className="reviewCount">({reviews.length} reviews)</span>
        </div>
        
        <div className="quickInfo">
          <div className="infoItem">
            <MapPin size={16} />
            <span>{place.address}</span>
          </div>
          <div className="infoItem">
            <IndianRupeeIcon size={16} />
            <span>{place.price}</span>
          </div>
        </div>
        
        <div className="section">
          <h3>About</h3>
          <p className="placeDescription">{place.description}</p>
        </div>
        
        {place.features && (
          <div className="section">
            <h3>Features</h3>
            <div className="placeFeatures">
              {place.features.split(',').map((feature, index) => (
                <div className="placeFeature" key={index}>
                  <span className="placeFeatureIcon">✓</span>
                  <span className="placeFeatureText">{feature.trim()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reviews Section */}
      <div className="reviewsSection">
        <div className="sectionHeader">
          <h3>Customer Reviews</h3>
          <button className="addReviewButton">Add Review</button>
        </div>
        
        {reviews.length > 0 ? (
          <>
            <div className="reviewsList">
              {reviews.map((review) => (
                <div className="reviewItem" key={review.id}>
                  <div className="reviewHeader">
                    <div className="reviewAuthor">{review.user_name}</div>
                    <div className="reviewMeta">
                      <div className="reviewRating">
                        {renderStars(review.rating)}
                      </div>
                      <span className="reviewDate">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className="reviewText">{review.review}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="noReviews">
            <p>No reviews yet. Be the first to review!</p>
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className="ctaSection">
        <button className="primaryButton">Get Directions</button>
        <button className="secondaryButton">Share This Place</button>
      </div>
    </div>
  );
};

export default PlaceDetails;