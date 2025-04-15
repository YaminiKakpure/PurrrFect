// SpProfile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import styles from './SpProfile.module.css';
import { ChevronLeft } from 'lucide-react';
import { jwtDecode } from 'jwt-decode'; // Correct import statement

const SpProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [providerData, setProviderData] = useState({
    name: '',
    email: '',
    phone: '',
    service_type: '',
    service_details: {
      service_title: '',
      service_type: '',
      service_description: '',
      location: '',
      phone: '',
      whatsapp: '',
      latitude: '',
      longitude: '',
      service_photos: [],
      service_videos: [],
      service_availability: '24/7',
      opening_time: '09:00:00',
      closing_time: '18:00:00',
      home_service: false,
      emergency_service: false,
      accept_advanced_bookings: false,
      services: []
    }
  });
  const [newServicePhotos, setNewServicePhotos] = useState([]);
  const [newServiceVideo, setNewServiceVideo] = useState(null);

  // Function to generate initials from name
  const getInitials = (name) => {
    if (!name) return 'SP';
    const names = name.split(' ');
    let initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  };

  // Function to generate a color based on name for consistent avatar coloring
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

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/SpAuth');
          return;
        }
    
        // Get provider ID from token
        const decoded = jwtDecode(token);
        const providerId = decoded.id;
    
        const config = {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        };
    
        const response = await axios.get(
          `http://localhost:3000/api/providers/profile`, 
          config
        );
    
        setProviderData(response.data);
    
      } catch (error) {
        console.error('Error fetching profile data:', error);
        
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/SpAuth');
        } else {
          toast.error('Failed to load profile data');
        }
      } finally {
        setLoading(false);
      }
    };
    

    fetchProfileData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name in providerData) {
      // Basic provider info
      setProviderData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    } else {
      // Service details
      setProviderData(prev => ({
        ...prev,
        service_details: {
          ...prev.service_details,
          [name]: type === 'checkbox' ? checked : value
        }
      }));
    }
  };

  const handleServiceChange = (index, field, value) => {
    const updatedServices = [...providerData.service_details.services];
    updatedServices[index] = {
      ...updatedServices[index],
      [field]: field === 'duration' ? parseInt(value) || 0 : value
    };
    
    setProviderData(prev => ({
      ...prev,
      service_details: {
        ...prev.service_details,
        services: updatedServices
      }
    }));
  };

  const addNewService = () => {
    setProviderData(prev => ({
      ...prev,
      service_details: {
        ...prev.service_details,
        services: [
          ...prev.service_details.services,
          { name: "", price: "", duration: 30, description: "" }
        ]
      }
    }));
  };

  const removeService = (index) => {
    if (providerData.service_details.services.length > 1) {
      setProviderData(prev => ({
        ...prev,
        service_details: {
          ...prev.service_details,
          services: prev.service_details.services.filter((_, i) => i !== index)
        }
      }));
    } else {
      toast.warning("At least one service is required");
    }
  };

  const handleServicePhotoUpload = (e) => {
    const newPhotos = [...newServicePhotos, ...Array.from(e.target.files)].slice(0, 5);
    setNewServicePhotos(newPhotos);
  };

  const handleServiceVideoUpload = (e) => {
    setNewServiceVideo(e.target.files[0]);
  };

  const removeServicePhoto = (index) => {
    setNewServicePhotos(newServicePhotos.filter((_, i) => i !== index));
  };

  const removeServiceVideo = () => {
    setNewServiceVideo(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const decoded = jwtDecode(token);
      const providerId = decoded.id;

      
      // Prepare form data for multipart upload
      const formData = new FormData();
      
      // Add basic provider info
      formData.append('name', providerData.name);
      formData.append('phone', providerData.phone);
      formData.append('service_type', providerData.service_type);
      
      // Add service details
      formData.append('service_title', providerData.service_details.service_title);
      formData.append('service_description', providerData.service_details.service_description);
      formData.append('location', providerData.service_details.location);
      formData.append('phone', providerData.service_details.phone);
      formData.append('whatsapp', providerData.service_details.whatsapp || '');
      formData.append('latitude', providerData.service_details.latitude || '');
      formData.append('longitude', providerData.service_details.longitude || '');
      formData.append('service_availability', providerData.service_details.service_availability);
      formData.append('opening_time', providerData.service_details.opening_time);
      formData.append('closing_time', providerData.service_details.closing_time);
      formData.append('home_service', providerData.service_details.home_service);
      formData.append('emergency_service', providerData.service_details.emergency_service);
      formData.append('accept_advanced_bookings', providerData.service_details.accept_advanced_bookings);
      
      // Add services as JSON
      formData.append('services', JSON.stringify(providerData.service_details.services));
      
      newServicePhotos.forEach(photo => {
        formData.append('service_photos', photo);
      });
      if (newServiceVideo) {
        formData.append('service_video', newServiceVideo);
      }

      // Update both provider and service details
      await axios.put(
        `http://localhost:3000/api/providers/${providerId}/update-profile`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      toast.success('Profile updated successfully!');
      setEditing(false);
      await fetchProfileData(); // Refresh data
      
      // Refresh data
      const [providerRes, serviceRes] = await Promise.all([
        axios.get(`http://localhost:3000/api/providers/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`http://localhost:3000/api/providers/${providerId}/service-details`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setProviderData({
        ...providerRes.data,
        service_details: serviceRes.data || {
          services: [],
          service_photos: [],
          service_videos: []
        }
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <ChevronLeft size={24} /> 
        </button>
        <h1>My Profile</h1>
        <button 
          className={styles.editButton}
          onClick={() => setEditing(!editing)}
        >
          {editing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.profileForm}>
        {/* Avatar Section - Replaced Profile Photo */}
        <div className={styles.section}>
          <h2>Profile</h2>
          <div className={styles.avatarContainer}>
            <div 
              className={styles.avatar}
              style={{ 
                backgroundColor: getAvatarColor(providerData.name),
                color: '#ffffff',
                fontSize: '2rem',
                fontWeight: 'bold'
              }}
            >
              {getInitials(providerData.name)}
            </div>
            <div className={styles.profileInfo}>
              <h3>{providerData.name}</h3>
              <p>{providerData.service_type ? providerData.service_type.charAt(0).toUpperCase() + providerData.service_type.slice(1) : 'Service Provider'}</p>
            </div>
          </div>
        </div>

        {/* Basic Information Section */}
        <div className={styles.section}>
          <h2>Basic Information</h2>
          <div className={styles.formGroup}>
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={providerData.name}
              onChange={handleChange}
              disabled={!editing}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Email</label>
            <input
              type="email"
              value={providerData.email}
              disabled
            />
          </div>
          <div className={styles.formGroup}>
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={providerData.phone}
              onChange={handleChange}
              disabled={!editing}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Service Type</label>
            <select
              name="service_type"
              value={providerData.service_type}
              onChange={handleChange}
              disabled={!editing}
              required
            >
              <option value="">Select Service Type</option>
              <option value="vet">Veterinarian</option>
              <option value="grooming">Grooming</option>
              <option value="training">Training</option>
              <option value="hostelling">Hostelling</option>
              <option value="shop">Pet Friendly Stays</option>
            </select>
          </div>
        </div>

        {/* Service Information Section */}
        <div className={styles.section}>
          <h2>Service Information</h2>
          <div className={styles.formGroup}>
            <label>Service Title</label>
            <input
              type="text"
              name="service_title"
              value={providerData.service_details.service_title}
              onChange={handleChange}
              disabled={!editing}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Service Description</label>
            <textarea
              name="service_description"
              value={providerData.service_details.service_description}
              onChange={handleChange}
              disabled={!editing}
              rows="4"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={providerData.service_details.location}
              onChange={handleChange}
              disabled={!editing}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Service Phone</label>
            <input
              type="tel"
              name="phone"
              value={providerData.service_details.phone}
              onChange={handleChange}
              disabled={!editing}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>WhatsApp (Optional)</label>
            <input
              type="tel"
              name="whatsapp"
              value={providerData.service_details.whatsapp || ''}
              onChange={handleChange}
              disabled={!editing}
            />
          </div>
        </div>

        {/* Services & Pricing Section */}
        <div className={styles.section}>
          <h2>Services & Pricing</h2>
          <div className={styles.servicesHeader}>
            <span>Service Name</span>
            <span>Price</span>
            <span>Duration (min)</span>
            {editing && <span>Action</span>}
          </div>
          
          {providerData.service_details.services.map((service, index) => (
            <div key={index} className={styles.serviceRow}>
              <input
                type="text"
                value={service.name}
                onChange={(e) => handleServiceChange(index, "name", e.target.value)}
                placeholder="e.g., Basic Grooming"
                disabled={!editing}
                required
              />
              <input
                type="number"
                value={service.price}
                onChange={(e) => handleServiceChange(index, "price", e.target.value)}
                placeholder="0.00"
                disabled={!editing}
                min="0"
                step="0.01"
                required
              />
              <input
                type="number"
                value={service.duration || ""}
                onChange={(e) => handleServiceChange(index, "duration", e.target.value)}
                placeholder="30"
                disabled={!editing}
                min="1"
              />
              {editing && (
                <button
                  type="button"
                  onClick={() => removeService(index)}
                  className={styles.removeButton}
                  disabled={providerData.service_details.services.length <= 1}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          
          {editing && (
            <button
              type="button"
              onClick={addNewService}
              className={styles.addButton}
              disabled={providerData.service_details.services.length >= 10}
            >
              + Add Service
            </button>
          )}
        </div>

        {/* Availability Section */}
        <div className={styles.section}>
          <h2>Availability</h2>
          <div className={styles.formGroup}>
            <label>Service Availability</label>
            <select
              name="service_availability"
              value={providerData.service_details.service_availability}
              onChange={handleChange}
              disabled={!editing}
            >
              <option value="24/7">24/7 Available</option>
              <option value="only week days">Only Weekdays</option>
              <option value="Custom hours">Custom Hours</option>
            </select>
          </div>
          
          {providerData.service_details.service_availability === "Custom hours" && (
            <div className={styles.timeContainer}>
              <div className={styles.timeInput}>
                <label>Opening Time: </label>
                <input
                  type="time"
                  name="opening_time"
                  value={providerData.service_details.opening_time}
                  onChange={handleChange}
                  disabled={!editing}
                  required
                />
              </div>
              <div className={styles.timeInput}>
                <label>Closing Time: </label>
                <input
                  type="time"
                  name="closing_time"
                  value={providerData.service_details.closing_time}
                  onChange={handleChange}
                  disabled={!editing}
                  required
                />
              </div>
            </div>
          )}
        </div>

        {/* Service Media Section */}
        <div className={styles.section}>
          <h2>Service Media</h2>
          
          <div className={styles.uploadSection}>
            <label>Photos (Max 5)</label>
            {/* <div className={styles.mediaPreview}>
              {providerData.service_details.service_photos?.map((photo, index) => (
                <div key={index} className={styles.mediaItem}>
                  <img src={photo} alt={`Service ${index + 1}`} />
                </div>
              ))}
            </div> */}
            {editing && (
              <div className={styles.uploadBox}>
                <label htmlFor="service-photos" className={styles.uploadButton}>
                  📷 Add Photos
                </label>
                <input
                  id="service-photos"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleServicePhotoUpload}
                  style={{ display: 'none' }}
                  disabled={newServicePhotos.length >= 5}
                />
                <div className={styles.fileList}>
                  {newServicePhotos.map((photo, index) => (
                    <div key={index} className={styles.fileItem}>
                      <span>{photo.name}</span>
                      <button 
                        type="button" 
                        onClick={() => removeServicePhoto(index)}
                        className={styles.removeButton}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className={styles.uploadSection}>
            <label>Video (Optional)</label>
            {providerData.service_details.service_videos?.length > 0 && (
              <div className={styles.mediaPreview}>
                <video controls className={styles.mediaItem}>
                  <source src={providerData.service_details.service_videos[0]} />
                </video>
              </div>
            )}
            {editing && (
              <div className={styles.uploadBox}>
                <label htmlFor="service-video" className={styles.uploadButton}>
                  🎥 Add Video
                </label>
                <input
                  id="service-video"
                  type="file"
                  accept="video/*"
                  onChange={handleServiceVideoUpload}
                  style={{ display: 'none' }}
                  disabled={!!newServiceVideo}
                />
                {newServiceVideo && (
                  <div className={styles.fileItem}>
                    <span>{newServiceVideo.name}</span>
                    <button 
                      type="button" 
                      onClick={removeServiceVideo}
                      className={styles.removeButton}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Additional Options Section */}
        <div className={styles.section}>
          <h2>Additional Options</h2>
          
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="home_service"
              checked={providerData.service_details.home_service}
              onChange={handleChange}
              disabled={!editing}
            />
            Home Service Available
          </label>
          
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="emergency_service"
              checked={providerData.service_details.emergency_service}
              onChange={handleChange}
              disabled={!editing}
            />
            Emergency Service Available
          </label>
          
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="accept_advanced_bookings"
              checked={providerData.service_details.accept_advanced_bookings}
              onChange={handleChange}
              disabled={!editing}
            />
            Accept Advance Bookings
          </label>
        </div>

        {editing && (
          <div className={styles.formActions}>
            <button 
              type="button" 
              className={styles.cancelButton}
              onClick={() => setEditing(false)}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={styles.saveButton}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default SpProfile;