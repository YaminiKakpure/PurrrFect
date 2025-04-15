const express = require('express');
const router = express.Router();
const controller = require('../controllers/providerController');
const pool = require('../config/db'); // Your MySQL pool connection
const upload = require('../middlewares/uploadMiddleware');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
// Public routes
router.post('/signup', controller.signup);
router.post('/signin', controller.signin);
// Protected route (requires valid JWT)
router.get('/profile',
    authenticate,
    authorize('provider'),
    controller.getProfile
);

// router.get('/:id', 
//     authenticate,
//     authorize('provider'),
//     controller.getProvider
// );

// GET healthcare providers with their services
router.get('/services', async (req, res) => {
    try {
        // Get query parameters
        const { search, service_type } = req.query;
        const userLat = parseFloat(req.query.latitude);
        const userLng = parseFloat(req.query.longitude);
        // Base query to get healthcare providers (service_type = 'vet')
        let query = `
            SELECT 
                p.id, 
                p.name, 
                p.email, 
                p.phone,
                p.profile_photo,
                sd.service_title,
                sd.service_description,
                sd.location,
                sd.latitude,
                sd.longitude,
                sd.service_photos,
                sd.rating,
                sd.reviews_count,
                sd.opening_time,
                sd.closing_time,
                sp.service_name,
                sp.price,
                sp.duration
            FROM providers p
            LEFT JOIN service_details sd ON p.id = sd.provider_id
            LEFT JOIN services_pricing sp ON p.id = sp.provider_id
            WHERE p.service_type = ?
        `;
        // Add search filter if provided
        const queryParams = [service_type];
        if (search) {
            query += ` AND (p.name LIKE ? OR sd.service_title LIKE ? OR sd.location LIKE ?)`;
            queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        // Execute query
        const [providers] = await pool.query(query, queryParams);
        // Process results
        const results = providers.reduce((acc, row) => {
            const existingProvider = acc.find(p => p.id === row.id);
            
            if (existingProvider) {
                // Add service pricing to existing provider
                existingProvider.services.push({
                    name: row.service_name,
                    price: row.price,
                    duration: row.duration
                });
            } else {
                // Create new provider entry
                acc.push({
                    id: row.id,
                    name: row.name,
                    email: row.email,
                    phone: row.phone,
                    profile_photo: row.profile_photo,
                    service_title: row.service_title,
                    service_description: row.service_description,
                    location: row.location,
                    latitude: row.latitude,
                    longitude: row.longitude,
                    service_photos: row.service_photos ? row.service_photos.split(',') : [],
                    rating: row.rating || 0,
                    reviews_count: row.reviews_count || 0,
                    opening_time: row.opening_time,
                    closing_time: row.closing_time,
                    services: [{
                        name: row.service_name,
                        price: row.price,
                        duration: row.duration
                    }],
                    distance: userLat && userLng && row.latitude && row.longitude 
                        ? calculateDistance(userLat, userLng, row.latitude, row.longitude)
                        : null
                });
            }
            return acc;
        }, []);
        // Sort by distance if location provided
        if (userLat && userLng) {
            results.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
        }
        res.json(results);
    } catch (error) {
        console.error('Error fetching healthcare services:', error);
        res.status(500).json({ error: `Failed to fetch ${service_type} services` });
    }
});
router.put('/:id/update-profile',
    authenticate,
    authorize('provider'),
    upload.fields([
      { name: 'profile_photo', maxCount: 1 },
      { name: 'service_photos', maxCount: 5 },
      { name: 'service_video', maxCount: 1 }
    ]),
    controller.updateProfile
);


// Helper function to calculate distance (in km)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}
module.exports = router;