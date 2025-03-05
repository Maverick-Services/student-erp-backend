const Step = require('../models/Step-model');
const mongoose = require('mongoose');
const getSteps = async (req, res) => {
    try {
        const steps = await Step.find().populate('requirements'); // Populate requirements
        res.status(200).json(steps);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};
const getStepById = async (req, res) => {
    try {
        const step = await Step.findById(req.body.id).populate('requirements'); // Corrected population
        if (!step) return res.status(404).json({ message: 'Step not found' });
        res.status(200).json(step);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


const createStep = async (req, res) => {
    try {
        const { name, description, assignedTo,deadline, status, requirements } = req.body;


        // Check if required fields are provided
        // if (!name || !deadline || !requirements || !Array.isArray(requirements) || requirements.length === 0) {
        //     return res.status(400).json({ message: "Missing required fields: name, deadline, and at least one requirement." });
        // }

        // Validate MongoDB ObjectId for requirements
        for (const reqId of requirements) {
            if (!mongoose.Types.ObjectId.isValid(reqId)) {
                return res.status(400).json({ message: `Invalid Requirement ID: ${reqId}` });
            }
        }

        // Create and save the new step
        const step = new Step({ name, description, assignedTo,deadline, status, requirements });
        await step.save();

        res.status(201).json({ message: "Step created successfully", step });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

const updateStep = async (req, res) => {
    try {
        // Check if the request body contains required fields
        const { name, description, deadline, assignedTo,status, requirements } = req.body;

        // if (!name || !deadline || !Array.isArray(requirements) || requirements.length === 0) {
        //     return res.status(400).json({ 
        //         message: "Missing required fields: name, deadline, and at least one requirement." 
        //     });
        // }

        // Update the step and return the updated document
        const step = await Step.findByIdAndUpdate(
            req.body.id, 
            { name, description, deadline, assignedTo,status, requirements }, 
            { new: true }
        ).populate('requirements'); // Populate requirements

        if (!step) return res.status(404).json({ message: 'Step not found' });

        res.status(200).json(step);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


const deleteStep = async (req, res) => {
    try {
        const step = await Step.findByIdAndDelete(req.body.id);
        if (!step) return res.status(404).json({ message: 'Step not found' });
        res.json({ message: 'Step deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getSteps, getStepById, createStep, updateStep, deleteStep };
