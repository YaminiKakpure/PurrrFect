import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './places_all.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { ChevronLeft } from 'lucide-react';

const Cafes = () => {
  const [searchText, setSearchText] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCafes = async () => {
      try {
        // Fetch all places with category 'cafe'
        const placesResponse = await axios.get('/api/places?category=cafe');
        const cafesData = placesResponse.data;
        
        // For each cafe, fetch its reviews to calculate average rating
        const cafesWithRatings = await Promise.all(
          cafesData.map(async (cafe) => {
            try {
              const reviewsResponse = await axios.get(`/api/places/${cafe.id}/reviews`);
              const reviews = reviewsResponse.data;
              
              // Calculate average rating
              const averageRating = reviews.length > 0 
                ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length)
                : 0;
              
              return {
                ...cafe,
                rating: parseFloat(averageRating.toFixed(1)),
                reviewsCount: reviews.length
              };
            } catch (error) {
              console.error(`Error fetching reviews for cafe ${cafe.id}:`, error);
              return {
                ...cafe,
                rating: 0,
                reviewsCount: 0
              };
            }
          })
        );
        
        setCafes(cafesWithRatings);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching cafes:', error);
        setError('Failed to load cafes. Please try again later.');
        setLoading(false);
      }
    };

    fetchCafes();
  }, []);

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const handleViewDetails = (cafe) => {
    navigate(`/places/${cafe.id}`, {
      state: {
        initialPlace: cafe // Pass initial data for immediate display
      }
    });
  };

  // Filter and sort cafes based on user input
  const filteredCafes = cafes.filter(cafe =>
    cafe.name.toLowerCase().includes(searchText.toLowerCase()) ||
    cafe.description.toLowerCase().includes(searchText.toLowerCase())
  );

  const sortedCafes = [...filteredCafes].sort((a, b) => {
    switch (sortOption) {
      case 'nearest':
        return parseFloat(a.distance) - parseFloat(b.distance);
      case 'top-rated':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="places-container">
        <div className="loading-spinner"></div>
        <p>Loading cafes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="places-container">
        <div className="error-message">
          {error}
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="places-container">
      <div className="header-section">
        <div className="header-content">
          <h1>Pet-Friendly Cafes</h1>
          <p>Find the perfect spots for you and your furry friend</p>
        </div>
        <button className="back-button" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
      </div>

      <div className="search-sort-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search locations..."
            value={searchText}
            onChange={handleSearchChange}
          />
          <span className="search-icon">
            <FontAwesomeIcon icon={faSearch} />
          </span>
        </div>

        <div className="sort-dropdown">
          <select
            className="hotels-filter-dropdown"
            value={sortOption}
            onChange={handleSortChange}
          >
            <option value="">Sort</option>
            <option value="nearest">Nearest</option>
            <option value="top-rated">Top Rated</option>
          </select>
        </div>
      </div>

      <div className="places-list">
        {sortedCafes.length > 0 ? (
          sortedCafes.map((cafe) => (
            <div className="place-card" key={cafe.id}>
              <div className="park-info">
                <h2>{cafe.name}</h2>
                <div className="rating">
                  <span className="star-icon">⭐</span>
                  <span>{cafe.rating}</span>
                  <span className="review-count">({cafe.reviewsCount} reviews)</span>
                </div>
                <p>{cafe.description}</p>
                <div className="park-footer">
                  <span>{cafe.price || 'Price varies'}</span>
                  <button
                    className="details-button"
                    onClick={() => handleViewDetails(cafe)}
                  >
                    View Details
                  </button>
                </div>
              </div>
              <span className="distance">📍 {cafe.distance || 'N/A'}</span>
            </div>
          ))
        ) : (
          <div className="no-results">
            <p>No cafes found matching your search.</p>
            {searchText && (
              <button onClick={() => setSearchText('')}>Clear search</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cafes;