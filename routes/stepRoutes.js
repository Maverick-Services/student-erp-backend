const express = require('express');
const { getSteps, getStepById, createStep, updateStep, deleteStep } = require('../controllers/stepController');

const router = express.Router();

router.get('/', getSteps);
router.get('/:id', getStepById);
router.post('/', createStep);
router.put('/:id', updateStep);
router.delete('/:id', deleteStep);

module.exports = router;
