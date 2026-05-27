const db = require('../config/db');

exports.getPlacesByCategory = async (req, res) => {
  try {
    const { category } = req.query;
    const query = 'SELECT * FROM PLACES WHERE category = ?';
    const [places] = await db.query(query, [category]);
    
    res.json(places);
  } catch (error) {
    console.error('Error fetching places:', error);
    res.status(500).json({ error: 'Failed to fetch places' });
  }
};

exports.getPlaceReviews = async (req, res) => {
    try {
      const { placeId } = req.params;
      
      // Validate placeId exists
      if (!placeId) {
        return res.status(400).json({ error: 'Place ID is required' });
      }
  
      const query = `
        SELECT 
          id, 
          place_id, 
          COALESCE(user_name, 'Anonymous') as user_name,
          COALESCE(NULLIF(rating, NULL), 0) as rating,
          COALESCE(review, 'No review text') as review,
          created_at
        FROM places_reviews 
        WHERE place_id = ?
        ORDER BY created_at DESC
      `;
      
      const [reviews] = await db.query(query, [placeId]);
      
      // Convert rating to number if it comes as string
      const processedReviews = reviews.map(review => ({
        ...review,
        rating: Number(review.rating)
      }));
      
      res.json(processedReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ 
        error: 'Failed to fetch reviews',
        details: error.message 
      });
    }
};

exports.getPlaceById = async (req, res) => {
  
    try {
      const { id } = req.params;
      if (!id || id === 'undefined') {
        return res.status(400).json({ error: 'Place ID is required' });
      }
      const query = 'SELECT * FROM PLACES WHERE id = ?';
      const [places] = await db.query(query, [id]);
      
      if (places.length === 0) {
        return res.status(404).json({ error: 'Place not found' });
      }
      
      res.json(places[0]);
    } catch (error) {
      console.error('Error fetching place:', error);
      res.status(500).json({ error: 'Failed to fetch place' });
    }
  };