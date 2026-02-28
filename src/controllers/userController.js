const pool = require('../config/db');
const { findUserById, updateUserEmoji, getUserStats } = require('../models/User');

// Получение данных текущего пользователя
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await findUserById(userId);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json(user);
  } catch (error) {
    console.error('Ошибка получения пользователя:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Обновление смайлика
const updateEmoji = async (req, res) => {
  try {
    const userId = req.user.id;
    const { emoji } = req.body;
    if (!emoji || emoji.length > 5) return res.status(400).json({ error: 'Некорректный смайлик' });
    const updatedUser = await updateUserEmoji(userId, emoji);
    res.json(updatedUser);
  } catch (error) {
    console.error('Ошибка обновления смайлика:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Получение статистики
const getUserStatsController = async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await getUserStats(userId);
    res.json(stats);
  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Удаление аккаунта пользователя
const deleteAccount = async (req, res) => {
  const client = await pool.connect();
  try {
    const userId = req.user.id;
    
    await client.query('BEGIN');
    
    // Удаляем связанные данные
    await client.query('DELETE FROM user_tasks WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM goals WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM users WHERE id = $1', [userId]);
    
    await client.query('COMMIT');
    
    res.json({ message: 'Аккаунт успешно удалён' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Ошибка удаления аккаунта:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  } finally {
    client.release();
  }
};

module.exports = { getCurrentUser, updateEmoji, getUserStatsController, deleteAccount };