const express = require('express');
const { getAssigned, getAssignedById, createAssigned, deleteAssigned } = require('../controllers/assignedController');

const router = express.Router();

router.get('/', getAssigned);
router.get('/:id', getAssignedById);
router.post('/', createAssigned);
router.delete('/:id', deleteAssigned);

module.exports = router;
