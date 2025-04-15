const db = require('../config/db');
const bcrypt = require('bcryptjs');

const Provider = {
  // Create new provider (sign-up)
  create: async ({ name, email, password, phone, service_type }) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `INSERT INTO providers (name, email, password, phone, service_type) 
                   VALUES (?, ?, ?, ?, ?)`;
    const [result] = await db.query(query, [name, email, hashedPassword, phone, service_type]);
    return result.insertId;
  },

  // Find provider by email (sign-in)
  getByEmail: async (email) => {
    const query = 'SELECT * FROM providers WHERE email = ?';
    const [rows] = await db.query(query, [email]);
    return rows[0];
  },

  // Get provider by ID
  getById: async (id) => {
    const query = 'SELECT * FROM providers WHERE id = ?';
    const [rows] = await db.query(query, [id]);
    return rows[0];
  },

  getWithServiceDetails: async (id) => {
    const [provider] = await db.query(
      'SELECT * FROM providers WHERE id = ?', 
      [id]
    );
    
    if (!provider.length) return null;
    
    const [serviceDetails] = await db.query(
      'SELECT * FROM service_details WHERE provider_id = ?',
      [id]
    );
    
    const [services] = await db.query(
      'SELECT * FROM services_pricing WHERE provider_id = ?',
      [id]
    );
    
    return {
      ...provider[0],
      service_details: {
        ...(serviceDetails[0] || {}),
        services: services || []
      }
    };
  },

  // Update provider
  update: async (id, data, connection = db) => {
    const query = 'UPDATE providers SET ? WHERE id = ?';
    const [result] = await connection.query(query, [data, id]);
    return result.affectedRows > 0;
  }
};

module.exports = Provider;