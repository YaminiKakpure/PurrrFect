const db = require('../config/db');

const Customer = {
  create: async (customer) => {
    const query = 'INSERT INTO customers (name, email, password, phone, address, profile_photo, auth_provider, google_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const [result] = await db.query(query, [
      customer.name,
      customer.email,
      customer.password,
      customer.phone,
      customer.address,
      customer.profile_photo,
      customer.auth_provider || 'local', // Default is 'local'
      customer.google_id || null, // Null for non-Google users
    ]);
    return result;
  },

  getAll: async () => {
    const [results] = await db.query('SELECT * FROM customers');
    return results;
  },

  getById: async (id) => {
    const [results] = await db.query('SELECT * FROM customers WHERE id = ?', [id]);
    return results[0];
  },

  updateProfile: async (id, updates) => {
    const validFields = ['name', 'email', 'phone', 'address', 'profile_photo'];
    const setClause = [];
    const values = [];
    
    Object.entries(updates).forEach(([key, value]) => {
      if (validFields.includes(key) && value !== undefined) {
        setClause.push(`${key} = ?`);
        values.push(value);
      }
    });
  
    if (setClause.length === 0) {
      throw new Error('No valid fields to update');
    }
  
    values.push(id);
    const query = `UPDATE customers SET ${setClause.join(', ')} WHERE id = ?`;
    await db.query(query, values);
  },

  // Method to update profile photo separately
  updateProfilePhoto: async (id, photoPath) => {
    await db.query(
      'UPDATE customers SET profile_photo = ? WHERE id = ?',
      [photoPath, id]
    );
  },


  delete: async (id) => {
    await db.query('DELETE FROM customers WHERE id = ?', [id]);
  },

  getByEmail: async (email) => {
    const [results] = await db.query('SELECT * FROM customers WHERE email = ?', [email]);
    return results[0]; // Return the first customer found
  },
};

module.exports = Customer;
