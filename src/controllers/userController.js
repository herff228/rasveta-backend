const { findUserById, updateUserEmoji } = require('../models/User');

const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await findUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Ошибка получения пользователя:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

const updateEmoji = async (req, res) => {
  try {
    const userId = req.user.id;
    const { emoji } = req.body;
    
    if (!emoji || emoji.length > 5) {
      return res.status(400).json({ error: 'Некорректный смайлик' });
    }
    
    const updatedUser = await updateUserEmoji(userId, emoji);
    res.json(updatedUser);
  } catch (error) {
    console.error('Ошибка обновления смайлика:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

module.exports = { getCurrentUser, updateEmoji };