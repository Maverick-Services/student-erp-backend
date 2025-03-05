const Requirement = require('../models/Requirement-model');
const mongoose = require('mongoose');
const getRequirements = async (req, res) => {
    try {
        const requirements = await Requirement.find().populate('step'); // Corrected field
        res.json(requirements);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


const getRequirementById = async (req, res) => {
    try {
        // Validate ObjectId
        // if (!mongoose.Types.ObjectId.isValid(req.body.id)) {
        //     return res.status(400).json({ message: "Invalid requirement ID." });
        // }

        // Fetch the requirement and populate the related step
        const requirement = await Requirement.findById(req.body.id).populate('step');

        if (!requirement) {
            return res.status(404).json({ message: 'Requirement not found' });
        }

        res.json(requirement);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


const createRequirement = async (req, res) => {
    try {
        const { name, responsibleParty, step, status } = req.body;

        // Validate required fields
        // if (!name || !responsibleParty || !step) {
        //     return res.status(400).json({ 
        //         message: "Missing required fields: name, responsibleParty, and step." 
        //     });
        // }

        // Check if step is a valid ObjectId
        // if (!mongoose.Types.ObjectId.isValid(step)) {
        //     return res.status(400).json({ message: "Invalid step ID." });
        // }

        // Create and save the requirement
        const requirement = new Requirement({ 
            name, 
            responsibleParty, 
            step, 
            status: status || 'Pending' 
        });

        await requirement.save();
        res.status(201).json(requirement);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

const updateRequirement = async (req, res) => {
    try {
        // Validate ObjectId before querying the database
        // if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        //     return res.status(400).json({ message: "Invalid requirement ID." });
        // }

        // Ensure request body is not empty
        // if (Object.keys(req.body).length === 0) {
        //     return res.status(400).json({ message: "Update data is required." });
        // }

        // Find and update the requirement
        const requirement = await Requirement.findByIdAndUpdate(req.body.id, req.body, { 
            new: true, 
            runValidators: true // Ensures validation rules are checked
        });

        if (!requirement) {
            return res.status(404).json({ message: 'Requirement not found' });
        }

        res.json({ message: "Requirement updated successfully", requirement });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


const deleteRequirement = async (req, res) => {
    try {
        const requirement = await Requirement.findByIdAndDelete(req.body.id);
        if (!requirement) return res.status(404).json({ message: 'Requirement not found' });
        res.json({ message: 'Requirement deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getRequirements, getRequirementById, createRequirement, updateRequirement, deleteRequirement };
