const { getUserTasks, completeTask, resetAllTasks } = require('../models/UserTasks');
const { findUserById, incrementLifetimeCompleted, incrementGameCycles } = require('../models/User');
const { generateAllTasks } = require('../services/aiService');
const { awardAchievement } = require('../models/Achievement');
const pool = require('../config/db');

// ПОЛУЧИТЬ ВСЕ ЗАДАНИЯ СРАЗУ (НОВЫЙ МЕТОД)
const getAllTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const userTasks = await getUserTasks(userId);
    
    if (!userTasks) {
      return res.status(404).json({ error: 'Задания не найдены' });
    }

    const tasks = [];
    for (let level = 1; level <= 9; level++) {
      tasks.push({
        level: level,
        title: userTasks[`level_${level}_title`] || `Уровень ${level}`,
        task: userTasks[`level_${level}_task`] || 'Описание отсутствует',
        completed: userTasks[`level_${level}_completed`] || false
      });
    }

    res.json(tasks);
    
  } catch (error) {
    console.error('Ошибка в getAllTasks:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Получение задания для конкретного уровня
const getTaskForLevel = async (req, res) => {
  try {
    const userId = req.user.id;
    const { level } = req.params;

    const user = await findUserById(userId);
    const userTasks = await getUserTasks(userId);
    
    if (!userTasks) {
      return res.status(404).json({ error: 'Задания не найдены' });
    }

    const titleField = `level_${level}_title`;
    const taskField = `level_${level}_task`;
    const completedField = `level_${level}_completed`;

    // СНАЧАЛА ПРОВЕРЯЕМ, ВЫПОЛНЕНО ЛИ ЗАДАНИЕ
    if (userTasks[completedField]) {
      return res.json({
        level: parseInt(level),
        title: userTasks[titleField],
        task: userTasks[taskField],
        completed: true
      });
    }

    // ТОЛЬКО ПОТОМ ПРОВЕРЯЕМ ТАЙМЕР (12 ЧАСОВ), ЕСЛИ НЕ АДМИН
    if (!user.is_admin) {
      const lastCompletedAt = userTasks.last_completed_at;

      if (lastCompletedAt) {
        const now = new Date();
        const last = new Date(lastCompletedAt);
        const hoursDiff = (now - last) / (1000 * 60 * 60);

        if (hoursDiff < 12) {
          const remaining = 12 - hoursDiff;
          const hours = Math.floor(remaining);
          const minutes = Math.floor((remaining - hours) * 60);

          return res.status(403).json({
            error: 'timeout',
            message: `Следующее задание будет доступно через ${hours} ч ${minutes} мин`,
            remainingHours: hours,
            remainingMinutes: minutes
          });
        }
      }
    }

    // ЕСЛИ ВСЁ ОК — ОТДАЁМ ЗАДАНИЕ
    res.json({
      level: parseInt(level),
      title: userTasks[titleField],
      task: userTasks[taskField],
      completed: false
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

    if (userTasks[`level_${level}_completed`]) {
      return res.status(400).json({ error: 'Задание уже выполнено' });
    }

    const updated = await completeTask(userId, level);

    await incrementLifetimeCompleted(userId);

    const user = await findUserById(userId);

    const forestProgress = [1,2,3].filter(lvl => updated[`level_${lvl}_completed`]).length;
    const hillsProgress = [4,5,6].filter(lvl => updated[`level_${lvl}_completed`]).length;
    const beachProgress = [7,8,9].filter(lvl => updated[`level_${lvl}_completed`]).length;
    const totalCompleted = forestProgress + hillsProgress + beachProgress;

    const achievements = [];

    if (forestProgress === 3) achievements.push('forest');
    if (hillsProgress === 3) achievements.push('hills');
    if (beachProgress === 3) achievements.push('beach');
    if (totalCompleted >= 1) achievements.push('first_step');
    if (totalCompleted >= 5) achievements.push('half_way');
    if (totalCompleted === 9) achievements.push('master');
    
    if (user.lifetime_completed >= 50) {
      achievements.push('veteran');
    }

    for (const ach of achievements) {
      await awardAchievement(userId, ach);
    }

    const allCompleted = [1,2,3,4,5,6,7,8,9].every(lvl => updated[`level_${lvl}_completed`]);

    let gameCompleted = false;
    if (allCompleted) {
      await incrementGameCycles(userId);
      gameCompleted = true;
      
      const updatedUser = await findUserById(userId);
      
      if (updatedUser.game_cycles >= 3) {
        await awardAchievement(userId, 'explorer');
      }
      
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

    const newTasks = await generateAllTasks();

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
    
    const queryText = `
      SELECT level, task, completed_at 
      FROM completed_tasks 
      WHERE user_id = $1 
      ORDER BY completed_at DESC
    `;
    const values = [userId];
    const result = await pool.query(queryText, values);
    
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
  getAllTasksHistory,
  getAllTasks
};