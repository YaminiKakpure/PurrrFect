import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './places_all.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { ChevronLeft } from 'lucide-react';

const Marts = () => {
  const [searchText, setSearchText] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [marts, setMarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMarts = async () => {
      try {
        // Fetch all places with category 'mart'
        const placesResponse = await axios.get('/api/places?category=mart');
        const martsData = placesResponse.data;
        
        // For each mart, fetch its reviews to calculate average rating
        const martsWithRatings = await Promise.all(
          martsData.map(async (mart) => {
            try {
              const reviewsResponse = await axios.get(`/api/places/${mart.id}/reviews`);
              const reviews = reviewsResponse.data;
              
              // Calculate average rating
              const averageRating = reviews.length > 0 
                ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length)
                : 0;
              
              return {
                ...mart,
                rating: parseFloat(averageRating.toFixed(1)),
                reviewsCount: reviews.length
              };
            } catch (error) {
              console.error(`Error fetching reviews for mart ${mart.id}:`, error);
              return {
                ...mart,
                rating: 0,
                reviewsCount: 0
              };
            }
          })
        );
        
        setMarts(martsWithRatings);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching marts:', error);
        setError('Failed to load marts. Please try again later.');
        setLoading(false);
      }
    };

    fetchMarts();
  }, []);

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const handleViewDetails = (mart) => {
    navigate(`/places/${mart.id}`, {
      state: {
        initialPlace: mart // Pass initial data for immediate display
      }
    });
  };

  // Filter and sort marts based on user input
  const filteredMarts = marts.filter(mart =>
    mart.name.toLowerCase().includes(searchText.toLowerCase()) ||
    mart.description.toLowerCase().includes(searchText.toLowerCase())
  );

  const sortedMarts = [...filteredMarts].sort((a, b) => {
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
        <p>Loading marts...</p>
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
          <h1>Pet-Friendly Marts</h1>
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
        {sortedMarts.length > 0 ? (
          sortedMarts.map((mart) => (
            <div className="place-card" key={mart.id}>
              <div className="park-info">
                <h2>{mart.name}</h2>
                <div className="rating">
                  <span className="star-icon">⭐</span>
                  <span>{mart.rating}</span>
                  <span className="review-count">({mart.reviewsCount} reviews)</span>
                </div>
                <p>{mart.description}</p>
                <div className="park-footer">
                  <span>{mart.price || 'Price varies'}</span>
                  <button
                    className="details-button"
                    onClick={() => handleViewDetails(mart)}
                  >
                    View Details
                  </button>
                </div>
              </div>
              <span className="distance">📍 {mart.distance || 'N/A'}</span>
            </div>
          ))
        ) : (
          <div className="no-results">
            <p>No marts found matching your search.</p>
            {searchText && (
              <button onClick={() => setSearchText('')}>Clear search</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Marts;