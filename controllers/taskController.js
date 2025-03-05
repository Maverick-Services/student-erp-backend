const StepModel = require('../models/Step-model');
const Task = require('../models/Task-model');
const Team = require("../models/Team-model")
const mongoose = require('mongoose');

const getTasks = async (req, res) => {
    try {
        const teamId = req.user.id;
         const team = await Team.findById(teamId)
        .populate('members tasks').exec();

        console.log(team)

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
        const { id } = req.body;

        // Check if ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success:false,
                 message: "Invalid Task ID" });
        }

        // Find task by ID and populate assignedTo & steps
        const task = await Task.findById(id).populate('assignedTo').populate('steps');

        if (!task) {
            return res.status(404).json({
                success:false,
                 message: 'Task not found' });
        }

        res.status(200).json({
            success:true,
            message: "Task retrieved successfully", task });
    } catch (error) {
        res.status(500).json({ 
            success:false,
            message: "Internal Server Error", 
            error: error.message });
    }
};

const createTask = async (req, res) => {
    const { name, description, assignedTo, steps, clientName, deadline, status } = req.body;

    try {
        // const teamId = req?.user?.id;

        //validate team

        // Validate required fields
        if (!name || !clientName || !deadline) {
            return res.status(400).json({
                success:false,
                 message: "Name, Client Name, and Deadline are required." });
        }

        //check if team exist

        // Create new task
        const task = new Task({
            name,
            description,
            assignedTo,
            steps,
            clientName,
            deadline,
            status
        });

        // Save to database
        await task.save();

        //add steps to task
        steps?.forEach(st => {
            //create step
            // const newStep = StepModel.create({...st,taskId});

            //add this step in task's steps array

        })

        //push task id in team tasks array

        res.status(201).json({ 
            success:true,
            message: "Task created successfully", data:task });
    } catch (error) {
        res.status(500).json({
            success:false,
             message: "Internal Server Error",
              error: error.message });
    }
};

const updateTask = async (req, res) => {
    try {
        const { id } = req.body;

        // Check if the ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success:false,
                 message: "Invalid Task ID" 
                });
        }

        // Ensure required fields are not empty (optional: you can customize this further)
        const { name, clientName, deadline } = req.body;
        if (!name || !clientName || !deadline) {
            return res.status(400).json({ 
                success:false,
                message: "Required fields: name, clientName, and deadline" });
        }

        // Find and update the task
        const task = await Task.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

        if (!task) {
            return res.status(404).json({ 
                success:false,
                message: "Task not found" });
        }

        res.json({
            success:true,
             message: "Task updated successfully", data:task });
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
