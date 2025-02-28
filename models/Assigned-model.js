const mongoose = require('mongoose');

const assignedSchema = new mongoose.Schema({
    task: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Task', 
        required: true 
    }, // References Task model
    user: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }, // References User model
    assignedDate: {
         type: Date, 
         default: Date.now 
        } // Default to current date
}, { timestamps: true });

module.exports = mongoose.model('Assigned', assignedSchema);
