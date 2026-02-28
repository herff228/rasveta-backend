const express = require('express');
const { getTaskForLevel, completeLevelTask, restartGame } = require('../controllers/levelController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

router.get('/:level/task', getTaskForLevel);
router.post('/:level/complete', completeLevelTask);
router.post('/restart', restartGame);

module.exports = router;