const express = require('express');
const { getSteps, getStepById, createStep, updateStep, deleteStep } = require('../controllers/stepController');

const router = express.Router();

router.get('/', getSteps);
// router.get('/:id', getStepById);
router.post("/getStepById",getStepById)
router.post('/createStep', createStep);
router.put('/updateStep', updateStep);
router.delete('/deleteStep', deleteStep);

module.exports = router;
