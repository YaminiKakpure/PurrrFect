const express = require('express');
const router = express.Router();
const controller = require('../controllers/serviceDetailsController');
const upload = require('../middlewares/uploadMiddleware');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const authenticateToken = require('../middlewares/authMiddleware');

// Remove duplicate middleware (already applied through router.use)
router.post('/:id/service-details', 
  upload.fields([
    { name: 'service_photos', maxCount: 5 },
    { name: 'service_video', maxCount: 1 }
  ]),
  controller.updateServiceDetails
);

router.get('/:id/service-details',
  controller.getServiceDetails
);

// Add new endpoint for payment-complete registration
router.post('/:id/complete-registration',
  upload.fields([
    { name: 'service_photos', maxCount: 5 },
    { name: 'service_video', maxCount: 1 }
  ]),
  controller.completeRegistration
);

module.exports = router;