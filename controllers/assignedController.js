const Assigned = require('../models/Assigned-model');
const mongoose = require('mongoose');
const Task = require('../models/Task-model');
const User = require('../models/User-model');

const getAssigned = async (req, res) => {
    try {
        const assigned = await Assigned.find().populate('task user');
        res.json(assigned);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAssignedById = async (req, res) => {
    try {
        const assigned = await Assigned.findById(req.body.id).populate('task user');
        if (!assigned) return res.status(404).json({ message: 'Assigned record not found' });
        res.json(assigned);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createAssigned = async (req, res) => {
    try {
        const { task, user } = req.body;

        // Validate required fields
        if (!task || !user) {
            return res.status(400).json({ message: "Task and User are required." });
        }

        // Validate ObjectIds
        if (!mongoose.Types.ObjectId.isValid(task) || !mongoose.Types.ObjectId.isValid(user)) {
            return res.status(400).json({ message: "Invalid Task or User ID." });
        }

        // Check if task exists
        const taskExists = await Task.findById(task);
        if (!taskExists) {
            return res.status(404).json({ message: "Task not found." });
        }

        // Check if user exists
        const userExists = await User.findById(user);
        if (!userExists) {
            return res.status(404).json({ message: "User not found." });
        }

        // Create assignment
        const assigned = new Assigned({ task, user });
        await assigned.save();

        res.status(201).json({
            message: "Task assigned successfully.",
            assigned
        });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};
const deleteAssigned = async (req, res) => {
    try {
        const assigned = await Assigned.findByIdAndDelete(req.params.id);
        if (!assigned) return res.status(404).json({ message: 'Assigned record not found' });
        res.json({ message: 'Assigned record deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAssigned, getAssignedById, createAssigned, deleteAssigned };
