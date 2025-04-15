import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./OwnerProfile.css";
import { jwtDecode } from 'jwt-decode';

const OwnerProfile = () => {
  const navigate = useNavigate();
  const [ownerData, setOwnerData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  // Function to generate initials from name
  const getInitials = (name) => {
    if (!name) return 'OP'; // Default initials if no name
    const names = name.split(' ');
    let initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  };

  // Function to generate a consistent color based on name
  const getAvatarColor = (name) => {
    if (!name) return '#4CAF50'; // default green
    
    const colors = [
      '#4CAF50', // green
      '#2196F3', // blue
      '#FF5722', // orange
      '#9C27B0', // purple
      '#E91E63', // pink
      '#009688', // teal
      '#FFC107', // amber
      '#795548', // brown
      '#607D8B', // blue grey
      '#3F51B5'  // indigo
    ];
    
    const hash = name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/AuthPage");
        return;
      }

      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        navigate("/AuthPage");
        return;
      }

      const response = await axios.get("http://localhost:3000/api/customers/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOwnerData({
        name: response.data.name || "",
        email: response.data.email || "",
        phone: response.data.phone || "",
        address: response.data.address || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOwnerData({ ...ownerData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem("token");
      const decoded = jwtDecode(token);
      const userId = decoded.id;
  
      const formData = new FormData();
      
      // Add text fields
      formData.append("name", ownerData.name);
      formData.append("email", ownerData.email);
      formData.append("phone", ownerData.phone || "");
      formData.append("address", ownerData.address || "");
  
      const response = await axios.put(
        `http://localhost:3000/api/customers/${userId}`,
        formData,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }
      );
  
      toast.success("Profile updated successfully!");
      await fetchProfile();
    } catch (error) {
      console.error("Update error:", {
        message: error.message,
        response: error.response?.data,
      });
      toast.error(error.response?.data?.error || "Failed to update profile");
    }
  };

  if (isLoading) {
    return (
      <div className="owner-profile-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="owner-profile-container">
      <ToastContainer position="top-center" autoClose={3000} />
      
      <div className="profile-card">
        {/* Header */}
        <div className="profile-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="#4A5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="profile-title">Personal Details</h1>
        </div>

        {/* Avatar Section - Replaced Profile Image */}
        <div className="profile-avatar-section">
          <div 
            className="avatar-circle"
            style={{ 
              backgroundColor: getAvatarColor(ownerData.name),
              color: '#ffffff',
              fontSize: '24px',
              fontWeight: 'bold'
            }}
          >
            {getInitials(ownerData.name)}
          </div>
          <div className="profile-info">
            <h2>{ownerData.name}</h2>
            <p>{ownerData.email}</p>
          </div>
        </div>

        {/* Profile Form */}
        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={ownerData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={ownerData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={ownerData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Address</label>
            <textarea
              name="address"
              value={ownerData.address}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <button type="submit" className="save-btn">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default OwnerProfile;