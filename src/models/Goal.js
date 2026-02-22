const pool = require('../config/db');

const createGoalTable = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS goals (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(100),
      smart_criteria JSONB,
      deadline DATE,
      priority VARCHAR(20) DEFAULT 'medium',
      status VARCHAR(20) DEFAULT 'active',
      progress INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;
  try {
    await pool.query(queryText);
    console.log('✅ Таблица goals создана');
  } catch (error) {
    console.error('❌ Ошибка создания таблицы goals:', error);
  }
};

const createGoal = async (userId, goalData) => {
  const { title, description, category, smart_criteria, deadline, priority } = goalData;
  const queryText = `
    INSERT INTO goals (user_id, title, description, category, smart_criteria, deadline, priority)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  const values = [userId, title, description, category, smart_criteria, deadline, priority];
  try {
    const res = await pool.query(queryText, values);
    return res.rows[0];
  } catch (error) {
    throw error;
  }
};

const getGoalsByUser = async (userId) => {
  const queryText = 'SELECT * FROM goals WHERE user_id = $1 ORDER BY created_at DESC';
  const values = [userId];
  try {
    const res = await pool.query(queryText, values);
    return res.rows;
  } catch (error) {
    throw error;
  }
};

const updateGoalProgress = async (goalId, progress) => {
  const queryText = 'UPDATE goals SET progress = $1 WHERE id = $2 RETURNING *';
  const values = [progress, goalId];
  try {
    const res = await pool.query(queryText, values);
    return res.rows[0];
  } catch (error) {
    throw error;
  }
};

module.exports = { createGoalTable, createGoal, getGoalsByUser, updateGoalProgress };