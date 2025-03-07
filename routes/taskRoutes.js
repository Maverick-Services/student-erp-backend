const express = require('express');
const { getTasks, getTaskById, createTask, updateTask, deleteTask } = require('../controllers/taskController');

const authMiddleware = require("../middleware/authTeamMiddleware")
const router = express.Router();

router.get('/',authMiddleware, getTasks);
// router.get('/:id', getTaskById);
router.post("/getTaskById",getTaskById)
router.post('/createTask', authMiddleware,createTask);
router.put('/updateTask',updateTask);
router.delete('/deleteTask', authMiddleware,deleteTask);
module.exports = router;
