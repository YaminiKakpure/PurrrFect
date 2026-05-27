const Payment = require("../models/Payment");

exports.createPayment = (req, res) => {
    Payment.create(req.body, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Payment created", paymentId: result.insertId });
    });
};

exports.getAllPayments = (req, res) => {
    Payment.findAll((err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

exports.getPaymentById = (req, res) => {
    Payment.findById(req.params.id, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result[0] || {});
    });
};

exports.updatePayment = (req, res) => {
    Payment.updateStatus(req.params.id, req.body.status, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Payment status updated" });
    });
};

exports.deletePayment = (req, res) => {
    Payment.delete(req.params.id, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Payment deleted" });
    });
};
