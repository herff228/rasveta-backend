const { getUserTasks, completeTask, resetAllTasks } = require('../models/UserTasks');
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

    const userTasks = await getUserTasks(userId);
    if (!userTasks) {
      return res.status(404).json({ error: 'Задания не найдены' });
    }

    if (userTasks[`level_${level}_completed`]) {
      return res.status(400).json({ error: 'Задание уже выполнено' });
    }

    const updated = await completeTask(userId, level);

    const allCompleted = [1,2,3,4,5,6,7,8,9].every(lvl => updated[`level_${lvl}_completed`]);

    res.json({
      message: `Задание уровня ${level} выполнено!`,
      level: parseInt(level),
      completed: true,
      gameCompleted: allCompleted
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

module.exports = { getTaskForLevel, completeLevelTask, restartGame };