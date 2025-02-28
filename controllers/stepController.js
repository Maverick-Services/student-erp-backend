const Step = require('../models/Step-model');

const getSteps = async (req, res) => {
    try {
        const steps = await Step.find().populate('task');
        res.json(steps);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getStepById = async (req, res) => {
    try {
        const step = await Step.findById(req.params.id).populate('task');
        if (!step) return res.status(404).json({ message: 'Step not found' });
        res.json(step);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createStep = async (req, res) => {
    const { task, description, status } = req.body;
    try {
        const step = new Step({ task, description, status });
        await step.save();
        res.status(201).json(step);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateStep = async (req, res) => {
    try {
        const step = await Step.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!step) return res.status(404).json({ message: 'Step not found' });
        res.json(step);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteStep = async (req, res) => {
    try {
        const step = await Step.findByIdAndDelete(req.params.id);
        if (!step) return res.status(404).json({ message: 'Step not found' });
        res.json({ message: 'Step deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getSteps, getStepById, createStep, updateStep, deleteStep };
