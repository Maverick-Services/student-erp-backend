const express = require('express');
const router = express.Router();
const authTeamMiddleware = require('../middleware/authTeamMiddleware')
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');

const { 
    getTeams, 
    getTeamById, 
    createTeam, 
    updateTeam, 
    deleteTeam, 
    getTeamMembers 
} = require('../controllers/teamController');


// router.get('/:id', getTeamById);
router.get('/getTeams', authMiddleware, isAdmin, getTeams);
router.post('/getTeamById', authMiddleware, isAdmin, getTeamById)
router.get('/getTeamMembers',authTeamMiddleware,getTeamMembers)
router.post('/createTeam', authMiddleware, isAdmin, createTeam);
router.put('/updateTeam', authMiddleware, isAdmin, updateTeam);
router.delete('/deleteTeam', authMiddleware, isAdmin, deleteTeam);

module.exports = router;
