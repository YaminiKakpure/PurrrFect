import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SpBasicInfo = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    serviceType: 'vet',
    phone: '',
    location: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('pet_service_draft', JSON.stringify(formData));
    navigate('/SpConfirmation');
  };

  return (
    <div className="basic-form">
      <h2>Basic Service Information</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Your Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Service Type:</label>
          <select
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            required
          >
            <option value="vet">Veterinary</option>
            <option value="grooming">Grooming</option>
            <option value="boarding">Boarding</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Phone Number:</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Location:</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>
        
        <button type="submit">Continue</button>
      </form>
    </div>
  );
};

export default SpBasicInfo;