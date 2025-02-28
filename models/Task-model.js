const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String 
    },
    createdAt: { 
        type: Date,
        default: Date.now 
    }, // Default to current date
    assignedTo: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Assigned' }], // Array of Assigned IDs
    steps: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Step' 
    }], // Array of Step IDs
    clientName: { 
        type: String,
        required: true 
    },
    deadline: { 
        type: Date,
        required: true
    },
    status: { 
        type: String, 
        enum: ['completed', 'pending'],
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
