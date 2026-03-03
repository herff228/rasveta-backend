const { getUserTasks, completeTask, resetAllTasks } = require('../models/UserTasks');
const { findUserById, incrementLifetimeCompleted, incrementGameCycles } = require('../models/User');
const { generateAllTasks } = require('../services/aiService');
const { awardAchievement } = require('../models/Achievement');
const pool = require('../config/db');

// Получение задания для конкретного уровня
const getTaskForLevel = async (req, res) => {
  try {
    const userId = req.user.id;
    const { level } = req.params;
    
    const userTasks = await getUserTasks(userId);
    
    if (!userTasks) {
      return res.status(404).json({ error: 'Задания не найдены' });
    }
    
    const titleField = `level_${level}_title`;
    const taskField = `level_${level}_task`;
    const completedField = `level_${level}_completed`;
    
    res.json({
      level: parseInt(level),
      title: userTasks[titleField],
      task: userTasks[taskField],
      completed: userTasks[completedField]
    });
    
  } catch (error) {
    console.error('Ошибка в getTaskForLevel:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Отметка выполнения задания (с вечной статистикой и достижениями)
const completeLevelTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { level } = req.params;

    const userTasks = await getUserTasks(userId);
    if (!userTasks) {
      return res.status(404).json({ error: 'Задания не найдены' });
    }

    // Проверяем, не выполнено ли уже задание
    if (userTasks[`level_${level}_completed`]) {
      return res.status(400).json({ error: 'Задание уже выполнено' });
    }

    // Отмечаем задание выполненным
    const updated = await completeTask(userId, level);

    // УВЕЛИЧИВАЕМ СЧЁТЧИК ВЫПОЛНЕННЫХ ЗАДАНИЙ (lifetime)
    await incrementLifetimeCompleted(userId);

    // ПОЛУЧАЕМ АКТУАЛЬНЫЕ ДАННЫЕ ПОЛЬЗОВАТЕЛЯ
    const user = await findUserById(userId);

    // ПОЛУЧАЕМ АКТУАЛЬНЫЙ ПРОГРЕСС ПО ЛОКАЦИЯМ
    const forestProgress = [1,2,3].filter(lvl => updated[`level_${lvl}_completed`]).length;
    const hillsProgress = [4,5,6].filter(lvl => updated[`level_${lvl}_completed`]).length;
    const beachProgress = [7,8,9].filter(lvl => updated[`level_${lvl}_completed`]).length;
    const totalCompleted = forestProgress + hillsProgress + beachProgress;

    // ПРОВЕРЯЕМ И ВЫДАЕМ ДОСТИЖЕНИЯ
    const achievements = [];

    // Лес
    if (forestProgress === 3) achievements.push('forest');
    // Холмы
    if (hillsProgress === 3) achievements.push('hills');
    // Пляж
    if (beachProgress === 3) achievements.push('beach');
    // Первый шаг
    if (totalCompleted >= 1) achievements.push('first_step');
    // На полпути
    if (totalCompleted >= 5) achievements.push('half_way');
    // Мастер (все 9 заданий)
    if (totalCompleted === 9) achievements.push('master');
    
    // Ветеран (50 заданий) - проверяем при каждом выполнении
    if (user.lifetime_completed >= 50) {
      achievements.push('veteran');
    }

    // Сохраняем все полученные достижения
    for (const ach of achievements) {
      await awardAchievement(userId, ach);
    }

    // Проверяем, не выполнены ли все 9 заданий
    const allCompleted = [1,2,3,4,5,6,7,8,9].every(lvl => updated[`level_${lvl}_completed`]);

    let gameCompleted = false;
    if (allCompleted) {
      // УВЕЛИЧИВАЕМ СЧЁТЧИК ПРОЙДЕННЫХ ИГР
      await incrementGameCycles(userId);
      gameCompleted = true;
      
      // ПОЛУЧАЕМ ОБНОВЛЕННЫЕ ДАННЫЕ ПОЛЬЗОВАТЕЛЯ
      const updatedUser = await findUserById(userId);
      
      // Исследователь (3 игры)
      if (updatedUser.game_cycles >= 3) {
        await awardAchievement(userId, 'explorer');
      }
      
      // Легенда (5 игр)
      if (updatedUser.game_cycles >= 5) {
        await awardAchievement(userId, 'legend');
      }
    }

    res.json({
      message: `Задание уровня ${level} выполнено!`,
      level: parseInt(level),
      completed: true,
      gameCompleted
    });
    
  } catch (error) {
    console.error('Ошибка в completeLevelTask:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Перезапуск игры (новые задания)
const restartGame = async (req, res) => {
  try {
    const userId = req.user.id;

    // Генерируем новые 9 заданий
    const newTasks = await generateAllTasks();

    // Сбрасываем задания в базе
    await resetAllTasks(userId, newTasks);

    res.json({
      message: 'Игра перезапущена! Новые задания сгенерированы.',
      success: true
    });
    
  } catch (error) {
    console.error('Ошибка при перезапуске игры:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Получение истории всех заданий (все циклы)
const getAllTasksHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Получаем все выполненные задания из таблицы completed_tasks
    const queryText = `
      SELECT level, task, completed_at 
      FROM completed_tasks 
      WHERE user_id = $1 
      ORDER BY completed_at DESC
    `;
    const values = [userId];
    const result = await pool.query(queryText, values);
    
    // Получаем текущие задания из user_tasks
    const currentTasks = await getUserTasks(userId);
    
    res.json({
      history: result.rows,
      current: currentTasks
    });
  } catch (error) {
    console.error('Ошибка получения истории:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

module.exports = { 
  getTaskForLevel, 
  completeLevelTask, 
  restartGame,
  getAllTasksHistory
};