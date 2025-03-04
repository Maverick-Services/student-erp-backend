const express = require('express');
const { getTeams, getTeamById, createTeam, updateTeam, deleteTeam } = require('../controllers/teamController');
const authMiddleware = require('../middleware/authTeamMiddleware')
const router = express.Router();

router.get('/', getTeams);
// router.get('/:id', getTeamById);
router.post('/getTeamById', getTeamById)
router.post('/createTeam', authMiddleware ,createTeam);
router.put('/updateTeam', updateTeam);
router.delete('/deleteTeam', deleteTeam);

module.exports = router;
