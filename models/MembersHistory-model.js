const mongoose = require('mongoose');

const memberHistorySchema = new mongoose.Schema({
    team: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Team', 
        required: true 
    }, // References Task model
    user: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }, // References User model
    date: {
        type: Date, 
        default: Date.now 
    }, // Default to current date
    status:{
        type: String,
        enum: ['joined','left'],
        default: 'joined'
    }
}, { timestamps: true });

module.exports = mongoose.model('MemberHistory', memberHistorySchema);
