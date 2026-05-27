const Customer = require('../models/Customer');
const db = require('../config/db'); // Adjust the path as needed
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Optional: For JWT-based authentication

const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Configure multer for profile photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/profile_photos/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});


exports.getProfile = async (req, res) => {
  console.log("getProfile called with user:", req.user); // Add this line
  try {
    const customer = await Customer.getById(req.user.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Remove sensitive data before sending to client
    const { password, google_id, ...profileData } = customer;

    // Convert profile photo to base64 if exists
    if (profileData.profile_photo) {
      try {
        const imagePath = path.join(__dirname, '..', profileData.profile_photo);
        if (fs.existsSync(imagePath)) {
          const imageBuffer = fs.readFileSync(imagePath);
          profileData.profile_photo = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
        } else {
          profileData.profile_photo = null;
        }
      } catch (err) {
        console.error('Error reading profile photo:', err);
        profileData.profile_photo = null;
      }
    }

    res.json(profileData);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// In customerController.js
// exports.getProfile = async (req, res) => {
//   try {
//     const customer = await Customer.getById(req.user.id);
//     if (!customer) {
//       return res.status(404).json({ error: 'Customer not found' });
//     }

//     const { password, google_id, ...profileData } = customer;

//     // Handle profile photo if exists
//     if (profileData.profile_photo) {
//       try {
//         const imagePath = path.join(__dirname, '..', profileData.profile_photo);
//         if (fs.existsSync(imagePath)) {
//           const imageBuffer = fs.readFileSync(imagePath);
//           profileData.profile_photo = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
//         }
//       } catch (err) {
//         console.error('Error reading profile photo:', err);
//       }
//     }

//     res.json(profileData);
//   } catch (error) {
//     console.error('Error fetching profile:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

exports.updateProfile = async (req, res) => {
  try {
    let updates = {};
    
    // Handle both JSON and form-data
    if (req.headers['content-type']?.includes('multipart/form-data')) {
      updates = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        ...(req.file && { profile_photo: req.file.path })
      };
    } else {
      updates = req.body;
    }

    await Customer.updateProfile(req.params.id, updates);
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(400).json({ 
      error: error.message,
      received: req.body 
    });
  }
};


// const handleProfileUpdate = (req, res, next) => {
//   const multer = require('multer');
//   const upload = multer().single('profile_photo');
  
//   upload(req, res, async (err) => {
//     if (err) {
//       return res.status(400).json({ error: err.message });
//     }

//     try {
//       const userId = req.params.id;
//       const updates = {};
      
//       // Handle text fields
//       if (req.body.name) updates.name = req.body.name;
//       if (req.body.email) updates.email = req.body.email;
//       if (req.body.phone) updates.phone = req.body.phone;
//       if (req.body.address) updates.address = req.body.address;

//       // Handle file upload
//       if (req.file) {
//         updates.profile_photo = `uploads/profile_photos/${req.file.originalname}`;
//         // Save file to disk
//         require('fs').writeFileSync(updates.profile_photo, req.file.buffer);
//       }

//       if (Object.keys(updates).length === 0) {
//         return res.status(400).json({ error: "No fields to update" });
//       }

//       await Customer.updateProfile(userId, updates);
//       res.json({ message: 'Profile updated successfully' });
//     } catch (error) {
//       console.error('Update error:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   });
// };




// Sign-up logic
exports.createCustomer = async (req, res) => {
  try {
    // Hash the password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    req.body.password = hashedPassword; // Replace plaintext password with hashed password

    // Create the customer
    const result  = await Customer.create(req.body);

    // // Send Welcome Email
    // sendWelcomeEmail(req.body.email, req.body.name);

    const token = jwt.sign(
      { id: result .insertId, email: req.body.email },
      process.env.JWT_SECRET || 'e82d85c7-9179-45a8-a304-3eccbb85c620',
      { expiresIn: '1h' }
    );
    

    res.status(201).json({ 
      message: 'Account created successfully!',
      token, // Include token here too
      id: result .insertId 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login logic
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await Customer.getByEmail(email);
    if (!user) return res.status(401).json({ error: "Invalid email or password!" });

    // Compare hashed passwords
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: "Invalid email or password!" });

    // Optional: Generate a JWT token for session management
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'e82d85c7-9179-45a8-a304-3eccbb85c620',
      { expiresIn: '1h' }
    );
    res.status(200).json({ 
      message: "Login successful!", 
      token, // Make sure this is included
      id: user.id 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Other methods (getAllCustomers, getCustomerById, updateCustomer, deleteCustomer) remain the same
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.getAll();
    res.status(200).json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.getById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.status(200).json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    await Customer.update(req.params.id, req.body);
    res.status(200).json({ message: 'Customer updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    await Customer.delete(req.params.id);
    res.status(200).json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Save Location API
exports.saveLocation = async (req, res) => {
  const { id, latitude, longitude } = req.body;

  try {
    console.log("Saving location for user:", id, latitude, longitude); // Log the request

    const query = 'UPDATE customers SET location = ? WHERE id = ?';
    const [results] = await db.query(query, [JSON.stringify({ latitude, longitude }), id]);

    console.log("Location saved successfully!"); // Log success
    res.status(200).json({ message: "Location saved successfully!" });
  } catch (error) {
    console.error("Error saving location:", error); // Log error
    res.status(500).json({ error: "Failed to save location" });
  }
};

// Fetch Location API
exports.getLocation = async (req, res) => {
  const { id } = req.query;

  try {
    console.log("Fetching location for user:", id); // Log the request

    const query = 'SELECT location FROM customers WHERE id = ?';
    const [results] = await db.query(query, [id]);

    if (results[0] && results[0].location) {
      console.log("Location found:", results[0].location); // Log the location
      res.status(200).json({ location: JSON.parse(results[0].location) });
    } else {
      console.log("Location not found for user:", id); // Log if location is missing
      res.status(404).json({ error: "Customer not found" });
    }
  } catch (error) {
    console.error("Error fetching location:", error); // Log error
    res.status(500).json({ error: "Failed to fetch location" });
  }
};
