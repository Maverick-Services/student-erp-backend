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
        .populate('memberHistory')
        .populate('tasks').exec();
        if (!team) {
            return res.status(404).json({
                success:false,
                 message: "User not found" 
                });
        }
        const isMatch = await bcrypt.compare(password, team.password);
        if (!isMatch) {
            return res.status(400).json({ 
                success:false,
                message: "Invalid credentials"
             });
        }

        
        const token = jwt.sign({ id:team?._id, userId: team.userName }, process.env.JWT_SECRET, { expiresIn: "2d" });
        team.password = undefined;

        res.json({ 
            success:true,
            message: "Login successful", 
            data:{token,team} });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ 
            success:false,
            message: "Internal Server Error" 
        });
    }
});

// **Protected Route (Example)**
router.get("/protected", authTeamMiddleware, (req, res) => {
    res.json({ message: "This is a protected route", user: req.user });
});

module.exports = router;
