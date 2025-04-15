import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './HomePage.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faPaw } from "@fortawesome/free-solid-svg-icons";

// Import images
import petHealthcare from '../../assets/pet-healthcare.jpg';
import petGrooming from '../../assets/pet-grooming.jpg';
import dogTrainer from '../../assets/dog-trainer.jpg';
import petBoarding from '../../assets/pet boarding.jpg';
import petHotels from '../../assets/pet hotels.jpg';
import petPlaces from '../../assets/pet places.jpg';
import welcome from '../../assets/bg_transparent.png';
import profile from '../../assets/PET_PROFILE.jpg';


function HomePage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [location, setLocation] = useState("Loading location...");
  const navigate = useNavigate();

  // Toggle drawer
  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  // Fetch location on component mount
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        // Try to get from localStorage first
        const savedLocation = localStorage.getItem('userLocation');
        if (savedLocation) {
          const { address } = JSON.parse(savedLocation);
          setLocation(address);
          return;
        }

        // Fallback to getting new location
        await handleNewLocation();
      } catch (error) {
        console.error("Location error:", error);
        setLocation("Location unavailable");
      }
    };

    fetchLocation();
  }, []);


  // Handle getting new location
  const handleNewLocation = async () => {
    navigate('/LocationSelection');
  };

  // Handle logout
  const handleLogout = () => {
    const confirmLogout = window.confirm("Do you want to log out?");
    if (confirmLogout) {
      localStorage.removeItem("token");
      localStorage.removeItem("id");
      navigate("/AuthPage");
    }
  };

  // Rest of your component remains the same
  return (
    <div className="home-page-container">
      {/* App Header */}
      <header className="app-header">
        <h1 className="app-title">Purrfect Love</h1>
        <button className="app-bar-action" onClick={toggleDrawer}>
          <FontAwesomeIcon icon={faPaw} size="lg" />
        </button>
      </header>

      {/* Drawer */}
      <aside className={`drawer ${isDrawerOpen ? 'open' : ''}`}>
        <div className="drawer-content">
          <button className="close-icon" onClick={toggleDrawer}>
            <FontAwesomeIcon icon={faClose} size="lg" />
          </button>
          <div className="user-profile">
            <div className="profile-image-container">
              <img
                className="profile-image"
                src={profile} alt="profile"
              />
            </div>
            <div className="profile-details">
              <div className="profile-name">Bella</div>
              <div className="profile-edit" onClick={() => navigate("/edit-profile/${petId}")}>
                Edit Profile
              </div>
            </div>
          </div>
          <div className="divider"></div>
          <div className="navigation">
            <div className="nav-item" onClick={() => navigate("/HomePage")}>
              <i className="fas fa-home"></i>
              <span>Home</span>
            </div>
            <div className="nav-item" onClick={() => navigate("/OwnerProfile")}>
              <i className="fas fa-user"></i>
              <span>Personal details</span>
            </div>
            {/* <div className="nav-item">
              <i className="fas fa-store"></i>
              <span>Pet Store</span>
            </div> */}
            <div className="nav-item" onClick={() => navigate("/bookings")}>
              <i className="fas fa-calendar"></i>
              <span>My Bookings</span>
            </div>
            {/* <div className="nav-item">
              <i className="fas fa-star"></i>
              <span>My Orders</span>
            </div>
            <div className="nav-item">
              <i className="fas fa-heart"></i>
              <span>Wishlist</span> */}
            {/* </div> */}
          </div>
          <div className="divider"></div>
          <div className="settings">
            <div className="nav-item" onClick={() => navigate("/notif")}>
              <i className="fas fa-bell"></i>
              <span>Notifications</span>
            </div>
            <div className="nav-item" onClick={() => navigate("/about")}>
              <i className="fas fa-users"></i>
              <span>About Us</span>
            </div>
            <div className="nav-item" onClick={() => navigate("/help")}>
              <i className="fas fa-question-circle"></i>
              <span>Help</span>
            </div>
            <div className="nav-item" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
              <span>Logout</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <div className="location-card">
          <div className="location-text">📍 Current Location: {location}</div>
          <div className="change-text" onClick={handleNewLocation}>
            Change
          </div>
        </div>
        <div className="welcome-section">
          <div className="welcome-title">Welcome Pet Parent!</div>
          <div className="welcome-subtitle">Discover our loving pet care services</div>
          <div className="welcome-image">
            <img src={welcome} alt="Welcome" />
          </div>
        </div>

        {/* Service Cards - Vertical Layout */}
        <div className="service-cards">
          {/* Pet HealthCare */}
          <div className="service-card" onClick={() => navigate('/HealthCare')}>
            <div className="service-content">
              <h3 className="service-title">Pet HealthCare</h3>
              <p className="service-description">
                💉 Veterinary Checkups & Emergency Care for your pets. Get instant consultations from expert vets.
              </p>
            </div>
            <div className="service-image-container">
              <img src={petHealthcare} alt="Pet Healthcare" className="service-image" />
            </div>
          </div>
          
          {/* Pet Grooming */}
          <div className="service-card" onClick={() => navigate('/Grooming')}>
            <div className="service-content">
              <h3 className="service-title">Pet Grooming</h3>
              <p className="service-description">
                ✂️ Haircuts & Styling for all breeds. Bathing, Nail Clipping & Ear Cleaning to keep your pet fresh & healthy.
              </p>
            </div>
            <div className="service-image-container">
              <img src={petGrooming} alt="Pet Grooming" className="service-image" />
            </div>
          </div>
          
          {/* Pet Training */}
          <div className="service-card" onClick={() => navigate('/Training')}>
            <div className="service-content">
              <h3 className="service-title">Pet Training</h3>
              <p className="service-description">
                🐶 Obedience Training for all age groups. Fun Activities to improve discipline & behavior.
              </p>
            </div>
            <div className="service-image-container">
              <img src={dogTrainer} alt="Pet Training" className="service-image" />
            </div>
          </div>
          
          {/* Pet Boarding */}
          <div className="service-card" onClick={() => navigate('/Boarding')}>
            <div className="service-content">
              <h3 className="service-title">Pet Boarding</h3>
              <p className="service-description">
                🏠 Safe & Comfortable Hostels for your pet. Daily Meals & Playtime while you're away.
              </p>
            </div>
            <div className="service-image-container">
              <img src={petBoarding} alt="Pet Boarding" className="service-image" />
            </div>
          </div>
          
          {/* Pet Stay */}
          <div className="service-card" onClick={() => navigate('/Hotels')}>
            <div className="service-content">
              <h3 className="service-title">Pet Stay</h3>
              <p className="service-description">
                🏨 Comfortable & Secure Stays for your pet while you're away. 24/7 Supervision and cozy accommodations.
              </p>
            </div>
            <div className="service-image-container">
              <img src={petHotels} alt="Pet Stay" className="service-image" />
            </div>
          </div>
          
          {/* Pet Friendly Places */}
          <div className="service-card" onClick={() => navigate('/Places')}>
            <div className="service-content">
              <h3 className="service-title">Pet Friendly Places</h3>
              <p className="service-description">
                🐾 Discover Local Spots where pets are welcome. Parks, Cafes, and Shops that love having your furry friend around!
              </p>
            </div>
            <div className="service-image-container">
              <img src={petPlaces} alt="Pet Friendly Places" className="service-image" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;