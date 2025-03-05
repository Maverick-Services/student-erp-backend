const express = require('express');
const { getSteps, getStepById, createStep, updateStep, deleteStep } = require('../controllers/stepController');
const authMiddleware = require('../middleware/authTeamMiddleware');

const router = express.Router();

router.get('/', getSteps);
// router.get('/:id', getStepById);
router.post("/getStepById",getStepById)
router.post('/createStep', authMiddleware, createStep);
router.put('/updateStep', authMiddleware, updateStep);
router.delete('/deleteStep', authMiddleware, deleteStep);

module.exports = router;
