const User = require('../models/User-model');
const MembersHistory = require('../models/MembersHistory-model');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const Team = require('../models/Team-model');
const crypto = require('crypto');
const { default: mongoose } = require('mongoose');
const mailSender = require('../utils/mailSender');

const generateRandomPassword = () => {
    return crypto.randomBytes(6).toString('hex'); // Generates a 12-character random password
};

// Get All Users
const getUsers = async (req, res) => {
    try {
        // Fetch all users and populate related fields
        const users = await User.find(
            {
                role:"employee"
            }
        ).populate('team tasks');

        // Check if users exist
        if (!users || users.length === 0) {
            return res.status(404).json({ 
                success:false,
                message: "No users found"
             }
            );
        }

        res.status(200).json({
            success:true,
            message: "Users Fetched Successfully",
            data:users
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({
            success:false,
             message: "Internal Server Error"
             });
    }
};


// Get User by ID
const getUserById = async (req, res) => {
    try {
        const { userId } = req.body;

        // Validate if ID is a valid MongoDB ObjectId
        if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ 
                success:false,
                message: "Invalid user ID format" 
            });
        }

        // Find user by ID and populate related fields
        const user = await User.findById(userId).populate('team tasks');

        // Check if user exists
        if (!user) {
            return res.status(404).json({
                success:false,
                 message: "User not found" 
                });
        }

        res.status(200).json({
            success:true,
            message:"Users Fetched Successfully By Id",
            data:user
        });
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        res.status(500).json({
            success:false,
             message: "Internal Server Error" 
            });
    }
};

const createUser = async (req, res) => {
    const { name, email, team,role, phoneNo } = req.body;

    try {
        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }

        // Generate a random password
        const generatedPassword = generateRandomPassword();
        const hashedPassword = await bcrypt.hash(generatedPassword, 10);

        let data = {
            name, email, role, phoneNo,
            password: hashedPassword
        };
        if(req.body.team && mongoose.Types.ObjectId.isValid(req.body.team)){
            data = {
                ...data,
                team: req.body.team
            }
        }else{
            data = {
                ...data,
                team: null
            }

        }        

        // Create user
        const user = new User({
            ...data
        });

        await user.save();

        if (req.body.team) {

            // create members history of joining team
            const newMemerHistory = new MembersHistory({
                team,
                user: user?._id,
                status: 'joined'
            });
            await newMemerHistory.save();
            
            // **Add User to the Team's Members Array and add the newMemberHistory to the team member history array Automatically**
            await Team.findByIdAndUpdate(team, { 
                $push: { members: user._id }, 
                $push: { memberHistory: newMemerHistory?._id }
            });
        }

        //Send login credentials to new user
        await mailSender(email,'Your Account Credentials',`Hello ${name}, ${role} Login\n\nYour account has been created successfully.\nYour login credentials:\nEmail: ${email}\nPassword: ${generatedPassword}\n\nPlease change your password after logging in.\n\nBest regards,\nYour Team`)

        res.status(201).json({
            success: true,
            message: 'User created successfully. Password sent to email.',
            data: user
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Update User
const updateUser = async (req, res) => {
    try {
        const { userId, name, email, phoneNo, password, role, team, teamLeader, tasks } = req.body;

        if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ success: false, message: "Invalid user ID format" });
        }

        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        let hashedPassword = user.password;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        // **If team is updated, add user to the team's members array**
        if (team && user.team?.toString() !== team) {

            // Remove the user from their previous team's members array
            if (user.team) {
                
                // create member history of leaving team
                const leftMemberHistory = new MembersHistory({
                    team: user?.team,
                    user: user?._id,
                    status: 'left'
                });
                await leftMemberHistory.save();
                
                await Team.findByIdAndUpdate(user.team, { 
                    $pull: { members: userId }, 
                    $push: { memberHistory: leftMemberHistory?._id }
                });
            }
            
            // create member history of joining new team
            const newMemberHistory = new MembersHistory({
                team: team,
                user: user?._id,
                status: 'joined'
            });
            await newMemberHistory.save();

            // Add the user to the new team's members array
            await Team.findByIdAndUpdate(team, { 
                $addToSet: { members: userId }, 
                $push: { memberHistory: newMemberHistory?._id }
            });
        }

        user = await User.findByIdAndUpdate(
            userId,
            { name, email, password: hashedPassword, role, team, phoneNo, teamLeader, tasks },
            { new: true, runValidators: true }
        ).populate("team tasks");

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: user
        });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Delete User
const deleteUser = async (req, res) => {
    try {
        const { id } = req.body;

        // Validate if ID is a valid MongoDB ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ 
                success:false,
                message: "Invalid user ID format" 
            });
        }

        // Find and delete the user
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({
                success:false,
                 message: "User not found" 
                });
        }

        res.status(200).json({ 
            success:true,
            message: "User deleted successfully"
         });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ 
            success:false,
            message: "Internal Server Error" });
    }
};


const getTasksbyUser = async(req,res)=>{
    
    try {
        const  userId  = req.user.id;

        // Validate if ID is a valid MongoDB ObjectId
        if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ 
                success:false,
                message: "Invalid user ID format" 
            });
        }

        // Find user by ID and populate related fields
        const user = await User.findById(userId).populate('team tasks');

        // Check if user exists
        if (!user) {
            return res.status(404).json({
                success:false,
                 message: "User not found" 
                });
        }

        res.status(200).json({
            success:true,
            message:"Users Fetched Successfully By Id",
            data:user.tasks
        });
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        res.status(500).json({
            success:false,
             message: "Internal Server Error" 
            });
    }
    
}


module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser,getTasksbyUser };
