import React from "react";
import { useNavigate } from "react-router-dom";
import { FaPaw, FaHotel, FaCut, FaRunning, FaHome, FaHeartbeat } from "react-icons/fa";
import "./SpHome.css";
import welcome from '../../assets/bg_transparent.png';

const SpHome = () => {
  const navigate = useNavigate();

  // Handle service type click
  const handleServiceClick = (serviceType) => {
    navigate(`/SpServiceDetails`);
  };

  return (
    <div className="sp-home-page">
      {/* App Bar */}
      <div className="sp-app-bar">
        <div className="sp-app-bar-title">Purrfect Love</div>
        <div className="sp-app-bar-icon">
          <FaPaw className="sp-paw-icon" />
        </div>
      </div>

      {/* Hero Section */}
      <div className="sp-hero-section">
        <div className="sp-hero-content">
          <h1 className="sp-hero-title">Welcome To Purrfect Love</h1>
          <h1 className="sp-hero-subtitle">Partner With Us!</h1>
          <div className="welcome-image">
            <img src={welcome} alt="Welcome" />
          </div>
        </div>
      </div>

      {/* Service Selection Section */}
      <div className="sp-service-section">
        <h2 className="sp-service-title">Select Your Service Type</h2>
        <div className="sp-service-list">
          {/* Healthcare */}
          <div className="sp-service-card" onClick={() => handleServiceClick("healthcare")}>
            <FaHeartbeat className="sp-service-icon healthcare" />
            <span className="sp-service-name">HEALTHCARE</span>
          </div>

          {/* Grooming */}
          <div className="sp-service-card" onClick={() => handleServiceClick("grooming")}>
            <FaCut className="sp-service-icon grooming" />
            <span className="sp-service-name">GROOMING</span>
          </div>

          {/* Training */}
          <div className="sp-service-card" onClick={() => handleServiceClick("training")}>
            <FaRunning className="sp-service-icon training" />
            <span className="sp-service-name">TRAINING</span>
          </div>

          {/* Boarding */}
          <div className="sp-service-card" onClick={() => handleServiceClick("boarding")}>
            <FaHome className="sp-service-icon boarding" />
            <span className="sp-service-name">BOARDING</span>
          </div>

          {/* Hotels or Stays */}
          <div className="sp-service-card" onClick={() => handleServiceClick("hotels")}>
            <FaHotel className="sp-service-icon hotels" />
            <span className="sp-service-name">HOTELS OR STAYS</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpHome;