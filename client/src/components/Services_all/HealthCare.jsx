import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './services.css';
import petHealthcareImage from '../../assets/pet-healthcare.jpg';
import axios from 'axios';
import { ChevronLeft } from 'lucide-react';

const HealthCare = () => {
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState('');


    const getDistanceColor = (distance) => {
        const dist = parseFloat(distance);
        if (dist < 3) return 'green';
        if (dist < 8) return 'orange';
        return 'red';
    };
      

    const getRandomDistance = () => {
        const ranges = [
          { min: 0.5, max: 3 },   // Very close
          { min: 3, max: 8 },      // Nearby
          { min: 8, max: 15 },     // Moderate distance
          { min: 15, max: 25 }     // Far away
        ];
        const range = ranges[Math.floor(Math.random() * ranges.length)];
        return (range.min + Math.random() * (range.max - range.min)).toFixed(2);
    };
    

    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoading(true);
                const userLocation = JSON.parse(localStorage.getItem('userLocation'));
                
                const response = await axios.get('/api/providers/services', {
                    params: {
                        service_type: 'vet',
                        latitude: userLocation?.lat,
                        longitude: userLocation?.lng,
                        search: searchQuery
                    }
                });
                
                const transformedData = response.data.map(provider => ({
                    id: provider.id,
                    name: provider.name,
                    specialty: provider.service_title || 'Veterinarian',
                    rating: provider.rating || 0.0,
                    reviews: provider.reviews_count || 0,
                    price: provider.services?.length ? 
                        Math.min(...provider.services.map(s => s.price || Infinity)) : 0,
                    // Generate random distance if not available (1-20 km)
                    distance: provider.distance || (1 + Math.random() * 19),
                    image: provider.service_photos?.[0] || provider.profile_photo || petHealthcareImage,
                    providerData: provider
                }));
                
                setServices(transformedData);
                setFilteredServices(transformedData);
                setError(null);
            } catch (err) {
                console.error('Error fetching services:', err);
                setError('Failed to load services. Please try again later.');
                setServices([]);
                setFilteredServices([]);
            } finally {
                setLoading(false);
            }
        };
    
        const debounceTimer = setTimeout(fetchServices, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

    useEffect(() => {
        const sorted = [...services].sort((a, b) => {
            switch(sortOption) {
                case 'nearest': 
                    return parseFloat(a.distance) - parseFloat(b.distance);
                case 'top-rated': 
                    return b.rating - a.rating;
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                default:
                    return 0;
            }
        });
        setFilteredServices(sorted);
    }, [sortOption, services]);

    const handleViewDetails = (service) => {
        navigate('/ServiceDetails', { 
            state: { 
                service: service.providerData
            } 
        });
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSortChange = (e) => {
        setSortOption(e.target.value);
    };

    if (loading) {
        return (
            <div className="service-container">
                <div className="loading-spinner"></div>
                <p>Finding healthcare providers near you...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="service-container">
                <div className="error-message">
                    {error}
                    <button onClick={() => window.location.reload()}>Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="service-container">
            {/* App Bar */}
            <div className="service-appbar">
                <button onClick={() => window.history.back()}>
                    <ChevronLeft size={24} />
                </button>
                <h1>Pet Healthcare</h1>
            </div>

            {/* Banner */}
            <div 
                className="service-banner"
                style={{ '--banner-image': `url(${petHealthcareImage})` }}
            >
                <h2>Pet HealthCare</h2>
                <p>Find top veterinarians for your pet's health needs!</p>
            </div>

            {/* Search Bar */}
            <div className="service-search-container">
                <div className="service-search-bar">
                    <i className="fas fa-search"></i>
                    <input 
                        type="text" 
                        placeholder="Search nearby veterinarians..." 
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                </div>
            </div>

            {/* Filter Dropdown */}
            <select 
                className="service-filter-dropdown"
                value={sortOption}
                onChange={handleSortChange}
            >
                <option value="">Sort</option>
                <option value="nearest">Nearest</option>
                <option value="top-rated">Top Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
            </select>

            {/* Service Cards */}
            {filteredServices.length > 0 ? (
                filteredServices.map((service, index) => (
                    <div className="service-card" key={index}>
                        <div className="service-info">
                            <img 
                                src={service.image} 
                                alt={service.name}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = petHealthcareImage;
                                }}
                            />
                            <div>
                                <h3>{service.name}</h3>
                                <p>{service.specialty}</p>
                                <div className="service-rating">
                                    <i className="fas fa-star"></i>
                                    <span>{service.rating.toFixed(1)}</span>
                                    <span>({service.reviews} reviews)</span>
                                </div>
                            </div>
                        </div>
                        <div className="service-details">
                        <div className="service-location">
                            <i className="fas fa-location-dot"></i>
                            <span style={{ color: getDistanceColor(service.distance) }}>
                              {parseFloat(service.distance).toFixed(2)} km away
                            </span>
                        </div>
                            <div className="service-price">
                                <span>From ₹ {service.price.toFixed(2)}</span>
                            </div>
                        </div>
                        <button onClick={() => handleViewDetails(service)}>View Details</button>
                    </div>
                ))
            ) : (
                <div className="no-services">
                    <p>No healthcare services found {searchQuery ? `for "${searchQuery}"` : 'in your area'}.</p>
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')}>Clear search</button>
                    )}
                </div>
            )}
        </div>
    );
};

export default HealthCare;