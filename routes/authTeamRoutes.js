const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Team = require("../models/Team-model"); // Import Team Model
const authTeamMiddleware = require("../middleware/authTeamMiddleware");


const router = express.Router();

// **Login Route**
router.post("/", async (req, res) => {
    const { userName, password } = req.body;

    try {
        let team = await Team.findOne({ userName })
        .populate('teamLeader')
        .populate('members')
        .populate('tasks').exec();
        if (!team) {
            return res.status(404).json({ message: "User not found" });
        }
        const isMatch = await bcrypt.compare(password, team.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign({ userId: team.userName }, process.env.JWT_SECRET, { expiresIn: "1h" });

        team.password = undefined;

        res.json({ message: "Login successful", 
            data:{token,team} });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// **Protected Route (Example)**
router.get("/protected", authTeamMiddleware, (req, res) => {
    res.json({ message: "This is a protected route", user: req.user });
});

module.exports = router;
