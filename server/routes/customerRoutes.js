const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const authenticateToken = require('../middlewares/authenticateToken');

// Public routes
router.post('/', customerController.createCustomer); // Signup Route
router.post('/login', customerController.login); // Login Route

// Protected routes
router.get('/profile', authenticateToken, customerController.getProfile);
router.put('/:id', 
    authenticateToken,
    customerController.updateProfile
);

router.post('/save-location', authenticateToken, customerController.saveLocation); // Save Location Route
router.get('/get-location', authenticateToken, customerController.getLocation); // Fetch Location Route

module.exports = router;







// const express = require('express');
// const router = express.Router();
// const customerController = require('../controllers/customerController');
// const authenticateToken = require('../middleware/authenticateToken');


// // Customer routes
// router.post('/', customerController.createCustomer); // Signup Route
// router.get('/', customerController.getAllCustomers);
// router.get('/:id', customerController.getCustomerById);
// router.put('/:id', customerController.updateCustomer);
// router.delete('/:id', customerController.deleteCustomer);
// router.post('/login', customerController.login); // Login Route
// // router.post('/save-location', customerController.saveLocation); // Save Location Route
// // router.get('/get-location', customerController.getLocation); // Fetch Location Route

// // Save location (protected route)
// router.post('/save-location', authenticateToken, customerController.saveLocation);

// // Get location (protected route)
// router.get('/get-location', authenticateToken, customerController.getLocation);
// module.exports = router;


