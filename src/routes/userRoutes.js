const express = require('express');
const { getCurrentUser, updateEmoji } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Все маршруты защищены
router.use(authMiddleware);

router.get('/me', getCurrentUser);
router.put('/emoji', updateEmoji);

module.exports = router;