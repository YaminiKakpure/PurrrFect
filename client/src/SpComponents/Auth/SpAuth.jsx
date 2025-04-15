import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import "./SpAuth.css";

const SpAuth = () => {
  const [isSignUp, setIsSignUp] = useState(false); // Changed default to Sign In
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
    service_type: "",
    phone: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (loginData) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/providers/signin",
        {
          email: loginData.email,
          password: loginData.password
        },
        {
          headers: { "Content-Type": "application/json" }
        }
      );

      if (response.status === 200) {
        toast.success("Login successful!");
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("sp_id", response.data.provider.id);

        localStorage.setItem("provider", JSON.stringify(response.data.provider));
        navigate("/DashBoard");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Invalid email or password");
      } else {
        toast.error("Login failed. Please try again.");
      }
      console.error("Login error:", error.response?.data);
    }
  };

  const handleSignUp = async (signupData) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/providers/signup",
        {
          name: signupData.name,
          email: signupData.email,
          password: signupData.password,
          confirm_pass: signupData.confirm_password,
          phone: signupData.phone,
          service_type: signupData.service_type
        },
        {
          headers: { "Content-Type": "application/json" }
        }
      );

      if (response.status === 201) {
        toast.success("Account created successfully!");
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("sp_id", response.data.provider.id);
          localStorage.setItem("provider", JSON.stringify(response.data.provider));
        }  
        navigate("/SpHome");
      }
    } catch (error) {
      console.error("Signup error:", error.response?.data);
      toast.error(error.response?.data?.error || "Signup failed!");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSignUp) {
      if (formData.password !== formData.confirm_password) {
        toast.error("Passwords do not match!");
        return;
      }
      await handleSignUp(formData);
    } else {
      await handleLogin(formData);
    }
  };

  return (
    <div className="auth-page-background">
      <ToastContainer />
      <div className="auth-container">
        <h2 className="auth-title">PURRFECT LOVE</h2>

        <div className="auth-tabs">
          <button 
            className={!isSignUp ? "active-tab" : ""} 
            onClick={() => setIsSignUp(false)}
          >
            Sign In
          </button>
          <button 
            className={isSignUp ? "active-tab" : ""} 
            onClick={() => setIsSignUp(true)}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="auth-input"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="auth-input"
              />
              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
                className="auth-input"
              />
              <select
                name="service_type"
                value={formData.service_type}
                onChange={handleChange}
                required
                className="auth-input"
              >
                <option value="">Select Service Type</option>
                <option value="vet">Veterinarian</option>
                <option value="grooming">Grooming</option>
                <option value="training">Training</option>
                <option value="hostelling">Hostelling</option>
                <option value="shop">Pet Friendly Stays</option>
              </select>
            </>
          )}

          {!isSignUp && (
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="auth-input"
            />
          )}

          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="auth-input"
            />
            <span 
              className="eye-icon" 
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {isSignUp && (
            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}
                name="confirm_password"
                placeholder="Confirm Password"
                value={formData.confirm_password}
                onChange={handleChange}
                required
                className="auth-input"
              />
            </div>
          )}

          <button type="submit" className="auth-button">
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <p className="auth-switch">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <span onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? "Sign In" : "Sign Up"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default SpAuth;