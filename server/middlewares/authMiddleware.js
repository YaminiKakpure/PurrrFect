const jwt = require('jsonwebtoken');

// Authentication middleware
const authenticate = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: "Token missing" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Authorization middleware
const authorize = (requiredRole) => (req, res, next) => {
  if (req.user?.role !== requiredRole) { // Check decoded token's role
    return res.status(403).json({ 
      error: `Access denied. Requires ${requiredRole} role`,
      yourRole: req.user?.role // Debug info
    });
  }
  next();
};

module.exports = { authenticate, authorize }; // Named exports