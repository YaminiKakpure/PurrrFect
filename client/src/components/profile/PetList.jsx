import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PetList.css';

const PetList = () => {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);

  useEffect(() => {
    const localPets = JSON.parse(localStorage.getItem('pets')) || [];
    setPets(localPets);
  }, []);

  return (
    <div className="pet-list-container">
      <h1>My Pets</h1>
      
      <button 
        className="add-pet-button"
        onClick={() => navigate('/create-profile')}
      >
        Add New Pet
      </button>
      
      <div className="pet-grid">
        {pets.map(pet => (
          <div key={pet.id} className="pet-card">
            <div className="pet-avatar">
              {pet.profileImage ? (
                <img src={pet.profileImage} alt={pet.name} />
              ) : (
                <div className="avatar-placeholder">
                  {pet.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <h3>{pet.name}</h3>
            <p>{pet.species} • {pet.breed}</p>
            <button 
              className="view-button"
              onClick={() => navigate(`/view-profile/${pet.id}`)}
            >
              View Full Profile
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PetList;