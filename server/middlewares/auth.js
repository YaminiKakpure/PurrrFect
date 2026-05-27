// const jwt = require('jsonwebtoken');
// const Provider = require('../models/Provider');
// const db = require('../config/db');

// module.exports = {
//   authenticate: async (req, res, next) => {
//     try {
//       const token = req.header('Authorization')?.replace('Bearer ', '');
      
//       if (!token) {
//         return res.status(401).json({ 
//           success: false,
//           error: 'Authentication required' 
//         });
//       }

//       const decoded = jwt.verify(
//         token, 
//         process.env.JWT_SECRET || 'e82d85c7-9179-45a8-a304-3eccbb85c620'
//       );
      
//       const provider = await Provider.getById(decoded.id);
//       if (!provider) {
//         return res.status(401).json({ 
//           success: false,
//           error: 'Invalid token' 
//         });
//       }

//       req.provider = provider;
//       next();
//     } catch (error) {
//       res.status(401).json({ 
//         success: false,
//         error: 'Please authenticate' 
//       });
//     }
//   },

//   authorize: (role) => {
//     return (req, res, next) => {
//       if (req.provider.role !== role) {
//         return res.status(403).json({ 
//           success: false,
//           error: 'Access denied' 
//         });
//       }
//       next();
//     };
//   }
// };



const jwt = require('jsonwebtoken');
const db = require('../config/db');
const Provider = require('../models/Provider');

module.exports = {
  // Combined authentication for both customers and providers
  authenticate: async (req, res, next) => {
    try {
      // 1. Get token from header
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ 
          success: false,
          error: 'Authentication required' 
        });
      }

      // 2. Verify token
      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || 'e82d85c7-9179-45a8-a304-3eccbb85c620'
      );
      
      // 3. Check if user is provider or customer
      let user;
      if (decoded.role === 'provider') {
        user = await Provider.getById(decoded.id);
      } else {
        // For customers
        const [users] = await db.query('SELECT * FROM customers WHERE id = ?', [decoded.id]);
        user = users[0];
      }

      if (!user) {
        return res.status(401).json({ 
          success: false,
          error: 'User not found' 
        });
      }

      // 4. Attach user to request with type info
      req.user = user;
      req.userType = decoded.role || 'customer'; // Default to customer if not specified
      next();
    } catch (error) {
      res.status(401).json({ 
        success: false,
        error: 'Invalid authentication' 
      });
    }
  },

  // Role-based authorization (works for both customers and providers)
  authorize: (allowedRoles) => {
    return (req, res, next) => {
      if (!allowedRoles.includes(req.userType)) {
        return res.status(403).json({ 
          success: false,
          error: 'Access denied' 
        });
      }
      next();
    };
  },

  // Optional: Specific middleware for providers only
  authenticateProvider: async (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ 
          success: false,
          error: 'Authentication required' 
        });
      }

      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || 'e82d85c7-9179-45a8-a304-3eccbb85c620'
      );
      
      const provider = await Provider.getById(decoded.id);
      if (!provider) {
        return res.status(401).json({ 
          success: false,
          error: 'Invalid token' 
        });
      }

      req.provider = provider;
      next();
    } catch (error) {
      res.status(401).json({ 
        success: false,
        error: 'Please authenticate' 
      });
    }
  }
};