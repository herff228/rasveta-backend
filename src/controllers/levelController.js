const { getUserTasks, completeTask, resetAllTasks } = require('../models/UserTasks');
const { findUserById, incrementLifetimeCompleted, incrementGameCycles } = require('../models/User');
const { generateAllTasks } = require('../services/aiService');

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

// Отметка выполнения задания (с вечной статистикой)
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

    // Отмечаем задание выполненным
    const updated = await completeTask(userId, level);

    // 👇 УВЕЛИЧИВАЕМ СЧЁТЧИК ВЫПОЛНЕННЫХ ЗАДАНИЙ (lifetime)
    await incrementLifetimeCompleted(userId);

    // Проверяем, не выполнены ли все 9 заданий
    const allCompleted = [1,2,3,4,5,6,7,8,9].every(lvl => updated[`level_${lvl}_completed`]);

    let gameCompleted = false;
    if (allCompleted) {
      // 👇 УВЕЛИЧИВАЕМ СЧЁТЧИК ПРОЙДЕННЫХ ИГР
      await incrementGameCycles(userId);
      gameCompleted = true;
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

module.exports = { getTaskForLevel, completeLevelTask, restartGame };