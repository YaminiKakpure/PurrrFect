const express = require('express');
const router = express.Router();
const controller = require('../controllers/serviceDetailsController');
const upload = require('../middlewares/uploadMiddleware');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Save draft
router.post('/:id/draft', 
  authenticate,
  authorize('provider'),
  upload.fields([
    { name: 'service_photos', maxCount: 5 },
    { name: 'service_video', maxCount: 1 }
  ]),
  controller.saveDraft
);

// Complete registration (initiate payment)
router.post('/:id/complete-registration',
  authenticate,
  authorize('provider'),
  controller.completeRegistration
);

// Verify payment and finalize registration
router.post('/:id/verify-payment',
  authenticate,
  authorize('provider'),
  controller.verifyPayment
);

// Get service details
router.get('/:id',
  controller.getServiceDetails
);

module.exports = router;