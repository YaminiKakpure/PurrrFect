const express = require('express');
const router = express.Router();
const placesController = require('../controllers/placesController');

// Get places by category
router.get('/', placesController.getPlacesByCategory);

// Get reviews for a specific place
router.get('/:placeId/reviews', placesController.getPlaceReviews);

// Add this route before the reviews route
router.get('/:id', placesController.getPlaceById);

// In your routes file
router.get('/:placeId/reviews', placesController.getPlaceReviews);

module.exports = router;