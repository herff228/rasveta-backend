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

// Отметка выполнения задания
const completeLevelTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { level } = req.params;

    // Получаем данные пользователя (is_admin)
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Получаем текущие задания
    const userTasks = await getUserTasks(userId);
    if (!userTasks) {
      return res.status(404).json({ error: 'Задания не найдены' });
    }

    // Проверяем, не выполнено ли уже это задание
    if (userTasks[`level_${level}_completed`]) {
      return res.status(400).json({ error: 'Задание уже выполнено' });
    }

    // Проверка задержки 12 часов (для обычных пользователей)
    if (!user.is_admin) {
      const lastCompleted = userTasks.last_completed_at;
      if (lastCompleted) {
        const now = new Date();
        const last = new Date(lastCompleted);
        const hoursDiff = (now - last) / (1000 * 60 * 60); // разница в часах
        if (hoursDiff < 12) {
          const hoursLeft = 12 - hoursDiff;
          const minutesLeft = Math.ceil((hoursLeft % 1) * 60);
          const wholeHours = Math.floor(hoursLeft);
          return res.status(429).json({
            error: `Следующее задание можно будет выполнить через ${wholeHours} ч ${minutesLeft} мин`
          });
        }
      }
    }

    // Отмечаем задание выполненным
    const updated = await completeTask(userId, level);

    // Увеличиваем счётчик выполненных заданий (lifetime)
    await incrementLifetimeCompleted(userId);

    // Проверяем, не выполнены ли все 9 заданий
    const allCompleted = [1,2,3,4,5,6,7,8,9].every(lvl => updated[`level_${lvl}_completed`]);

    let gameCompleted = false;
    if (allCompleted) {
      // Увеличиваем счётчик пройденных игр
      await incrementGameCycles(userId);
      gameCompleted = true;
    }

    res.json({
      message: `Задание уровня ${level} выполнено!`,
      level: parseInt(level),
      completed: true,
      gameCompleted,
      nextAvailableIn: user.is_admin ? null : 12 * 60 * 60 * 1000 // 12 часов в мс
    });
    
  } catch (error) {
    console.error('Ошибка в completeLevelTask:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Перезапуск игры (новые задания для всех уровней)
const restartGame = async (req, res) => {
  try {
    const userId = req.user.id;

    // Генерируем новые 9 заданий
    const newTasks = await generateAllTasks();

    // Сбрасываем задания в базе
    const updated = await resetAllTasks(userId, newTasks);

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