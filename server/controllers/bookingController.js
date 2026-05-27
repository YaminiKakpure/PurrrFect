const Booking = require("../models/Booking");

exports.createBooking = (req, res) => {
    Booking.create(req.body, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Booking created", bookingId: result.insertId });
    });
};

exports.getAllBookings = (req, res) => {
    Booking.findAll((err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

exports.getBookingById = (req, res) => {
    Booking.findById(req.params.id, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result[0] || {});
    });
};

exports.updateBooking = (req, res) => {
    Booking.updateStatus(req.params.id, req.body.status, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Booking updated" });
    });
};

exports.deleteBooking = (req, res) => {
    Booking.delete(req.params.id, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Booking deleted" });
    });
};
