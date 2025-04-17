const ServiceDetails = require('../models/ServiceDetails');
const { validateServiceData } = require('../validators/serviceValidator');

exports.updateServiceDetails = async (req, res) => {
  try {
      const { id: providerId } = req.params;
      const files = req.files || {};
      
      // Parse services similarly
      let services = [];
      if (req.body.services) {
          try {
              services = typeof req.body.services === 'string' 
                  ? JSON.parse(req.body.services) 
                  : req.body.services;
              
              if (!Array.isArray(services)) {
                  throw new Error('Services must be an array');
              }
          } catch (e) {
              console.error('Error parsing services:', e);
              throw new Error('Invalid services format');
          }
      }

      const serviceData = {
          ...req.body,
          services,
          service_photos: files.service_photos?.map(f => `/uploads/${f.filename}`).join(',') || '',
          service_videos: files.service_video?.[0] ? `/uploads/${files.service_video[0].filename}` : '',
          is_complete: false
      };

      await ServiceDetails.upsert(providerId, serviceData);
      
      res.json({ 
          success: true,
          message: 'Draft saved successfully'
      });
      
  } catch (error) {
      console.error('Error saving draft:', error);
      res.status(500).json({ 
          success: false,
          error: error.message 
      });
  }
};

exports.completeRegistration = async (req, res) => {
  try {
      const { id: providerId } = req.params;
      const files = req.files || {};

      // Parse services from JSON string if needed
      let services = [];
      if (req.body.services) {
          try {
              services = typeof req.body.services === 'string' 
                  ? JSON.parse(req.body.services) 
                  : req.body.services;
              
              if (!Array.isArray(services)) {
                  throw new Error('Services must be an array');
              }
          } catch (e) {
              console.error('Error parsing services:', e);
              throw new Error('Invalid services format');
          }
      }

      const serviceData = {
          ...req.body,
          services, // Use the parsed array
          service_photos: files.service_photos?.map(f => `/uploads/${f.filename}`).join(',') || '',
          service_videos: files.service_video?.[0] ? `/uploads/${files.service_video[0].filename}` : '',
          is_complete: true
      };

      await ServiceDetails.upsert(providerId, serviceData);
      
      res.json({ 
          success: true,
          message: 'Registration completed successfully'
      });
      
  } catch (error) {
      console.error('Error completing registration:', error);
      res.status(500).json({ 
          success: false,
          error: error.message || 'Failed to complete registration' 
      });
  }
};

exports.getServiceDetails = async (req, res) => {
    try {
        const { id: providerId } = req.params;
        const details = await ServiceDetails.getByProviderId(providerId);
        
        if (!details) {
            return res.status(404).json({ 
                success: false,
                error: 'Service details not found' 
            });
        }
        
        res.json({
            success: true,
            data: details
        });
        
    } catch (error) {
        console.error('Error fetching service details:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch service details' 
        });
    }
};