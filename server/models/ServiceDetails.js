const db = require('../config/db');

const ServiceDetails = {
    upsert: async (providerId, data) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Delete existing pricing first (foreign key constraint)
            await connection.query(
                'DELETE FROM services_pricing WHERE provider_id = ?', 
                [providerId]
            );

            // 2. Upsert main details
            const query = `
                INSERT INTO service_details (
                    provider_id, service_title, service_type, 
                    service_description, location, phone, whatsapp,
                    latitude, longitude, service_availability,
                    opening_time, closing_time, home_service,
                    emergency_service, accept_advanced_bookings,
                    service_photos, service_videos, is_complete
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    service_title = VALUES(service_title),
                    service_type = VALUES(service_type),
                    service_description = VALUES(service_description),
                    location = VALUES(location),
                    phone = VALUES(phone),
                    whatsapp = VALUES(whatsapp),
                    latitude = VALUES(latitude),
                    longitude = VALUES(longitude),
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
                data.latitude || null,
                data.longitude || null,
                data.service_availability,
                data.opening_time,
                data.closing_time,
                data.home_service ? 1 : 0,
                data.emergency_service ? 1 : 0,
                data.accept_advanced_bookings ? 1 : 0,
                data.service_photos,
                data.service_videos,
                data.is_complete ? 1 : 0 // New field for payment status
            ]);

            // 3. Insert pricing if exists
            if (data.services && data.services.length > 0) {
                await connection.query(
                    `INSERT INTO services_pricing 
                    (provider_id, service_name, price, duration, description) 
                    VALUES ?`,
                    [
                        data.services.map(service => ([
                            providerId,
                            service.name,
                            parseFloat(service.price),
                            parseInt(service.duration) || 30,
                            service.description || ''
                        ]))
                    ]
                );
            }

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    getByProviderId: async (providerId) => {
        const [details] = await db.query(
            'SELECT * FROM service_details WHERE provider_id = ?', 
            [providerId]
        );
        
        if (!details.length) return null;
        
        const [pricing] = await db.query(
            'SELECT id, service_name as name, price, duration, description ' +
            'FROM services_pricing WHERE provider_id = ?',
            [providerId]
        );
        
        return {
            ...details[0],
            services: pricing
        };
    }
};

module.exports = ServiceDetails;