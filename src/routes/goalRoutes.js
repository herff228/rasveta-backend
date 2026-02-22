const express = require('express');
const { createGoalHandler, getGoalsHandler, updateProgressHandler } = require('../controllers/goalController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authMiddleware); // все маршруты ниже требуют авторизации

router.post('/', createGoalHandler);
router.get('/', getGoalsHandler);
router.patch('/:id/progress', updateProgressHandler);

module.exports = router;