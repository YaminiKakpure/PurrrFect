import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './places_all.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { ChevronLeft } from 'lucide-react';

const Parks = () => {
  const [searchText, setSearchText] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [parks, setParks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchParks = async () => {
      try {
        // Fetch all places with category 'park'
        const placesResponse = await axios.get('/api/places?category=park');
        const parksData = placesResponse.data;
        
        // For each park, fetch its reviews to calculate average rating
        const parksWithRatings = await Promise.all(
          parksData.map(async (park) => {
            try {
              const reviewsResponse = await axios.get(`/api/places/${park.id}/reviews`);
              const reviews = reviewsResponse.data;
              
              // Calculate average rating
              const averageRating = reviews.length > 0 
                ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
            ): 0;
              
              return {
                ...park,
                rating: parseFloat(averageRating.toFixed(1)),
                reviewsCount: reviews.length
              };
            } catch (error) {
              console.error(`Error fetching reviews for park ${park.id}:`, error);
              return {
                ...park,
                rating: 0,
                reviewsCount: 0
              };
            }
          })
        );
        
        setParks(parksWithRatings);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching parks:', error);
        setError('Failed to load parks. Please try again later.');
        setLoading(false);
      }
    };

    fetchParks();
  }, []);

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const handleViewDetails = (park) => {
    navigate(`/places/${park.id}`, {
      state: {
        initialPlace: park // Pass initial data for immediate display
      }
    });
  };

  // Filter and sort parks based on user input
  const filteredParks = parks.filter(park =>
    park.name.toLowerCase().includes(searchText.toLowerCase()) ||
    park.description.toLowerCase().includes(searchText.toLowerCase())
  );

  const sortedParks = [...filteredParks].sort((a, b) => {
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
      <div className="place-card">
        <div className="loading-spinner"></div>
        <p>Loading parks...</p>
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
          <h1>Pet-Friendly Places</h1>
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
        {sortedParks.length > 0 ? (
          sortedParks.map((park) => (
            <div className="park-card" key={park.id}>
              <div className="park-info">
                <h2>{park.name}</h2>
                <div className="rating">
                  <span className="star-icon">⭐</span>
                  <span>{park.rating}</span>
                  <span className="review-count">({park.reviewsCount} reviews)</span>
                </div>
                <p>{park.description}</p>
                <div className="park-footer">
                  <span>{park.price || 'Free entry'}</span>
                  <button
                    className="details-button"
                    onClick={() => handleViewDetails(park)}
                  >
                    View Details
                  </button>
                </div>
              </div>
              <span className="distance">📍 {park.distance || 'N/A'}</span>
            </div>
          ))
        ) : (
          <div className="no-results">
            <p>No parks found matching your search.</p>
            {searchText && (
              <button onClick={() => setSearchText('')}>Clear search</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Parks;