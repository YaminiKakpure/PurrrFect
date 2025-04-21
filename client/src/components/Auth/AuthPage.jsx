import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import axios from "axios";
import "./AuthPage.css";

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const showLocationPermissionAlert = (isNewUser = false) => {
    const shouldAllow = window.confirm(
      "To provide you with the best experience, we need access to your location. Click 'OK' to allow or 'Cancel' to skip."
    );
    
    if (shouldAllow) {
      fetchUserLocation(isNewUser);
    } else {
      // Navigate to different pages based on whether it's a new user
      isNewUser ? navigate("/Create-profile") : navigate("/HomePage");
    }
  };

  const fetchUserLocation = (isNewUser) => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          localStorage.setItem("userLatitude", latitude);
          localStorage.setItem("userLongitude", longitude);
          
          saveLocationToBackend(latitude, longitude);
          
          // Navigate based on user type after saving location
          isNewUser ? navigate("/Create-profile") : navigate("/HomePage");
        },
        (error) => {
          console.log("Location fetch skipped:", error.message);
          // Navigate based on user type if location fetch fails
          isNewUser ? navigate("/Create-profile") : navigate("/HomePage");
        }
      );
    } else {
      console.log("Geolocation not supported");
      // Navigate based on user type if geolocation not supported
      isNewUser ? navigate("/Create-profile") : navigate("/HomePage");
    }
  };

  const saveLocationToBackend = async (latitude, longitude) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found - skipping location save");
        return;
      }

      await axios.post(
        "http://localhost:3000/api/customers/save-location",
        { latitude, longitude },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 3000
        }
      );

      console.log("Location saved successfully");
    } catch (error) {
      console.log("Location save failed (non-critical):", error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      window.open("http://localhost:3000/auth/google/customer", "_self");
  
      const checkAuth = setInterval(async () => {
        try {
          const response = await axios.get("http://localhost:3000/auth/profile", {
            withCredentials: true,
          });
  
          if (response.data.user) {
            clearInterval(checkAuth);
  
            const googleResponse = await axios.post("http://localhost:3000/api/customers/google-login", {
              name: response.data.user.name,
              email: response.data.user.email,
              google_id: response.data.user.google_id,
            });
  
            toast.success("Logged in with Google!", { position: "top-right" });
            localStorage.setItem("id", googleResponse.data.id);
            localStorage.setItem("token", googleResponse.data.token);
            
            // For Google login, we treat it as existing user (navigate to HomePage)
            showLocationPermissionAlert(false);
          }
        } catch (error) {
          clearInterval(checkAuth);
          console.error("Google authentication check failed:", error);
          toast.error("Google login failed! Please try again.", { position: "top-right" });
        }
      }, 1000);
  
      setTimeout(() => {
        clearInterval(checkAuth);
        toast.error("Google login timed out! Please try again.", { position: "top-right" });
      }, 10000);
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error("Google sign-in failed!", { position: "top-right" });
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/api/customers", formData, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("Signup response:", response.data); // Debug log

      if (response.status === 201) {
        toast.success("Account created successfully!", { position: "top-right" });

        const userId = response.data.id || response.data.insertId;
        const token = response.data.token;

        if (!userId || !token) {
          throw new Error("Missing user ID or token in response");
        }

        localStorage.setItem("id", userId);
        localStorage.setItem("token", token);
        
        // Pass true to indicate this is a new user (navigate to PetProfile)
        navigate("/Create-profile");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error.response?.data?.error || "Sign-up failed!", { position: "top-right" });
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:3000/api/customers/login",
        { email: formData.email, password: formData.password },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200) {
        toast.success("Logged in successfully!", { position: "top-right" });
        localStorage.setItem("id", response.data.id);
        localStorage.setItem("token", response.data.token);
        
        // Pass false to indicate this is an existing user (navigate to HomePage)
        showLocationPermissionAlert(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Login failed!", { position: "top-right" });
    }
  };

  return (
    <div className="auth-page-background">
      <ToastContainer />
      <div className="auth-container">
        <h2 className="auth-title">PURRFECT LOVE</h2>

        <div className="auth-tabs">
          <button className={!isSignUp ? "active-tab" : ""} onClick={() => setIsSignUp(false)}>
            Sign In
          </button>
          <button className={isSignUp ? "active-tab" : ""} onClick={() => setIsSignUp(true)}>
            Sign Up
          </button>
        </div>

        <form onSubmit={isSignUp ? handleSignUp : handleSignIn}>
          {isSignUp && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              className="auth-input"
              value={formData.name}
              onChange={handleChange}
              required
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            className="auth-input"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              className="auth-input"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button type="submit" className="auth-button">
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="auth-divider">or continue with</div>

        <button className="auth-alt-button" onClick={handleGoogleSignIn}>
          <FaGoogle className="icon" /> Continue with Google
        </button>

        <p className="auth-switch">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <span onClick={() => setIsSignUp(!isSignUp)}>{isSignUp ? "Sign In" : "Sign Up"}</span>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;