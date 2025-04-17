import React from "react";
import { useNavigate } from "react-router-dom";
import "./RoleSelection.css";

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleOwnerSelection = (role) => {
    // Navigate to AuthPage with the selected role
    navigate("/AuthPage", {
      state: { role, transition: "top-to-bottom", duration: 1500 },
    });
  };

  const handleProviderSelection = (role) => {
    // Navigate to AuthPage with the selected role
    navigate("/SpAuth", {
      state: { role, transition: "top-to-bottom", duration: 1500 },
    });
  };
  return (
    <div className="role-selection-container">
      <div className="role-selection-card">
        <h1 className="role-selection-title">WELCOME TO PURRFECT LOVE!</h1>
        <p className="role-selection-subtitle">Please select your role to get started:</p>
        <div className="role-buttons-container">
          <button className="role-button owner-button" onClick={() => handleOwnerSelection("owner")}>
            <span className="role-icon">🐾</span>
            <span className="role-text">I am a Pet Owner</span>
          </button>
          <button className="role-button provider-button" onClick={() => handleProviderSelection("provider")}>
            <span className="role-icon">🛠️</span>
            <span className="role-text">I am a Service Provider</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;