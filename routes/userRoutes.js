const express = require('express');
const mongoose = require('mongoose');
const { getUsers, getUserById, createUser, updateUser, deleteUser } = require('../controllers/userController');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User-model');

router.get('/', getUsers);

// ✅ This route works fine
router.get('/kamm', authMiddleware , async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
})

// ✅ Validate ID before calling getUserById
router.get('/:id', (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid User ID" });
    }
    next();
}, getUserById);

router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
