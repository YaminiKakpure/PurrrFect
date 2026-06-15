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

  // DELETE PET FUNCTION
  const handleDelete = (id) => {
    const updatedPets = pets.filter((pet) => pet.id !== id);

    setPets(updatedPets);

    localStorage.setItem('pets', JSON.stringify(updatedPets));
  };

  return (
  <div className="pet-list-container">

    {/* HEADER */}
    <div className="pet-list-header">

      <button
        className="back-button"
        onClick={() => navigate(-1)}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15 18L9 12L15 6"
            stroke="#4A5568"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <h1>My Pets</h1>

    </div>

    {/* ADD PET BUTTON */}
    <button
      className="add-pet-button"
      onClick={() => navigate('/create-profile')}
    >
      Add New Pet
    </button>

    {/* PET GRID */}
    <div className="pet-grid">

      {pets.map((pet) => (

        <div key={pet.id} className="pet-card">

          {/* PET IMAGE */}
          <div className="pet-avatar">

            {pet.profileImage ? (
              <img
                src={pet.profileImage}
                alt={pet.name}
              />
            ) : (
              <div className="avatar-placeholder">
                {pet.name.charAt(0).toUpperCase()}
              </div>
            )}

          </div>

          {/* PET NAME */}
          <h3>{pet.name}</h3>

          {/* PET DETAILS */}
          <p>
            {pet.species} • {pet.breed}
          </p>

          {/* BUTTONS */}
          <div className="pet-buttons">

            <button
              className="view-button"
              onClick={() => navigate(`/view-profile/${pet.id}`)}
            >
              View Full Profile
            </button>

            <button
              className="delete-button"
              onClick={() => handleDelete(pet.id)}
            >
              Delete Pet
            </button>

          </div>

        </div>

      ))}

    </div>

  </div>
);
};

export default PetList;