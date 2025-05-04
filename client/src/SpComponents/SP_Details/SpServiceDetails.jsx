import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./SpServiceDetails.module.css";
import { ChevronLeft } from 'lucide-react';

const SpServiceDetails = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    service_title: "",
    service_type: "",
    service_description: "",
    location: "",
    service_availability: "24/7",
    opening_time: "09:00:00",
    closing_time: "18:00:00",
    home_service: false,
    emergency_service: false,
    accept_advanced_bookings: false,
    latitude: "",
    longitude: "",
    phone: "",
    whatsapp: ""
  });

  const [services, setServices] = useState([
    { name: "", price: "", duration: 30, description: "" }
  ]);
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [vetExperience, setVetExperience] = useState(null); // New state for vet experience
  const [termsAccepted, setTermsAccepted] = useState(false); // New state for terms acceptance
  const [loading, setLoading] = useState(false);

  // Service type configurations
  const serviceConfig = {
    vet: {
      placeholder: "Describe your veterinary services and specialties",
      defaultServices: [
        { name: "General Consultation", price: "", duration: 30 },
        { name: "Vaccination", price: "", duration: 15 },
        { name: "Emergency Care", price: "", duration: 60 }
      ]
    },
    grooming: {
      placeholder: "Describe your grooming packages and pet types handled",
      defaultServices: [
        { name: "Bath & Brush", price: "", duration: 45 },
        { name: "Full Grooming", price: "", duration: 60 },
        { name: "Nail Clipping", price: "", duration: 15 }
      ]
    },
    training: {
      placeholder: "Describe your training programs and expertise",
      defaultServices: [
        { name: "Obedience Training", price: "", duration: 60 },
        { name: "Puppy Training", price: "", duration: 45 },
        { name: "Behavioral Training", price: "", duration: 60 }
      ]
    },
    hostelling: {
      placeholder: "Describe your boarding facilities and services",
      defaultServices: [
        { name: "Day Boarding", price: "", duration: 720 }, // 12 hours
        { name: "Overnight Stay", price: "", duration: 1440 }, // 24 hours
        { name: "Extended Stay", price: "", duration: 4320 } // 3 days
      ]
    },
    hotel: {
      placeholder: "Describe your pet-friendly accommodations and amenities",
      defaultServices: [
        { name: "Pet-Friendly Room (Small Dog)", price: "", duration: 1440 }, // 24 hours
        { name: "Pet-Friendly Room (Large Dog)", price: "", duration: 1440 },
        { name: "Luxury Pet Suite", price: "", duration: 1440 },
        { name: "Extended Stay Package", price: "", duration: 10080 } // 7 days
      ]
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));

    if (name === "service_type" && value in serviceConfig) {
      setServices(serviceConfig[value].defaultServices);
      setFormData(prev => ({
        ...prev,
        service_description: ""
      }));
    }
  };

  const handleServiceChange = (index, field, value) => {
    const updatedServices = [...services];
    updatedServices[index] = {
      ...updatedServices[index],
      [field]: field === "duration" ? parseInt(value) || 0 : value
    };
    setServices(updatedServices);
  };

  const addNewService = () => {
    setServices([...services, { name: "", price: "", duration: 30, description: "" }]);
  };

  const removeService = (index) => {
    if (services.length > 1) {
      setServices(services.filter((_, i) => i !== index));
    } else {
      toast.warning("At least one service is required");
    }
  };

  const handlePhotoUpload = (e) => {
    const newPhotos = [...photos, ...Array.from(e.target.files)].slice(0, 5);
    setPhotos(newPhotos);
  };

  const handleVideoUpload = (e) => {
    setVideos([...videos, e.target.files[0]].slice(0, 1));
  };

  const handleVetExperienceUpload = (e) => {
    setVetExperience(e.target.files[0]);
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    setVideos([]);
  };

  const removeVetExperience = () => {
    setVetExperience(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!termsAccepted) {
      toast.error("Please accept the terms and conditions");
      return;
    }
    
    setLoading(true);

    try {
      // Prepare complete draft data
      const draftData = {
        ...formData,
        services,
        // Convert files to Base64
        service_photos: await Promise.all(photos.map(convertFileToBase64)),
        service_video: videos[0] ? await convertFileToBase64(videos[0]) : null,
        vet_experience: vetExperience ? await convertFileToBase64(vetExperience) : null
      };

      // Save to localStorage
      localStorage.setItem('draft_service', JSON.stringify(draftData));
      
      toast.success("Draft saved successfully!");
      navigate('/SpConfirmation');
    } catch (error) {
      toast.error("Failed to save draft: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  return (
    <div className={styles.serviceDetailsContainer}>
      <div className={styles.appBar}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <ChevronLeft size={24} /> 
        </button>
        <h1>{formData.id ? "Edit Your Service" : "Add Your Service"}</h1>
      </div>

      <div className={styles.heroSection}>
        <h2>Let's Set Up Your Service!</h2>
        <p>Provide accurate details to attract pet parents</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.formContainer}>
        {/* Basic Information Section */}
        <div className={styles.formSection}>
          <h3>Basic Information</h3>

          <input 
            type="hidden" 
            name="name" 
            value={formData.name} 
          />

          <input
            type="text"
            name="service_title"
            placeholder="Service Title*"
            value={formData.service_title}
            onChange={handleChange}
            className={styles.inputField}
            required
          />
          
          <select
            name="service_type"
            value={formData.service_type}
            onChange={handleChange}
            className={styles.inputField}
            required
          >
            <option value="">Select Service Type*</option>
            <option value="vet">Veterinary</option>
            <option value="grooming">Grooming</option>
            <option value="training">Training</option>
            <option value="hostelling">Boarding/Hostel</option>
            <option value="hotel">Pet Friendly Stays</option>
          </select>
          
          <textarea
            name="service_description"
            placeholder={
              formData.service_type 
                ? serviceConfig[formData.service_type]?.placeholder 
                : "Describe your services"
            }
            value={formData.service_description}
            onChange={handleChange}
            className={`${styles.inputField} ${styles.textareaField}`}
          />
        </div>

        {/* Veterinarian Experience Section (only shown for vet service) */}
        {formData.service_type === "vet" && (
          <div className={styles.formSection}>
            <h3>Veterinarian Credentials</h3>
            <div className={styles.uploadSection}>
              <label>Upload Doctor's Experience Certificate (PDF)*</label>
              <div className={styles.uploadBox}>
                {vetExperience ? (
                  <div className={styles.fileItem}>
                    <span>{vetExperience.name}</span>
                    <button 
                      type="button" 
                      onClick={removeVetExperience}
                      className={styles.removeButton}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <>
                    <label htmlFor="vetExperience" className={styles.uploadButton}>
                      📄 Upload Certificate
                    </label>
                    <input
                      id="vetExperience"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleVetExperienceUpload}
                      style={{ display: 'none' }}
                    />
                  </>
                )}
              </div>
              <p className={styles.helperText}>Please upload your veterinary license or experience certificate</p>
            </div>
          </div>
        )}

        {/* Services Pricing Section */}
        <div className={styles.formSection}>
          <h3>Services & Pricing</h3>
          <div className={styles.servicesHeader}>
            <span>Service Name*</span>
            <span>Price*</span>
            <span>Duration (min)</span>
            <span>Action</span>
          </div>
          
          {services.map((service, index) => (
            <div key={index} className={styles.serviceRow}>
              <input
                type="text"
                value={service.name}
                onChange={(e) => handleServiceChange(index, "name", e.target.value)}
                placeholder="e.g., Basic Grooming"
                className={styles.serviceInput}
                required
              />
              <input
                type="number"
                value={service.price}
                onChange={(e) => handleServiceChange(index, "price", e.target.value)}
                placeholder="0.00"
                className={styles.priceInput}
                min="0"
                step="0.01"
                required
              />
              <input
                type="number"
                value={service.duration || ""}
                onChange={(e) => handleServiceChange(index, "duration", e.target.value)}
                placeholder="30"
                className={styles.durationInput}
                min="1"
              />
              <button
                type="button"
                onClick={() => removeService(index)}
                className={styles.removeButton}
                disabled={services.length <= 1}
              >
                ×
              </button>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addNewService}
            className={styles.addButton}
            disabled={services.length >= 10}
          >
            + Add Service
          </button>
        </div>

        {/* Location Section */}
        <div className={styles.formSection}>
          <h3>Location</h3>
          <input
            type="text"
            name="location"
            placeholder="Full Address*"
            value={formData.location}
            onChange={handleChange}
            className={styles.inputField}
            required
          />
        </div>

        {/* Availability Section */}
        <div className={styles.formSection}>
          <h3>Availability</h3>
          <select
            name="service_availability"
            value={formData.service_availability}
            onChange={handleChange}
            className={styles.inputField}
          >
            <option value="24/7">24/7 Available</option>
            <option value="only week days">Only Weekdays</option>
            <option value="Custom hours">Custom Hours</option>
          </select>
          
          {formData.service_availability === "Custom hours" && (
            <div className={styles.timeContainer}>
              <div className={styles.timeInput}>
                <label>Opening Time*</label>
                <input
                  type="time"
                  name="opening_time"
                  value={formData.opening_time}
                  onChange={handleChange}
                  className={styles.timeField}
                  required
                />
              </div>
              <div className={styles.timeInput}>
                <label>Closing Time*</label>
                <input
                  type="time"
                  name="closing_time"
                  value={formData.closing_time}
                  onChange={handleChange}
                  className={styles.timeField}
                  required
                />
              </div>
            </div>
          )}
        </div>

        {/* Media Section */}
        <div className={styles.formSection}>
          <h3>Service Media</h3>
          
          <div className={styles.uploadSection}>
            <label>Photos (Max 5)*</label>
            <div className={styles.uploadBox}>
              <label htmlFor="photos" className={styles.uploadButton}>
                📷 Add Photos
              </label>
              <input
                id="photos"
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
                disabled={photos.length >= 5}
              />
              <div className={styles.fileList}>
                {photos.map((photo, index) => (
                  <div key={index} className={styles.fileItem}>
                    <span>{photo.name || `Photo ${index + 1}`}</span>
                    <button 
                      type="button" 
                      onClick={() => removePhoto(index)}
                      className={styles.removeButton}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className={styles.uploadSection}>
            <label>Videos (Optional, Max 1)</label>
            <div className={styles.uploadBox}>
              <label htmlFor="video" className={styles.uploadButton}>
                🎥 Add Video
              </label>
              <input
                id="video"
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                style={{ display: 'none' }}
                disabled={videos.length >= 1}
              />
              {videos.length > 0 && (
                <div className={styles.fileItem}>
                  <span>{videos[0].name || "Video"}</span>
                  <button 
                    type="button" 
                    onClick={removeVideo}
                    className={styles.removeButton}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Options */}
        <div className={styles.formSection}>
          <h3>Additional Options</h3>
          
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="home_service"
              checked={formData.home_service}
              onChange={handleChange}
              className={styles.checkboxInput}
            />
            Home Service Available
          </label>
          
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="emergency_service"
              checked={formData.emergency_service}
              onChange={handleChange}
              className={styles.checkboxInput}
            />
            Emergency Service Available
          </label>
          
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="accept_advanced_bookings"
              checked={formData.accept_advanced_bookings}
              onChange={handleChange}
              className={styles.checkboxInput}
            />
            Accept Advance Bookings
          </label>
        </div>

        {/* Contact Information */}
        <div className={styles.formSection}>
          <h3>Contact Information</h3>
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number*"
            value={formData.phone}
            onChange={handleChange}
            className={styles.inputField}
            required
          />
          <input
            type="tel"
            name="whatsapp"
            placeholder="WhatsApp (Optional)"
            value={formData.whatsapp}
            onChange={handleChange}
            className={styles.inputField}
          />
        </div>

        {/* Terms and Conditions */}
        <div className={styles.formSection}>
          <div className={styles.termsContainer}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className={styles.checkboxInput}
                required
              />
              <span>
                I certify that all the information provided above is accurate and complete. 
                I understand that providing false information may result in account suspension.
              </span>
            </label>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className={styles.buttonContainer}>
          <button 
            type="button" 
            className={styles.cancelButton} 
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={loading || !termsAccepted}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SpServiceDetails;