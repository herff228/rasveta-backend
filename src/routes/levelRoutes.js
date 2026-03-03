const express = require('express');
const { 
  getTaskForLevel, 
  completeLevelTask, 
  restartGame,
  getAllTasksHistory,
  getAllTasks 
} = require('../controllers/levelController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

router.get('/all', getAllTasks);              // ПОЛУЧИТЬ ВСЕ ЗАДАНИЯ СРАЗУ
router.get('/:level/task', getTaskForLevel);  // ПОЛУЧИТЬ ОДНО ЗАДАНИЕ
router.post('/:level/complete', completeLevelTask); // ВЫПОЛНИТЬ ЗАДАНИЕ
router.post('/restart', restartGame);          // ПЕРЕЗАПУСТИТЬ ИГРУ
router.get('/history/all', getAllTasksHistory); // ИСТОРИЯ ВСЕХ ЗАДАНИЙ

module.exports = router;