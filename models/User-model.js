const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { 
        type: String,
        required: true
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        enum: ['admin', 'employee'],
        default: 'employee'
     },
    // References Team model
    team: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Team' 
    }, 
    // References User model (Team Leader)
    teamLeader: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' 
    }, 
    // Array of Task IDs
    tasks: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task' 
    }] 
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
