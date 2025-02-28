const Task = require('../models/Task-model');

const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find().populate('assignedTo team requirement');
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate('assignedTo team requirement');
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createTask = async (req, res) => {
    const { taskName, description, assignedTo, team, status, requirement } = req.body;
    try {
        const task = new Task({ taskName, description, assignedTo, team, status, requirement });
        await task.save();
        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask };
