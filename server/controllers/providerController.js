const Provider = require('../models/Provider');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ServiceDetails = require('../models/ServiceDetails');

// Helper to generate JWT token
const generateToken = (provider) => {
  return jwt.sign(
    { id: provider.id, email: provider.email, role: 'provider' },
    process.env.JWT_SECRET || 'e82d85c7-9179-45a8-a304-3eccbb85c620',
    { expiresIn: '1d' }
  );
};

// Sign-up
exports.signup = async (req, res) => {
  try {
    const { name, email, password, confirm_pass, phone, service_type } = req.body;

    // Validation
    if (!name || !email || !password || !phone || !service_type) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (password !== confirm_pass) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Create provider
    const providerId = await Provider.create({ name, email, password, phone, service_type });
    
    // Get created provider
    const provider = await Provider.getById(providerId);
    const token = generateToken(provider);

    res.status(201).json({
      token,
      provider: {
        id: provider.id,
        name: provider.name,
        email: provider.email,
        service_type: provider.service_type
      }
    });

  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ 
      error: error.code === 'ER_DUP_ENTRY' 
        ? 'Email already exists' 
        : 'Registration failed' 
    });
  }
};

// Sign-in
exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find provider
    const provider = await Provider.getByEmail(email);
    if (!provider) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, provider.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: provider.id, email: provider.email, role: "provider"},
      process.env.JWT_SECRET, // Must match .env
      { expiresIn: '24h' }
    );
        // DEBUG: Log generated token
    console.log("Generated Token:", token)
    res.json({ token, provider });

  } catch (error) {
    console.error('Signin Error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Get profile
exports.getProfile = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const providerId = decoded.id;

    const [provider, serviceDetails] = await Promise.all([
      Provider.getById(providerId),
      ServiceDetails.getByProviderId(providerId)
    ]);

    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    const { password, ...providerData } = provider;
    
    res.json({
      ...providerData,
      service_details: serviceDetails || {
        services: [],
        service_photos: [],
        service_videos: []
      }
    });

  } catch (error) {
    console.error('Profile Error:', error);
    res.status(500).json({ 
      error: 'Failed to get profile',
      details: error.message 
    });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    const files = req.files || {};
    
    // Debug: Log incoming files and body
    console.log('Files received:', Object.keys(files));
    console.log('Body received:', req.body);

    // Process services
    let services = [];
    if (req.body.services) {
      try {
        services = JSON.parse(req.body.services);
        if (!Array.isArray(services)) {
          throw new Error('Services must be an array');
        }
      } catch (e) {
        throw new Error('Invalid services format');
      }
    }

    // Update provider basic info
    const providerUpdate = {
      name: req.body.name,
      phone: req.body.phone,
      service_type: req.body.service_type
    };

    // Handle profile photo
    if (files.profile_photo) {
      providerUpdate.profile_photo = `/uploads/providers/${id}/${Date.now()}_${files.profile_photo[0].originalname}`;
      await saveFile(files.profile_photo[0], providerUpdate.profile_photo);
    }

    await Provider.update(id, providerUpdate, connection);

    // Prepare service details
    const serviceData = {
      service_title: req.body.service_title,
      service_description: req.body.service_description,
      location: req.body.location,
      phone: req.body.service_phone || req.body.phone,
      whatsapp: req.body.whatsapp || null,
      latitude: req.body.latitude || null,
      longitude: req.body.longitude || null,
      service_availability: req.body.service_availability,
      opening_time: req.body.opening_time,
      closing_time: req.body.closing_time,
      home_service: Boolean(req.body.home_service),
      emergency_service: Boolean(req.body.emergency_service),
      accept_advanced_bookings: Boolean(req.body.accept_advanced_bookings),
      services
    };

    // Handle service photos
    if (files.service_photos) {
      const photoPaths = [];
      for (const file of files.service_photos) {
        const path = `/uploads/providers/${id}/${Date.now()}_${file.originalname}`;
        await saveFile(file, path);
        photoPaths.push(path);
      }
      serviceData.service_photos = photoPaths.join(',');
    }

    // Handle service video
    if (files.service_video) {
      const videoPath = `/uploads/providers/${id}/${Date.now()}_${files.service_video[0].originalname}`;
      await saveFile(files.service_video[0], videoPath);
      serviceData.service_videos = videoPath;
    }

    // Update service details
    await ServiceDetails.upsert(id, serviceData, connection);

    await connection.commit();
    
    res.json({ 
      success: true,
      message: 'Profile updated successfully',
      data: {
        provider: providerUpdate,
        service_details: serviceData
      }
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Profile update error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    connection.release();
  }
};

// Helper function to save files
async function saveFile(file, filePath) {
  const fullPath = path.join(__dirname, '../', filePath);
  await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.promises.writeFile(fullPath, file.buffer);
}