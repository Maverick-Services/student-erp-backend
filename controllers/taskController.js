const StepModel = require('../models/Step-model');
const Task = require('../models/Task-model');
const Team = require("../models/Team-model")
const mongoose = require('mongoose');
const Step = require('../models/Step-model')

const getTasks = async (req, res) => {
    try {
        const teamId = req.user.id;
         const team = await Team.findById(teamId)
        .populate('members tasks').exec();

        // console.log(team)

        // Check if users exist
        if (!team) {
            // console.log(users)
            return res.status(404).json({ 
                success:false,
                message: "Team not found"
            });
        }
        const tasks = team?.tasks;

        res.status(200).json({
            success:true,
            message: "Tasks Fetched Successfully",
            data:tasks
        });
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({
            success:false,
            message: "Internal Server Error"
        });
    }
};

const getTaskById = async (req, res) => {
    try {
        const { taskId } = req.body;

        // Check if ID is a valid MongoDB ObjectId
        if (!taskId && !mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(400).json({
                success:false,
                 message: "Task not Found" });
        }

        // Find task by ID and populate assignedTo & steps
        const task = await Task.findById(taskId).populate('team steps');

        if (!task) {
            return res.status(404).json({
                success:false,
                 message: 'Task not found' });
        }

        res.status(200).json({
            success:true,
            message: "Task retrieved successfully", 
            data:task 
        });
    } catch (error) {
        res.status(500).json({ 
            success:false,
            message: "Internal Server Error", 
            error: error.message });
    }
};

const createTask = async (req, res) => {
    
    try {
        const { name, description, clientName, deadline, status } = req.body;
        const teamId = req?.user?.id;
        
        //Validate required fields
        if (!name || !clientName || !deadline || !teamId) {
            return res.status(400).json({
                success:false,
                 message: "Name, Client Name, and Deadline are required." });
        }

        //validate team
        const team = await Team.findById(teamId)
        .populate('members tasks').exec();

        
        // Check if users exist
        if (!team) {
            // console.log(users)
            return res.status(404).json({ 
                success:false,
                message: "Team not found"
            });
        }
        
        //check if team exist
        
        // Create new task
        const task = await Task.create({
            name,
            description,
            clientName,
            deadline,
            team:teamId,
            status
        });
        // console.log("Task",task)
        
        //push task id in team tasks array
        const updatedTeam = await Team.findByIdAndUpdate(
            teamId,
            {
                $push:{
                    tasks: task?._id
                }
            },
            {new:true}
        ).populate('tasks')
        .select('-password').exec();
        // console.log(updatedTeam)

        res.status(201).json({ 
            success:true,
            message: "Task created successfully", 
            data:task,
            updatedTeam 
        });
    } catch (error) {
        res.status(500).json({
            success:false,
             message: "Internal Server Error",
              error: error.message });
    }
};

const updateTask = async (req, res) => {
    try {
        const { taskId ,team} = req.body;

        
        // Check if the ID is a valid MongoDB ObjectId
        if (!taskId && !mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(400).json({
                success:false,
                 message: "Invalid Task ID" 
                });
        }

        if(!team && !mongoose.Types.ObjectId.isValid(team)){
            return res.status(400).json({
                success:false,
                message:"Invalid Team Id"
            })
        }
       

       
        // Ensure required fields are not empty (optional: you can customize this further)
        const { name, description,clientName, deadline,status } = req.body;

        // Find and update the task
        const task = await Task.findByIdAndUpdate(taskId, req.body, { new: true, runValidators: true });

        if (!task) {
            return res.status(404).json({ 
                success:false,
                message: "Task not found" });
        }

        const updatedTeamByTask= await Team.findByIdAndUpdate(team,{$push:{
            tasks:taskId
        }}).populate("tasks")

        res.json({
            success:true,
             message: "Task updated successfully", data:task ,updatedTeamByTask});

        

    } catch (error) {
        res.status(500).json({ 
            success:false,
            message: "Internal Server Error", 
            error: error.message });
    }
};


const deleteTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.body.id);
        if (!task) return res.status(404).json({ 
            success:false,
            message: 'Task not found' });
        res.json({
            success:true,
             message: 'Task deleted successfully' 
            });
    } catch (error) {
        res.status(500).json({
            success:false,
             message: error.message });
    }
};

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask };
