const Step = require('../models/Step-model');
const Task = require('../models/Task-model');
const mongoose = require('mongoose');
const User = require('../models/User-model');
const mailSender = require('../utils/mailSender');
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
        const { taskId, name, description, assignedTo, status } = req.body;

        // Check if required fields are provided
        if (!taskId || !name || !description || !assignedTo || !status) {
            return res.status(400).json({
                success: false,
                message: "Fill Complete Details"
            });
        }

        // Create and save the new step
        const step = await Step.create({ taskId, name, description, assignedTo, status });

        // Push step ID into the task's steps array
        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            { $push: { steps: step._id } },
            { new: true }
        ).populate('steps').exec();

        // Update the assigned user's tasks array with the Task ID
        const updatedUser = await User.findByIdAndUpdate(
            assignedTo,
            { $addToSet: { tasks: taskId } }, // Ensure taskId is not duplicated
            { new: true }
        );

        await mailSender(updatedUser?.email,'New Task Assigned',`Hi ${updatedUser?.name},\nA new Task has been assigned to you in ${updatedTask?.name}. You are assigned ${step?.name} step.\n\nBest regards,\n ${updatedTask?.team} Team`)

        res.status(201).json({
            success: true,
            message: "Step created successfully",
            data: updatedTask
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

const updateStep = async (req, res) => {
    try {
        const { stepId, name, description, assignedTo, status } = req.body;

        // Find the existing step
        const step = await Step.findById(stepId)
        .populate('taskId');
        if (!step) {
            return res.status(404).json({
                success: false,
                message: "Step not found"
            });
        }

        const previousAssignedTo = step.assignedTo;
        const taskId = step.taskId; // Get the taskId from step

        // Update step details
        step.name = name || step.name;
        step.description = description || step.description;
        step.status = status || step.status;
        step.assignedTo = assignedTo || step.assignedTo;

        await step.save();

        // If assigned user changed
        if (assignedTo && assignedTo.toString() !== previousAssignedTo?.toString()) {
            // Add task to new assigned user
            const updatedUser = await User.findByIdAndUpdate(
                assignedTo,
                { $addToSet: { tasks: taskId } }, // Ensure task is added
                { new: true }
            ).populate('team');

            // console.log("here",updatedUser);
            const mailResponse = await mailSender(updatedUser?.email,'New Task Assigned',`Hi ${updatedUser?.name},\n\nA new Task has been assigned to you in ${step?.taskId?.name}. You are assigned ${step?.name} step.\n\nBest regards,\n ${updatedUser?.team?.teamName} Team`);
            // console.log("mail",mailResponse);

            // Remove task from previous user **only if no other step in that task is assigned to them**
            if (previousAssignedTo) {
                const otherStepsForUser = await Step.find({
                    taskId: taskId,
                    assignedTo: previousAssignedTo
                });

                if (otherStepsForUser.length === 0) { // If no other step for that task exists
                    await User.findByIdAndUpdate(
                        previousAssignedTo,
                        { $pull: { tasks: taskId } }, // Remove task only if it's the last step assigned to them
                        { new: true }
                    );
                }
            }
        }

        res.status(200).json({
            success: true,
            message: "Step updated successfully",
            data: step
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
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
