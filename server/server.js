require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const mysql = require('mysql2/promise');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const fileUpload = require('express-fileupload');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const Razorpay = require("razorpay");
const crypto = require('crypto');
const pool = require('./config/db');
const { v4: uuidv4 } = require('uuid');

const app = express();


let petsDB = [];

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session Store
const sessionStore = new MySQLStore({
  clearExpired: true,
  checkExpirationInterval: 900000,
  expiration: 86400000,
  createDatabaseTable: true,
  schema: {
    tableName: 'user_sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
}, pool);

// Middleware Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


// Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    maxAge: 86400000, // 1 day
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// Passport Initialization
app.use(passport.initialize());
app.use(passport.session());

// File Upload Setup
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Replace your current multer setup with:
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, 'uploads');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

app.use('/uploads', express.static(uploadsDir));

// Authentication Strategies

// Google OAuth Strategy for Customers
passport.use('google-customer', new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL_CUSTOMER || "/auth/google/customer/callback",
  passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    const [existingUser] = await pool.query(
      "SELECT * FROM customers WHERE google_id = ? OR email = ?",
      [profile.id, profile.emails[0].value]
    );

    if (existingUser.length > 0) {
      if (!existingUser[0].google_id) {
        await pool.query(
          "UPDATE customers SET google_id = ?, auth_provider = ? WHERE id = ?",
          [profile.id, 'google', existingUser[0].id]
        );
        existingUser[0].google_id = profile.id;
        existingUser[0].auth_provider = 'google';
      }
      return done(null, existingUser[0]);
    }

    const [result] = await pool.query(
      `INSERT INTO customers 
      (name, email, google_id, profile_photo, auth_provider) 
      VALUES (?, ?, ?, ?, ?)`,
      [
        profile.displayName,
        profile.emails[0].value,
        profile.id,
        profile.photos[0]?.value || null,
        "google"
      ]
    );

    const newCustomer = {
      id: result.insertId,
      name: profile.displayName,
      email: profile.emails[0].value,
      google_id: profile.id,
      profile_photo: profile.photos[0]?.value || null,
      auth_provider: "google"
    };

    return done(null, newCustomer);
  } catch (error) {
    return done(error);
  }
}));

// Serialization/Deserialization
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const [user] = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);
    done(null, user[0] || null);
  } catch (err) {
    done(err);
  }
});

// Razorpay Configuration
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_zvUvHBloF8oAEy',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'zswgZEIaoaxufDB9cTVazajE'
});

// Payment Routes
app.post('/api/payments/create-order', async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid amount is required' 
      });
    }

    const options = {
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);
    
    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create payment order'
    });
  }
});

app.post('/api/payments/verify', async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ 
        success: false, 
        error: 'Payment verification details are required' 
      });
    }

    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid payment signature' 
      });
    }

    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    
    if (payment.status !== 'captured') {
      return res.status(400).json({ 
        success: false, 
        error: 'Payment not captured' 
      });
    }

    res.json({ 
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Payment verification failed'
    });
  }
});

// Auth Routes
app.get('/auth/google/customer', 
  passport.authenticate('google-customer', {
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
);

app.get('/auth/google/customer/callback', 
  passport.authenticate('google-customer', {
    failureRedirect: '/login',
    session: true
  }),
  (req, res) => {
    res.redirect(process.env.FRONTEND_URL + '/HomePage');
  }
);

app.get('/auth/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.session.destroy(err => {
      if (err) return next(err);
      res.clearCookie('connect.sid');
      res.json({ success: true, message: 'Logged out successfully' });
    });
  });
});

app.get('/auth/status', (req, res) => {
  res.json({ authenticated: req.isAuthenticated(), user: req.user || null });
});

// Provider Registration
app.post('/auth/providers/register', async (req, res) => {
  try {
    if (!req.files?.verified_documents) {
      return res.status(400).json({ error: 'Verification document required' });
    }

    const { name, email, phone, password, service_type } = req.body;
    const file = req.files.verified_documents;

    const fileName = `${Date.now()}${path.extname(file.name)}`;
    const uploadPath = path.join(uploadsDir, fileName);

    await file.mv(uploadPath);

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO providers (name, email, phone, password, service_type, verified_documents) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, phone, hashedPassword, service_type, fileName]
    );

    res.status(201).json({ success: true, providerId: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// API Routes
const customerRoutes = require('./routes/customerRoutes');
const petRoutes = require('./routes/petRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const providerRoutes = require('./routes/providerRoutes');
const serviceDetailsRoutes = require('./routes/serviceDetailsRoutes');
const placesRoutes = require('./routes/placesRoutes');



app.use('/api/customers', customerRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/providers', serviceDetailsRoutes);
app.use('/api/healthcare', providerRoutes);
app.use('/api/places', placesRoutes);

// console.log("Registered routes:");
// app._router.stack.forEach((r) => {
//   if (r.route && r.route.path) {
//     console.log(r.route.path);
//   }
// });

// Error Handling (update existing middleware)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Handle unfinished requests
app.use((req, res, next) => {
  req.on('end', () => {
    if (!res.headersSent) {
      res.status(400).json({ error: "Unexpected end of request" });
    }
  });
  next();
});

// Server Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));