const db = require("../config/db");

const Booking = {
    create: (data, callback) => {
        const query = `INSERT INTO bookings (customer_id, provider_id, pet_id, service_type, date, time_slot, status) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        db.query(query, [data.customer_id, data.provider_id, data.pet_id, data.service_type, data.date, data.time_slot, data.status || "pending"], callback);
    },

    findAll: (callback) => {
        const query = `SELECT * FROM bookings`;
        db.query(query, callback);
    },

    findById: (id, callback) => {
        const query = `SELECT * FROM bookings WHERE id = ?`;
        db.query(query, [id], callback);
    },

    updateStatus: (id, status, callback) => {
        const query = `UPDATE bookings SET status = ? WHERE id = ?`;
        db.query(query, [status, id], callback);
    },

    delete: (id, callback) => {
        const query = `DELETE FROM bookings WHERE id = ?`;
        db.query(query, [id], callback);
    }
};

module.exports = Booking;
