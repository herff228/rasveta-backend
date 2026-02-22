const { getUserTasks, completeTask } = require('../models/UserTasks');

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
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

const completeLevelTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { level } = req.params;
    
    const updated = await completeTask(userId, level);
    
    res.json({
      message: `Задание уровня ${level} выполнено!`,
      level: parseInt(level),
      completed: true
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

module.exports = { getTaskForLevel, completeLevelTask };