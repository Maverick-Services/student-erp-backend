const Requirement = require('../models/Requirement-model');

const getRequirements = async (req, res) => {
    try {
        const requirements = await Requirement.find().populate('task');
        res.json(requirements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getRequirementById = async (req, res) => {
    try {
        const requirement = await Requirement.findById(req.params.id).populate('task');
        if (!requirement) return res.status(404).json({ message: 'Requirement not found' });
        res.json(requirement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createRequirement = async (req, res) => {
    const { task, requirementDetail } = req.body;
    try {
        const requirement = new Requirement({ task, requirementDetail });
        await requirement.save();
        res.status(201).json(requirement);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateRequirement = async (req, res) => {
    try {
        const requirement = await Requirement.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!requirement) return res.status(404).json({ message: 'Requirement not found' });
        res.json(requirement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteRequirement = async (req, res) => {
    try {
        const requirement = await Requirement.findByIdAndDelete(req.params.id);
        if (!requirement) return res.status(404).json({ message: 'Requirement not found' });
        res.json({ message: 'Requirement deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getRequirements, getRequirementById, createRequirement, updateRequirement, deleteRequirement };
