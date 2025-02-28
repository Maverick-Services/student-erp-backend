const express = require('express');
const { getRequirements, getRequirementById, createRequirement, updateRequirement, deleteRequirement } = require('../controllers/requirementController');

const router = express.Router();

router.get('/', getRequirements);
router.get('/:id', getRequirementById);
router.post('/', createRequirement);
router.put('/:id', updateRequirement);
router.delete('/:id', deleteRequirement);

module.exports = router;
