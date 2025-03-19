const Team = require('../models/Team-model');
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const User = require('../models/User-model');
const { default: mongoose } = require('mongoose');

const generatePassword = () => {
    return Math.random().toString(36).slice(-8); // Generates an 8-character password
};
const getTeams = async (req, res) => {
    try {
        const teams = await Team.find()
            .populate('teamLeader') // Fetch only necessary fields
            .populate('members') 
            .populate('tasks')
            .exec();     // Ensures population executes

        if (!teams || teams.length === 0) {
            return res.status(404).json({
                success:false,
                 message: "No teams found" });
        }

        res.status(200).json(
            {success:true,
            message:"Team Fetched Successfully",
            data:teams});
    } catch (error) {
        console.error("Error fetching teams:", error);
        res.status(500).json({ 
            success:false,
            message: "Internal Server Error" 
        });
    }
};


const getTeamById = async (req, res) => {
    try {
        const { teamId } = req.body;

        if (!teamId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success:false,
                 message: "Invalid team ID format" 
                });
        }

        const team = await Team.findById(teamId)
            .populate('teamLeader') // Populate only name & email for team leader
            .populate('members')
            .populate('tasks')
            // .populate('tasks', 'steps team')
            .exec();  // Ensures population is executed

        if (!team) return res.status(404).json({
            success:false,
             message: "Team not found"
             });

        res.status(200).json({
            success:true,
            message: "Team fetched Successfully By Id",
            data:team});
    } catch (error) {
        console.error("Error fetching team by ID:", error);
        res.status(500).json({
            success:false,
             message: "Internal Server Error"
             });
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
const createTeam = async (req, res) => {
    
    try {
        const { teamLeader, teamName, description, members, tasks } = req.body;
        
        if(!teamName || !description){
            return res.status(404).json({
                success: false,
                message: "Required Details Not found"
            });
        }
        // **Extract Admin Email from Token**
        if (!req.user && !req.user.email) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Admin email not found in token"
            });
        }
        const adminEmail = req.user.email;

        // Validate required fields
        // if (!teamLeader || !teamName) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "Team Leader and Team Name are required"
        //     });
        // }

        // Generate User ID & Password
        const userId = `${teamName.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`;
        const password = generatePassword();
        const hashedPassword = await bcrypt.hash(password, 10);

        let data = {
            teamName,description,
            userName: userId,
            password: hashedPassword
        };
        if(teamLeader && mongoose.Types.ObjectId.isValid(teamLeader)){
            data = {
                ...data,
                teamLeader
            }
        }

        // Create and Save Team
        const team = await Team.create({
            ...data
        });


        let teamLeaderDetails = null;
        if(team?.teamLeader){
            teamLeaderDetails = await User.findByIdAndUpdate(
                team?.teamLeader,
                {
                    teamLeader:team?._id
                }
            );
        }
        

        // ✅ **Setup Nodemailer with Gmail (Using OAuth2)**
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL, // ✅ Your Gmail email
                pass: process.env.PASSWORD, // ✅ Use an "App Password"
            },
        });

        let mailOptions = {
            from: process.env.EMAIL,
            to: adminEmail,
            subject: "New Team Created - Access Details",
            text: `Hello Admin,\n\nA new team has been created.\n\nTeam Name: ${teamName}\nUser ID: ${userId}\nPassword: ${password}\n\nPlease use these credentials to access the team.`,
        };

        await transporter.sendMail(mailOptions);
        
        if(teamLeaderDetails){
            mailOptions = {
                ...mailOptions,
                to: teamLeaderDetails?.email
            }
            await transporter.sendMail(mailOptions);
        }

        res.status(201).json({
            success: true,
            message: "Team created successfully. Email sent to Admin.",
            data: team
        });
    } catch (error) {
        console.error("Error creating team:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

const updateTeam = async (req, res) => {
    try {
        const { teamId, teamName, description, teamLeader } = req.body;

        const existingTeam = await Team.findById(teamId);
        
        if (!existingTeam) {
            return res.status(404).json({ success: false, message: "Team not found" });
        }

        let updates = {};
        if(teamName)
            updates = {...updates,teamName}
        if(description)
            updates = {...updates,description}

        // If teamLeader is updated, ensure they are not leading another team
        if(existingTeam?.teamLeader){
            //Remove the previous leader power from previous team leader
            await User.findByIdAndUpdate(
                existingTeam?.teamLeader,
                {
                    teamLeader: null
                }
            );           
        }
        if (teamLeader && mongoose.Types.ObjectId.isValid(teamLeader)) {
            await User.findByIdAndUpdate(
                teamLeader,
                {
                    teamLeader: existingTeam?._id
                }
            );
            updates = {...updates,teamLeader}

            //mail send to new leader
            
        }else{
            updates = {...updates,teamLeader: null}
        }

        
        //if teamLeader added in userId

        // If members are updated, ensure they are not part of multiple teams
        // if (members && members.length > 0) {
        //     await Team.updateMany(
        //         { _id: { $ne: id }, members: { $in: members } },
        //         { $pull: { members: { $in: members } } }
        //     );

        //     // **Automatically assign team to its members**
        //     await User.updateMany(
        //         { _id: { $in: members } },
        //         { team: id }
        //     );
        // }

        const updatedTeam = await Team.findByIdAndUpdate(
            teamId,
            updates,
            { new: true, runValidators: true }
        )
        .populate('teamLeader')
        .populate('members')
        .populate('tasks')
        .exec();

        // let teamLeaderDetailsUpdate=null
        // if(updatedTeam?.teamLeader){
        //     teamLeaderDetailsUpdate = await User.findByIdAndUpdate(
        //         updatedTeam?.teamLeader,
        //         {
        //             teamLeader:updatedTeam?._id
        //         }
        //     );
        // }

        // console.log(updatedTeam?.teamLeader)

        res.status(200).json({ success: true, message: "Team updated successfully", data: updatedTeam });
    } catch (error) {
        console.error("Error updating team:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};


const deleteTeam = async (req, res) => {
    try {
        const team = await Team.findByIdAndDelete(req.body.id);
        if (!team) return res.status(404).json({
            success:false,
             message: 'Team not found'
             });
        res.json({ 
            success:true,
            message: 'Team deleted successfully' 
        });
    } catch (error) {
        res.status(500).json({ 
            success:false,
            message: error.message 
        });
    }
};


// Get All Users
const getTeamMembers = async (req, res) => {
    try {
        const teamId = req?.user?.id || req?.body?.teamId;
        // console.log(teamId);
        // Fetch all users and populate related fields
        const team = await Team.findById(teamId)
        .populate('members tasks').exec();

        // console.log(team)

        
        // Check if users exist
        if (!team) {
            // console.log(users)
            return res.status(404).json({ 
                success:false,
                message: "Team not found"
            }
        );
    }
        const users = team?.members;

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


module.exports = { getTeams, getTeamById, createTeam, updateTeam, deleteTeam, getTeamMembers };
