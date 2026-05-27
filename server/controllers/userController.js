const User = require('../models/userModel');

// ✅ Get All Users
const getAllUsers = (req, res) => {
    User.getAllUsers((err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.status(200).json(results);
    });
};

// ✅ Get User by ID
const getUserById = (req, res) => {
    User.getUserById(req.params.id, (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (results.length === 0) return res.status(404).json({ error: 'User not found' });
        res.status(200).json(results[0]);
    });
};

// ✅ Create New User
const createUser = (req, res) => {
    User.createUser(req.body, (err, result) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.status(201).json({ message: 'User created successfully', id: result.insertId });
    });
};

// ✅ Update User
const updateUser = (req, res) => {
    User.updateUser(req.params.id, req.body, (err, result) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
        res.status(200).json({ message: 'User updated successfully' });
    });
};

// ✅ Delete User
const deleteUser = (req, res) => {
    User.deleteUser(req.params.id, (err, result) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
        res.status(200).json({ message: 'User deleted successfully' });
    });
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
