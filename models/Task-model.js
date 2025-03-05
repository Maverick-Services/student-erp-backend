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
    // assignedTo: [{ 
    //     type: mongoose.Schema.Types.ObjectId, 
    //     ref: 'Assigned' }], // Array of Assigned IDs
    steps: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Step' 
    }], // Array of Step IDs
    team: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Team' 
    }, // Array of Step IDs
    clientName: { 
        type: String,
        required: true 
    },
    deadline: { 
        type: String,
        required: true
    },
    status: { 
        type: String, 
        enum: ['Completed', 'Pending'],
        default: 'Pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
