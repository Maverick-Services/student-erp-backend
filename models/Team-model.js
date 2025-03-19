const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    teamLeader: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
    }, // References User model
    teamName: { 
        type: String, 
    },
    userName:{
        type:String,
    },
    password: { 
        type: String
    },
    description: { 
        type: String 
    },
    members: [{
         type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
         }], // Array of User IDs
    memberHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MemberHistory'
    }],
    tasks: [{
         type: mongoose.Schema.Types.ObjectId,
          ref: 'Task'
         }] // Array of Task IDs
}, { timestamps: true });

module.exports = mongoose.model('Team', teamSchema);

// admin email - email can see but password should be bcrypt
// userId:
// password: