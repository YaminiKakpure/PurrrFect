const ServiceDetails = require('../models/ServiceDetails');
const Payment = require('../models/Payment');

// const { uploadToCloudinary } = require('../utils/cloudinary');

exports.saveDraft = async (req, res) => {
  try {
    const { id: providerId } = req.params;
    const formData = req.body;
    const files = req.files || {};
    
    // Parse services
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
      ...formData,
      services,
      service_photos: files.service_photos?.map(f => `/uploads/${f.filename}`) || [],
      service_video: files.service_video?.[0] ? `/uploads/${files.service_video[0].filename}` : null,
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
    const draftData = req.body;
    
    if (!draftData) {
      return res.status(400).json({
        success: false,
        error: "No draft data provided"
      });
    }

    // Process payment first
    const order = await Payment.createOrder(499); // 499 INR registration fee
    
    res.json({
      success: true,
      order,
      message: 'Payment initialized'
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { id: providerId } = req.params;
    const { paymentId, orderId, signature, draftData } = req.body;
    
    // Verify payment
    const isValid = await Payment.verifyPayment(paymentId, orderId, signature);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: "Payment verification failed"
      });
    }

    // Save service details with is_complete = true
    const serviceData = {
      ...draftData,
      is_complete: true
    };

    await ServiceDetails.upsert(providerId, serviceData);
    
    // Record successful payment
    await Payment.recordPayment(providerId, 499, paymentId, orderId);
    
    res.json({ 
      success: true,
      message: 'Registration completed successfully'
    });
    
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
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