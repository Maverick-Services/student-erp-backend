const Assigned = require('../models/Assigned-model');

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
        const assigned = await Assigned.findById(req.params.id).populate('task user');
        if (!assigned) return res.status(404).json({ message: 'Assigned record not found' });
        res.json(assigned);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createAssigned = async (req, res) => {
    const { task, user } = req.body;
    try {
        const assigned = new Assigned({ task, user });
        await assigned.save();
        res.status(201).json(assigned);
    } catch (error) {
        res.status(400).json({ message: error.message });
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
