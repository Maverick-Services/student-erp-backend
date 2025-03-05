const Step = require('../models/Step-model');
const Task = require('../models/Task-model');
const mongoose = require('mongoose');
const getSteps = async (req, res) => {
    try {
        // const steps = await Step.find().populate('requirements'); // Populate requirements
        const steps = await Step.find();
        res.status(200).json({
            success:true,
            data:steps
        });
    } catch (error) {
        res.status(500).json({ 
            success:false,
            message: "Internal Server Error", 
            error: error.message });
    }
};
const getStepById = async (req, res) => {
    try {
        // const step = await Step.findById(req.body.id).populate('requirements'); // Corrected population
        const step = await Step.findById(req.body.stepId);
        if (!step) return res.status(404).json({
            success:false,
             message: 'Step not found'
             });
        res.status(200).json({
            success:true,
            data:step
        });
    } catch (error) {
        res.status(500).json({ 
            success:false,
            message: "Internal Server Error", 
            error: error.message });
    }
};


const createStep = async (req, res) => {
    try {
        const {taskId, name, description, assignedTo, status } = req.body;


        // Check if required fields are provided
        if (!taskId || !name || !description || !assignedTo || !status) {
            return res.status(400).json({ 
                success: false,
                message: "Fill Complete Details" 
            });
        }

        // Validate MongoDB ObjectId for requirements
        // for (const reqId of requirements) {
        //     if (!mongoose.Types.ObjectId.isValid(reqId)) {
        //         return res.status(400).json({ message: `Invalid Requirement ID: ${reqId}` });
        //     }
        // }

        // Create and save the new step
        const step = await Step.create({ taskId, name, description, assignedTo, status });
        
        //push step id in team steps array in task
        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            {
                $push:{
                    steps: step?._id
                }
            },
            {new:true}
        )
        .populate('steps').exec();
        // console.log(updatedTask)

        res.status(201).json({ 
            success:true,
            message: "Step created successfully", 
            data:updatedTask 
        });
    } catch (error) {
        res.status(500).json({ 
            success:false,
            message: "Internal Server Error", 
            error: error.message 
        });
    }
};

const updateStep = async (req, res) => {
    try {
        // Check if the request body contains required fields
        const { name, description, assignedTo, status } = req.body;

        // if (!name || !deadline || !Array.isArray(requirements) || requirements.length === 0) {
        //     return res.status(400).json({ 
        //         message: "Missing required fields: name, deadline, and at least one requirement." 
        //     });
        // }

        // Update the step and return the updated document
        const step = await Step.findByIdAndUpdate(
            req.body.stepId, 
            { name, description, assignedTo, status }, 
            { new: true }
        ); // Populate requirements

        if (!step) return res.status(404).json({ 
            success:false,
            message: 'Step not found' });

        res.status(200).json({
            success:true,
            data:step});
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


const deleteStep = async (req, res) => {
    try {
        const step = await Step.findByIdAndDelete(req.body.id);
        if (!step) return res.status(404).json({ 
            success:false,
            message: 'Step not found' });
        res.json({ 
            success:true,
            message: 'Step deleted successfully' });
    } catch (error) {
        res.status(500).json({ 
            success:false,
            message: error.message });
    }
};

module.exports = { getSteps, getStepById, createStep, updateStep, deleteStep };
