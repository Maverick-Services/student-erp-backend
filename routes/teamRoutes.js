const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authTeamMiddleware')

const { 
    getTeams, 
    getTeamById, 
    createTeam, 
    updateTeam, 
    deleteTeam, 
    getTeamMembers 
} = require('../controllers/teamController');


// router.get('/:id', getTeamById);
router.get('/', getTeams);
router.post('/getTeamById', getTeamById)
router.get('/getTeamMembers',authMiddleware,getTeamMembers)
router.post('/createTeam', authMiddleware ,createTeam);
router.put('/updateTeam', updateTeam);
router.delete('/deleteTeam', deleteTeam);

module.exports = router;
