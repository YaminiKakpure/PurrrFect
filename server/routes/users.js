const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/', (req, res) => {
    const users = req.body; // Expecting an array of users

    if (!Array.isArray(users) || users.length === 0) {
        return res.status(400).json({ error: 'At least one user is required' });
    }

    const values = users.map(user => {
        if (!user.name || !user.email || !user.password) {
            return res.status(400).json({ error: 'All fields are required for every user' });
        }
        return [user.name, user.email, user.password];
    });

    const sql = 'INSERT INTO users (name, email, password) VALUES ?';
    db.query(sql, [values], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Users created', affectedRows: result.affectedRows });
    });
});

// ✅ Get All Users (GET)
router.get('/', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// ✅ Get User by ID (GET)
router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(results[0]);
    });
});

// ✅ Update User (PUT)
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, password } = req.body;
    const sql = 'UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?';
    db.query(sql, [name, email, password, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User updated' });
    });
});

// ✅ Delete User (DELETE)
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM users WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User deleted' });
    });
});

module.exports = router;
