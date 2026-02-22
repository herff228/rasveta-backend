const express = require('express');
const { getTaskForLevel, completeLevelTask } = require('../controllers/levelController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

// Получить задание для конкретного уровня
router.get('/:level/task', getTaskForLevel);

// Отметить выполнение уровня
router.post('/:level/complete', completeLevelTask);

module.exports = router;