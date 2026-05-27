import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, Upload, Plus, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './PetProfile.css';

const PetProfile = () => {
  const navigate = useNavigate();
  const { petId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  
  const initialFormData = {
    name: '',
    age: '',
    species: '',
    breed: '',
    gender: '',
    weight: '',
    medicalHistory: '',
    profileImage: null,
    profileImageFile: null
  };

  const initialPreferences = {
    feedingSchedule: '',
    exercisePreference: '',
    sleepSchedule: '',
    medicalAllergies: '',
    specialInstructions: '',
    bedPrescription: null,
    bedPrescriptionFile: null
  };

  const [formData, setFormData] = useState(initialFormData);
  const [preferences, setPreferences] = useState(initialPreferences);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Load pet data
  useEffect(() => {
    const loadPetData = async () => {
      setIsLoading(true);
      try {
        // Always check local storage first
        const localPets = JSON.parse(localStorage.getItem('pets')) || [];
        
        if (petId) {
          // Editing existing pet - find in local storage
          const localPet = localPets.find(p => p.id === petId);
          
          if (localPet) {
            setFormData({
              name: localPet.name || '',
              age: localPet.age || '',
              species: localPet.species || '',
              breed: localPet.breed || '',
              gender: localPet.gender || '',
              weight: localPet.weight || '',
              medicalHistory: localPet.medicalHistory || '',
              profileImage: localPet.profileImage || null
            });
            setPreferences(localPet.preferences || initialPreferences);
          } else {
            // If not in local storage, try API
            await fetchPet();
          }
        } else {
          // New pet - reset form
          setFormData(initialFormData);
          setPreferences(initialPreferences);
        }
      } catch (error) {
        toast.error(`Failed to load pet data: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadPetData();
  }, [petId]);

  const fetchPet = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/pets/${petId}`);
      if (!response.ok) throw new Error('Pet not found');
      
      const pet = await response.json();
      
      setFormData({
        name: pet.name || '',
        age: pet.age || '',
        species: pet.species || '',
        breed: pet.breed || '',
        gender: pet.gender || '',
        weight: pet.weight || '',
        medicalHistory: pet.medicalHistory || '',
        profileImage: pet.profileImage 
          ? `http://localhost:3000${pet.profileImage}`
          : null
      });
      
      setPreferences(pet.preferences || initialPreferences);
      
      // Update localStorage
      updateLocalStorage(pet);
    } catch (error) {
      throw error;
    }
  };

  const updateLocalStorage = (pet) => {
    const localPets = JSON.parse(localStorage.getItem('pets')) || [];
    const existingIndex = localPets.findIndex(p => p.id === pet.id);
    
    if (existingIndex >= 0) {
      localPets[existingIndex] = pet;
    } else {
      localPets.push(pet);
    }
    
    localStorage.setItem('pets', JSON.stringify(localPets));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData(prev => ({ 
        ...prev, 
        profileImage: e.target.result,
        profileImageFile: file
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ 
      ...prev, 
      profileImage: null,
      profileImageFile: null
    }));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.name.trim()) errors.push('Pet name is required');
    if (!formData.species) errors.push('Please select a species');
    if (!formData.gender) errors.push('Please select a gender');
    if (!formData.weight) errors.push('Please select a weight range');
    
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // For demo purposes, we'll use local storage only
      // In a real app, you'd send to API first, then update local storage
      
      const petData = {
        id: petId || Date.now().toString(), // Generate ID if new pet
        ...formData,
        preferences
      };
      
      // Update local storage
      const localPets = JSON.parse(localStorage.getItem('pets')) || [];
      const existingIndex = localPets.findIndex(p => p.id === petData.id);
      
      if (existingIndex >= 0) {
        localPets[existingIndex] = petData;
      } else {
        localPets.push(petData);
      }
      
      localStorage.setItem('pets', JSON.stringify(localPets));
      
      toast.success(`Pet profile ${petId ? 'updated' : 'created'} successfully`);
      
      // Navigate after saving
      navigate('/HomePage');
      
    } catch (error) {
      toast.error(error.message || 'An error occurred while saving');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    if (window.confirm('Are you sure you want to reset all changes?')) {
      setFormData(initialFormData);
      setPreferences(initialPreferences);
    }
  };

  if (isLoading) {
    return (
      <div className="pet-profile-loading">
        <Loader className="animate-spin" size={48} />
        <p>Loading pet data...</p>
      </div>
    );
  }

  return (
    <div className="pet-profile-container">
      <div className="pet-profile-header">
        <button 
          className="back-button"
          onClick={() => navigate(-1)}
          disabled={isSubmitting}
        >
          <ChevronLeft size={24} />
        </button>
        <h1>{petId ? 'Edit Pet Profile' : 'Create New Pet Profile'}</h1>
      </div>

      <div className="pet-profile-content">
        <div className="pet-avatar-section">
          <label htmlFor="pet-image-upload" className="avatar-upload-label">
            <div className="avatar-preview">
              {formData.profileImage ? (
                <div className="relative">
                  <img 
                    src={formData.profileImage} 
                    alt="Pet profile" 
                    className="pet-avatar-image"
                  />
                  <button 
                    type="button"
                    className="remove-image-btn"
                    onClick={handleRemoveImage}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="avatar-placeholder">
                  <Upload size={32} />
                  <span>Upload Photo</span>
                </div>
              )}
            </div>
            <input
              id="pet-image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isSubmitting}
              className="visually-hidden"
            />
          </label>
        </div>

        <form onSubmit={handleSubmit} className="pet-profile-form">
          <div className="form-section">
            <h2>Basic Information</h2>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter pet's name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="age">Age</label>
                <input
                  id="age"
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  min="0"
                  placeholder="Years"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="species">Species</label>
                <select
                  id="species"
                  name="species"
                  value={formData.species}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Species</option>
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                  <option value="bird">Bird</option>
                  <option value="fish">Fish</option>
                  <option value="rabbit">Rabbit</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="breed">Breed</label>
                <input
                  id="breed"
                  type="text"
                  name="breed"
                  value={formData.breed}
                  onChange={handleChange}
                  placeholder="Enter breed"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="weight">Weight</label>
                <select
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Weight</option>
                  <option value="5-20 lb (small)">5-20 lb (small)</option>
                  <option value="21-50 lb (medium)">21-50 lb (medium)</option>
                  <option value="51-99 lb (large)">51-99 lb (large)</option>
                  <option value="100+ lb (xl)">100+ lb (xl)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="medicalHistory">Medical History</label>
              <textarea
                id="medicalHistory"
                name="medicalHistory"
                value={formData.medicalHistory}
                onChange={handleChange}
                rows="3"
                placeholder="Any known medical conditions or history"
              />
            </div>
          </div>

          <button
            type="button"
            className="preferences-button"
            onClick={() => setIsPreferencesOpen(true)}
          >
            <Plus size={18} />
            {Object.values(preferences).some(val => val) 
              ? 'Edit Preferences' 
              : 'Add Preferences & Needs'}
          </button>

          <div className="form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={resetForm}
              disabled={isSubmitting}
            >
              Reset
            </button>
            <button
              type="submit"
              className="primary-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader className="animate-spin mr-2" size={18} />
                  Saving...
                </>
              ) : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      <AnimatePresence>
        {isPreferencesOpen && (
          <PreferencesModal
            preferences={preferences}
            setPreferences={setPreferences}
            onClose={() => setIsPreferencesOpen(false)}
            isSubmitting={isSubmitting}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const PreferencesModal = ({ preferences, setPreferences, onClose, isSubmitting }) => {
  const [localPrefs, setLocalPrefs] = useState(preferences);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size should be less than 10MB');
      return;
    }
    setLocalPrefs(prev => ({ 
      ...prev, 
      bedPrescription: URL.createObjectURL(file),
      bedPrescriptionFile: file
    }));
  };

  const handleRemovePrescription = () => {
    setLocalPrefs(prev => ({ 
      ...prev, 
      bedPrescription: null,
      bedPrescriptionFile: null
    }));
  };

  const handleSave = () => {
    setPreferences(localPrefs);
    onClose();
  };

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="preferences-modal"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Pet Preferences</h2>
          <button 
            className="close-button" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        <div className="modal-content">
          <div className="preference-section">
            <h3>🍽️ Feeding Schedule</h3>
            <div className="options-grid">
              {['Once Daily', 'Twice Daily', 'Three Times', 'Free Feed'].map(option => (
                <button
                  key={option}
                  className={`option-button ${localPrefs.feedingSchedule === option ? 'active' : ''}`}
                  onClick={() => setLocalPrefs(prev => ({ ...prev, feedingSchedule: option }))}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="preference-section">
            <h3>🏃 Exercise Preference</h3>
            <div className="options-grid">
              {['Light', 'Moderate', 'Active', 'Very Active'].map(option => (
                <button
                  key={option}
                  className={`option-button ${localPrefs.exercisePreference === option ? 'active' : ''}`}
                  onClick={() => setLocalPrefs(prev => ({ ...prev, exercisePreference: option }))}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="preference-section">
            <h3>😴 Sleep Schedule</h3>
            <div className="options-grid">
              {['Early Bird', 'Night Owl', 'Regular'].map(option => (
                <button
                  key={option}
                  className={`option-button ${localPrefs.sleepSchedule === option ? 'active' : ''}`}
                  onClick={() => setLocalPrefs(prev => ({ ...prev, sleepSchedule: option }))}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="preference-section">
            <h3>🩺 Medical Allergies</h3>
            <textarea
              value={localPrefs.medicalAllergies}
              onChange={(e) => setLocalPrefs(prev => ({ ...prev, medicalAllergies: e.target.value }))}
              placeholder="List any medical allergies"
            />
          </div>

          <div className="preference-section">
            <h3>📝 Special Instructions</h3>
            <textarea
              value={localPrefs.specialInstructions}
              onChange={(e) => setLocalPrefs(prev => ({ ...prev, specialInstructions: e.target.value }))}
              placeholder="Any special care instructions"
            />
          </div>

          <div className="preference-section">
            <h3>📁 Vet Prescription</h3>
            <label className="file-upload-label">
              <input
                id="prescription-upload"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                disabled={isSubmitting}
                className="visually-hidden"
              />
              <span className="file-upload-button">
                {localPrefs.bedPrescription 
                  ? 'Change Prescription' 
                  : 'Upload Prescription'}
              </span>
              {localPrefs.bedPrescription && (
                <div className="file-preview">
                  <span className="file-name">
                    {localPrefs.bedPrescriptionFile?.name || 'Prescription'}
                  </span>
                  <button 
                    type="button"
                    className="remove-file-btn"
                    onClick={handleRemovePrescription}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </label>
          </div>
        </div>

        <div className="modal-actions">
          <button 
            className="secondary-button" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            className="primary-button" 
            onClick={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader className="animate-spin mr-2" size={18} />
                Saving...
              </>
            ) : 'Save Preferences'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PetProfile;