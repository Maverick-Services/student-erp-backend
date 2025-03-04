const mongoose = require('mongoose');

const stepSchema = new mongoose.Schema({
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task', 
        required: true 
    },
    name: {
        type: String,
        required: true
     },
    description: {
         type: String
         },
    deadline: { 
        type: Date, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['completed', 'pending'],
        default: 'pending'
     },
     //refrence to Assigned model
     assignedTo: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Assigned' },
    // Reference to Requirement model
    // requirements: [{ 
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Requirement', 
    //     required: true }], 
}, { timestamps: true });

module.exports = mongoose.model('Step', stepSchema);
