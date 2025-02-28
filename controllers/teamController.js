const Team = require('../models/Team-model');
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");

const generatePassword = () => {
    return Math.random().toString(36).slice(-8); // Generates an 8-character password
};
const getTeams = async (req, res) => {
    try {
        const teams = await Team.find()
            .populate('teamLeader', 'name email') // Fetch only necessary fields
            .populate('members', 'name email') 
            .populate('tasks', 'title description')
            .exec();     // Ensures population executes

        if (!teams || teams.length === 0) {
            return res.status(404).json({ message: "No teams found" });
        }

        res.status(200).json(teams);
    } catch (error) {
        console.error("Error fetching teams:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


const getTeamById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid team ID format" });
        }

        const team = await Team.findById(id)
            .populate('teamLeader', 'name email') // Populate only name & email for team leader
            .populate('members', 'name email')
            .populate('tasks', 'title description')
            .exec();  // Ensures population is executed

        if (!team) return res.status(404).json({ message: "Team not found" });

        res.status(200).json(team);
    } catch (error) {
        console.error("Error fetching team by ID:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};



const createTeam = async (req, res) => {
    const { teamLeader, teamName, description, members, tasks } = req.body;

    try {
        // **Extract Admin Email from Token**
        if (!req.user || !req.user.email) {
            return res.status(401).json({ message: "Unauthorized: Admin email not found in token" });
        }
        const adminEmail = req.user.email;

        // Validate required fields
        if (!teamLeader || !teamName) {
            return res.status(400).json({ message: "Team Leader and Team Name are required" });
        }

        // Generate User ID & Password
        const userId = `${teamName.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`;
        const password = generatePassword();
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create and Save Team
        const team = new Team({ teamLeader, teamName, description, members, tasks, userName: userId, password:hashedPassword });
        await team.save();

        // **Setup Nodemailer with Gmail (Using OAuth2)**
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL, // Your Gmail email
                pass: process.env.PASSWORD, // Use an "App Password" (DO NOT use your real password)
            },
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: adminEmail,
            subject: "New Team Created - Access Details",
            text: `Hello Admin,\n\nA new team has been created.\n\nTeam Name: ${teamName}\nUser ID: ${userId}\nPassword: ${password}\n\nPlease use these credentials to access the team.`,
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({ message: "Team created successfully. Email sent to Admin.", team });
    } catch (error) {
        console.error("Error creating team:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


// const updateTeam = async (req, res) => {
//     try {
//         const team = await Team.findByIdAndUpdate(
//             req.params.id,
//             req.body,
//             { new: true, runValidators: true }
//         )
//         .populate('teamLeader', 'name email')
//         .populate('members', 'name email')
//         .populate('tasks', 'title description')
//         .exec();

//         if (!team) return res.status(404).json({ message: "Team not found" });

//         res.status(200).json(team);
//     } catch (error) {
//         console.error("Error updating team:", error);
//         res.status(500).json({ message: "Internal Server Error", error: error.message });
//     }
// };
const updateTeam = async (req, res) => {
    try {
        const { teamLeader, members } = req.body;
        const teamId = req.params.id;

        // Find the existing team
        const existingTeam = await Team.findById(teamId);
        if (!existingTeam) {
            return res.status(404).json({ message: "Team not found" });
        }

        // If teamLeader is updated, ensure they are not leading another team
        if (teamLeader && existingTeam.teamLeader?.toString() !== teamLeader) {
            await Team.updateMany(
                { teamLeader: teamLeader }, 
                { $unset: { teamLeader: "" } }
            );
        }

        // If members are updated, ensure they are not part of multiple teams
        if (members && members.length > 0) {
            await Team.updateMany(
                { _id: { $ne: teamId }, members: { $in: members } },
                { $pull: { members: { $in: members } } }
            );
        }

        // Update team details
        const updatedTeam = await Team.findByIdAndUpdate(
            teamId,
            req.body,
            { new: true, runValidators: true }
        )
        .populate('teamLeader', 'name email')
        .populate('members', 'name email')
        .populate('tasks', 'title description')
        .exec();

        res.status(200).json({ message: "Team updated successfully", updatedTeam });
    } catch (error) {
        console.error("Error updating team:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

const deleteTeam = async (req, res) => {
    try {
        const team = await Team.findByIdAndDelete(req.params.id);
        if (!team) return res.status(404).json({ message: 'Team not found' });
        res.json({ message: 'Team deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getTeams, getTeamById, createTeam, updateTeam, deleteTeam };
