const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {authMiddleware} = require('../middleware/authMiddleware');
const User = require('../models/User-model');

const router = express.Router();

// User Registration
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'employee'
        });

        await user.save();

        // Generate JWT Token
        const token = jwt.sign({ id: user._id, role: user.role ,email: user.email}, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ message: "User registered successfully", token });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

// User Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid Email or Password" });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Email or Password" });
        }

        // Generate JWT Token
        const token = jwt.sign({ id: user._id, role: user.role , email: user.email}, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ message: "Login successful", token });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});
router.get('/profile', authMiddleware, async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
});
module.exports = router;
