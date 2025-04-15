import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./DashBoard.css";  // Make sure this path is correct

const DashBoard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    earnings: 0,
    bookings: 0,
    rating: 0,
    completedServices: 0
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/SpAuth");
          return;
        }

        const providerData = localStorage.getItem("provider");
        if (providerData) {
          const provider = JSON.parse(providerData);
          setUserName(provider.name);
          
          // Simulate fetching stats data - replace with actual API call
          setStats({
            earnings: 2450,
            bookings: 12,
            rating: 4.9,
            completedServices: 28
          });
          
          setLoading(false);
          return;
        }

        const response = await axios.get("http://localhost:3000/api/providers/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setUserName(response.data.name);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load user data");
        navigate("/SpAuth");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <header className="dashboard-header">
        <h1>Welcome, {userName}!</h1>
        <p className="dashboard-subtitle">Here's what's happening with your business today</p>
      </header>

      {/* Stats Overview */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">₹</div>
          <div className="stat-content">
            <h3>Total Earnings</h3>
            <p className="stat-value">₹{stats.earnings.toLocaleString()}</p>
            <p className="stat-change positive">+12% from last month</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>New Bookings</h3>
            <p className="stat-value">{stats.bookings}</p>
            <p className="stat-change positive">+3 from yesterday</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>Service Rating</h3>
            <p className="stat-value">{stats.rating}/5</p>
            <p className="stat-change positive">98% positive feedback</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <h3>Completed</h3>
            <p className="stat-value">{stats.completedServices}</p>
            <p className="stat-change positive">This month</p>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions">
        <h2 className="section-title">Quick Actions</h2>
        <div className="action-buttons">
          <button onClick={() => navigate("/SpProfile")} className="action-button">
            <span className="button-icon">👤</span>
            <span>My Profile</span>
          </button>
          <button onClick={() => navigate("/SpBookings")} className="action-button">
            <span className="button-icon">📅</span>
            <span>Manage Bookings</span>
          </button>
          <button onClick={() => navigate("/Sptrans")} className="action-button">
            <span className="button-icon">💰</span>
            <span>Transactions</span>
          </button>
          <button onClick={() => navigate("/SpNotif")} className="action-button">
            <span className="button-icon">🔔</span>
            <span>Notifications</span>
          </button>
        </div>
      </section>

      {/* Upcoming Appointments */}
      <section className="upcoming-appointments">
        <div className="section-header">
          <h2 className="section-title">Upcoming Appointments</h2>
          <button className="view-all" onClick={() => navigate("/SpBookings")}>View All</button>
        </div>
        
        <div className="appointments-list">
          <div className="appointment-card">
            <img 
              src="https://images.unsplash.com/photo-1552053831-71594a27632d?w=200" 
              alt="Max - Golden Retriever" 
              className="pet-image"
            />
            <div className="appointment-details">
              <h3>Max - Golden Retriever</h3>
              <p className="service-type">Full Grooming Service</p>
              <div className="appointment-meta">
                <span className="appointment-time">Today • 2:00 PM</span>
                <span className="appointment-status confirmed">Confirmed</span>
              </div>
            </div>
          </div>
          
          <div className="appointment-card">
            <img 
              src="https://images.unsplash.com/photo-1536590158209-e9d615d525e4?w=200" 
              alt="Luna - Persian Cat" 
              className="pet-image"
            />
            <div className="appointment-details">
              <h3>Luna - Persian Cat</h3>
              <p className="service-type">Basic Grooming</p>
              <div className="appointment-meta">
                <span className="appointment-time">Tomorrow • 10:00 AM</span>
                <span className="appointment-status pending">Pending</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashBoard;