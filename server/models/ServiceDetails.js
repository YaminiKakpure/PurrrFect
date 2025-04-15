const db = require('../config/db');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile);

const ServiceDetails = {
  upsert: async (providerId, data, connection = null) => {
    const shouldRelease = !connection;
    connection = connection || await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // 1. Delete existing pricing first
      await connection.query(
        'DELETE FROM services_pricing WHERE provider_id = ?', 
        [providerId]
      );

      // 2. Insert new pricing if services exist
      if (data.services && data.services.length > 0) {
        const services = data.services.map(service => [
          providerId,
          service.name,
          service.price,
          service.duration || 30,
          service.description || ''
        ]);

        await connection.query(
          `INSERT INTO services_pricing 
          (provider_id, service_name, price, duration, description) 
          VALUES ?`,
          [services]
        );
      }

      // 3. Handle file uploads (if using local storage)
      let photoPaths = [];
      let videoPath = null;

      if (data.service_photos) {
        photoPaths = await Promise.all(
          data.service_photos.map(photo => 
            saveBase64File(photo, 'photo', providerId)
        ));
      }

      if (data.service_video) {
        videoPath = await saveBase64File(data.service_video, 'video', providerId);
      }

      // 4. Upsert main service details
      const query = `
        INSERT INTO service_details (
          provider_id, service_title, service_type, 
          service_description, location, phone, whatsapp,
          service_availability, opening_time, closing_time,
          home_service, emergency_service, accept_advanced_bookings,
          service_photos, service_videos, is_complete
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          service_title = VALUES(service_title),
          service_type = VALUES(service_type),
          service_description = VALUES(service_description),
          location = VALUES(location),
          phone = VALUES(phone),
          whatsapp = VALUES(whatsapp),
          service_availability = VALUES(service_availability),
          opening_time = VALUES(opening_time),
          closing_time = VALUES(closing_time),
          home_service = VALUES(home_service),
          emergency_service = VALUES(emergency_service),
          accept_advanced_bookings = VALUES(accept_advanced_bookings),
          service_photos = VALUES(service_photos),
          service_videos = VALUES(service_videos),
          is_complete = VALUES(is_complete)
      `;
      
      await connection.query(query, [
        providerId,
        data.service_title,
        data.service_type,
        data.service_description,
        data.location,
        data.phone,
        data.whatsapp || null,
        data.service_availability,
        data.opening_time,
        data.closing_time,
        data.home_service ? 1 : 0,
        data.emergency_service ? 1 : 0,
        data.accept_advanced_bookings ? 1 : 0,
        JSON.stringify(photoPaths),
        videoPath ? JSON.stringify([videoPath]) : null,
        data.is_complete ? 1 : 0
      ]);

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      console.error('Database error:', error);
      throw error;
    } finally {
      if (shouldRelease && connection) {
        connection.release();
      }
    }
  },

  getByProviderId: async (providerId) => {
    const connection = await db.getConnection();
    try {
      const [details] = await connection.query(
        'SELECT * FROM service_details WHERE provider_id = ?', 
        [providerId]
      );
      
      if (!details.length) return null;
      
      const [pricing] = await connection.query(
        'SELECT service_name as name, price, duration, description ' +
        'FROM services_pricing WHERE provider_id = ? ORDER BY service_name',
        [providerId]
      );
      
      return {
        ...details[0],
        services: pricing,
        home_service: details[0].home_service === 1,
        emergency_service: details[0].emergency_service === 1,
        accept_advanced_bookings: details[0].accept_advanced_bookings === 1,
        service_photos: details[0].service_photos ? JSON.parse(details[0].service_photos) : [],
        service_videos: details[0].service_videos ? JSON.parse(details[0].service_videos) : []
      };
    } finally {
      connection.release();
    }
  }
};

async function saveBase64File(base64Data, type, providerId) {
  if (!base64Data) return null;
  
  // For production, use cloud storage like S3 or Cloudinary
  if (process.env.NODE_ENV === 'production') {
    return await uploadToCloudinary(base64Data, type);
  }

  // Local storage for development
  const uploadDir = path.join(__dirname, '../uploads', providerId.toString());
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  try {
    const matches = base64Data.match(/^data:(.+?);base64,(.+)$/);
    if (!matches) throw new Error('Invalid data URI');
    
    const ext = matches[1].split('/')[1] || (type === 'video' ? 'mp4' : 'jpg');
    const filename = `${type}_${Date.now()}.${ext}`;
    const filePath = path.join(uploadDir, filename);
    
    await writeFile(filePath, matches[2], 'base64');
    return `/uploads/${providerId}/${filename}`;
  } catch (error) {
    console.error('File save error:', error);
    throw new Error('Failed to save file');
  }
}

module.exports = ServiceDetails;