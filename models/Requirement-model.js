const mongoose = require('mongoose');

const requirementSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['completed', 'pending'],
        default: 'pending'
     },
    responsibleParty: { 
        type: String, 
        required: true 
    },
    // Reference to Step model
    step: { 
        type: mongoose.Schema.Types.ObjectId,
         ref: 'Step', required: true 
        }, 
}, { timestamps: true });

module.exports = mongoose.model('Requirement', requirementSchema);










