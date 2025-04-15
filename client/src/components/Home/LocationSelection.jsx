// LocationSelection.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faLocationDot, faSearch } from "@fortawesome/free-solid-svg-icons";
import './LocationSelection.css';
import { ChevronLeft } from 'lucide-react';

// Local database of Nagpur locations with pincodes
const NAGPUR_LOCATIONS = [
  { name: "Medical Square", pincode: "440003" },
  { name: "Bajaj Nagar", pincode: "440010" },
  { name: "Sitabuldi", pincode: "440012" },
  { name: "Ramdaspeth", pincode: "440010" },
  { name: "Dharampeth", pincode: "440010" },
  { name: "Wardha Road", pincode: "440015" },
  { name: "Sadar", pincode: "440001" },
  { name: "Civil Lines", pincode: "440001" },
  { name: "Manewada", pincode: "440027" },
  { name: "Hingna", pincode: "440028" },
  { name: "Koradi", pincode: "441111" },
  { name: "Kamptee", pincode: "441001" },
];

function LocationSelection() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Filter locations based on search query
  const filteredLocations = searchQuery
    ? NAGPUR_LOCATIONS.filter(location =>
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.pincode.includes(searchQuery)
      )
    : [];

  // Handle using current location
  const handleUseCurrentLocation = async () => {
    setIsLoading(true);
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const { latitude, longitude } = position.coords;
      const address = await getAddressFromCoordinates(latitude, longitude);
      
      localStorage.setItem('userLocation', JSON.stringify({
        lat: latitude,
        lng: longitude,
        address: address
      }));

      navigate('/HomePage');
    } catch (error) {
      console.error("Location error:", error);
      alert("Failed to get location. Please try searching manually.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle selecting a location from the list
  const handleSelectLocation = (location) => {
    localStorage.setItem('userLocation', JSON.stringify({
      address: `${location.name}, Nagpur - ${location.pincode}`
    }));
    navigate('/HomePage');
  };

  return (
    <div className="location-selection-container">
      <header className="location-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} />
        </button>
        <h2>Select Location</h2>
      </header>

      <div className="search-container">
        <FontAwesomeIcon icon={faSearch} className="search-icon" />
        <input
          type="text"
          placeholder="Search for area, street or pincode"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="location-options">
        <div 
          className={`option-card ${isLoading ? 'loading' : ''}`} 
          onClick={handleUseCurrentLocation}
        >
          <FontAwesomeIcon icon={faLocationDot} className="location-icon" />
          <div className="option-text">
            <h3>Current Location</h3>
            <p>Use your current location via GPS</p>
          </div>
          {isLoading && <div className="loading-spinner"></div>}
        </div>

        {searchQuery && (
          <div className="search-results">
            {filteredLocations.length > 0 ? (
              filteredLocations.map((location, index) => (
                <div 
                  key={index} 
                  className="location-item"
                  onClick={() => handleSelectLocation(location)}
                >
                  <div className="location-details">
                    <span className="location-name">{location.name}, Nagpur</span>
                    <span className="location-pincode">- {location.pincode}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-results">No locations found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Reuse your existing function
async function getAddressFromCoordinates(lat, lng) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    );
    const data = await response.json();
    return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch (error) {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

export default LocationSelection;