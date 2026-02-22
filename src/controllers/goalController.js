const { createGoal, getGoalsByUser, updateGoalProgress } = require('../models/Goal');

const createGoalHandler = async (req, res) => {
  try {
    const userId = req.user.id; // из токена
    const goalData = req.body;
    
    const newGoal = await createGoal(userId, goalData);
    res.status(201).json(newGoal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при создании цели' });
  }
};

const getGoalsHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const goals = await getGoalsByUser(userId);
    res.json(goals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при получении целей' });
  }
};

const updateProgressHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { progress } = req.body;
    
    const updatedGoal = await updateGoalProgress(id, progress);
    res.json(updatedGoal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при обновлении прогресса' });
  }
};

module.exports = { createGoalHandler, getGoalsHandler, updateProgressHandler };