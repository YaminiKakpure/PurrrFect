import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './PetProfileView.css';

const PetProfileView = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const pet = JSON.parse(localStorage.getItem('pets')).find(p => p.id === petId);

  if (!pet) {
    return <div>Pet not found</div>;
  }

  return (
    <div className="pet-profile-view">
      <div className="profile-header">
        <button onClick={() => navigate(-1)}>Back</button>
        <h1>{pet.name}'s Profile</h1>
        <button onClick={() => navigate(`/edit-profile/${petId}`)}>Edit</button>
      </div>

      <div className="profile-content">
        <div className="pet-avatar">
          {pet.profileImage ? (
            <img src={pet.profileImage} alt={pet.name} />
          ) : (
            <div className="avatar-placeholder">
              {pet.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="pet-details">
          <h2>Basic Information</h2>
          <div className="detail-row">
            <span className="detail-label">Name:</span>
            <span className="detail-value">{pet.name}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Age:</span>
            <span className="detail-value">{pet.age || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Species:</span>
            <span className="detail-value">{pet.species || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Breed:</span>
            <span className="detail-value">{pet.breed || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Gender:</span>
            <span className="detail-value">{pet.gender || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Weight:</span>
            <span className="detail-value">{pet.weight || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Medical History:</span>
            <span className="detail-value">{pet.medicalHistory || 'None recorded'}</span>
          </div>

          <h2>Preferences & Needs</h2>
          {pet.preferences && (
            <>
              <div className="detail-row">
                <span className="detail-label">Feeding Schedule:</span>
                <span className="detail-value">{pet.preferences.feedingSchedule || 'Not specified'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Exercise Preference:</span>
                <span className="detail-value">{pet.preferences.exercisePreference || 'Not specified'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Sleep Schedule:</span>
                <span className="detail-value">{pet.preferences.sleepSchedule || 'Not specified'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Medical Allergies:</span>
                <span className="detail-value">{pet.preferences.medicalAllergies || 'None'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Special Instructions:</span>
                <span className="detail-value">{pet.preferences.specialInstructions || 'None'}</span>
              </div>
              {pet.preferences.bedPrescription && (
                <div className="detail-row">
                  <span className="detail-label">Prescription:</span>
                  <span className="detail-value">Attached</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PetProfileView;