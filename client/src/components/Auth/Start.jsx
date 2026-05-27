import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Start.css";
import logo from "../../assets/logo2_transparent.png";

const Start = () => {
  const navigate = useNavigate();
  const [animate, setAnimate] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start zoom-in animation
    setTimeout(() => setAnimate(true), 100);
    
    // Sequence: Zoom (0.7s) + Hold (2s) + Fade (0.8s) = Total 3.5s
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => navigate("/RoleSelect"), 800);
    }, 3500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className={`start-container ${fadeOut ? "fade-out" : ""}`}>
      <img 
        className={`logo ${animate ? "show" : ""}`} 
        src={logo} 
        alt="Purrfect Love Logo" 
      />
    </div>
  );
};

export default Start;