const express = require('express');
const { getTeams, getTeamById, createTeam, updateTeam, deleteTeam } = require('../controllers/teamController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', getTeams);
router.get('/:id', getTeamById);
router.post('/', authMiddleware ,createTeam);
router.put('/:id', updateTeam);
router.delete('/:id', deleteTeam);

module.exports = router;
