const express = require('express');
const { getCurrentUser, updateEmoji, getUserStatsController, deleteAccount } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

router.get('/me', getCurrentUser);
router.put('/emoji', updateEmoji);
router.get('/stats', getUserStatsController);
router.delete('/me', deleteAccount);  // 👈 ЭТО НОВЫЙ МАРШРУТ

module.exports = router;