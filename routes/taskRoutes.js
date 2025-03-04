const express = require('express');
const { getTasks, getTaskById, createTask, updateTask, deleteTask } = require('../controllers/taskController');

const router = express.Router();

router.get('/', getTasks);
// router.get('/:id', getTaskById);
router.post("/getTaskById",getTaskById)
router.post('/', createTask);
router.put('/updateTask', updateTask);
router.delete('/deleteTask', deleteTask);

module.exports = router;
