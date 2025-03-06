const Step = require('../models/Step-model');
const Task = require('../models/Task-model');
const mongoose = require('mongoose');
const User = require('../models/User-model')
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


// const createStep = async (req, res) => {
//     try {
//         const {taskId, name, description, assignedTo, status } = req.body;


//         // Check if required fields are provided
//         if (!taskId || !name || !description || !assignedTo || !status) {
//             return res.status(400).json({ 
//                 success: false,
//                 message: "Fill Complete Details" 
//             });
//         }

//         // Validate MongoDB ObjectId for requirements
//         // for (const reqId of requirements) {
//         //     if (!mongoose.Types.ObjectId.isValid(reqId)) {
//         //         return res.status(400).json({ message: `Invalid Requirement ID: ${reqId}` });
//         //     }
//         // }

//         // Create and save the new step
//         const step = await Step.create({ taskId, name, description, assignedTo, status });
        
//         //push step id in team steps array in task
//         const updatedTask = await Task.findByIdAndUpdate(
//             taskId,
//             {
//                 $push:{
//                     steps: step?._id
//                 }
//             },
//             {new:true}
//         )
//         .populate('steps').exec();
//         // console.log(updatedTask)

//         res.status(201).json({ 
//             success:true,
//             message: "Step created successfully", 
//             data:updatedTask 
//         });
//     } catch (error) {
//         res.status(500).json({ 
//             success:false,
//             message: "Internal Server Error", 
//             error: error.message 
//         });
//     }
// };

// const updateStep = async (req, res) => {
//     try {
//         // Check if the request body contains required fields
//         const { name, description, assignedTo, status } = req.body;

//         // if (!name || !deadline || !Array.isArray(requirements) || requirements.length === 0) {
//         //     return res.status(400).json({ 
//         //         message: "Missing required fields: name, deadline, and at least one requirement." 
//         //     });
//         // }

//         // Update the step and return the updated document
//         const step = await Step.findByIdAndUpdate(
//             req.body.stepId, 
//             { name, description, assignedTo, status }, 
//             { new: true }
//         ); 

//         if (!step) return res.status(404).json({ 
//             success:false,
//             message: 'Step not found' });

//         res.status(200).json({
//             success:true,
//             data:step});
//     } catch (error) {
//         res.status(500).json({ message: "Internal Server Error", error: error.message });
//     }
// };

// const createStep = async (req, res) => {
//     try {
//         const { taskId, name, description, deadline, status, assignedTo } = req.body;

//         // Create a new step
//         const step = new Step({ taskId, name, description, deadline, status, assignedTo });
//         await step.save();

//         // If a user is assigned, update their task list
//         if (assignedTo) {
//             await User.findByIdAndUpdate(
//                 assignedTo,
//                 { $addToSet: { tasks: taskId } }, // Add task if not already present
//                 { new: true }
//             );
//         }

//         res.status(201).json({
//             success: true,
//             message: "Step created successfully",
//             data: step,
//         });
//     } catch (error) {
//         console.error("Error creating step:", error);
//         res.status(500).json({
//             success: false,
//             message: "Internal Server Error",
//         });
//     }
// };

// const updateStep = async (req, res) => {
//     try {
//         const { id, taskId, name, description, deadline, status, assignedTo } = req.body;

//         const step = await Step.findById(id);
//         if (!step) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Step not found",
//             });
//         }

//         // Track the previous assigned user
//         const previousAssignedTo = step.assignedTo;

//         // Update step details
//         step.taskId = taskId || step.taskId;
//         step.name = name || step.name;
//         step.description = description || step.description;
//         step.deadline = deadline || step.deadline;
//         step.status = status || step.status;
//         step.assignedTo = assignedTo || step.assignedTo;

//         await step.save();

//         // If the assigned user has changed, update their tasks
//         if (assignedTo && assignedTo !== previousAssignedTo) {
//             await User.findByIdAndUpdate(
//                 assignedTo,
//                 { $addToSet: { tasks: taskId } },
//                 { new: true }
//             );

//             if (previousAssignedTo) {
//                 await User.findByIdAndUpdate(
//                     previousAssignedTo,
//                     { $pull: { tasks: taskId } }, // Remove task from previous user's list
//                     { new: true }
//                 );
//             }
//         }

//         res.status(200).json({
//             success: true,
//             message: "Step updated successfully",
//             data: step,
//         });
//     } catch (error) {
//         console.error("Error updating step:", error);
//         res.status(500).json({
//             success: false,
//             message: "Internal Server Error",
//         });
//     }
// };

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
        await User.findByIdAndUpdate(
            assignedTo,
            { $addToSet: { tasks: taskId } }, // Ensure taskId is not duplicated
            { new: true }
        );

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
        const step = await Step.findById(stepId);
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
            await User.findByIdAndUpdate(
                assignedTo,
                { $addToSet: { tasks: taskId } }, // Ensure task is added
                { new: true }
            );

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
