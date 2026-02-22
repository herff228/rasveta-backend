const pool = require('../config/db');

const createUserTasksTable = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS user_tasks (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      
      level_1_title TEXT,
      level_1_task TEXT,
      level_2_title TEXT,
      level_2_task TEXT,
      level_3_title TEXT,
      level_3_task TEXT,
      level_4_title TEXT,
      level_4_task TEXT,
      level_5_title TEXT,
      level_5_task TEXT,
      level_6_title TEXT,
      level_6_task TEXT,
      level_7_title TEXT,
      level_7_task TEXT,
      level_8_title TEXT,
      level_8_task TEXT,
      level_9_title TEXT,
      level_9_task TEXT,
      
      level_1_completed BOOLEAN DEFAULT FALSE,
      level_2_completed BOOLEAN DEFAULT FALSE,
      level_3_completed BOOLEAN DEFAULT FALSE,
      level_4_completed BOOLEAN DEFAULT FALSE,
      level_5_completed BOOLEAN DEFAULT FALSE,
      level_6_completed BOOLEAN DEFAULT FALSE,
      level_7_completed BOOLEAN DEFAULT FALSE,
      level_8_completed BOOLEAN DEFAULT FALSE,
      level_9_completed BOOLEAN DEFAULT FALSE,
      
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id)
    );
  `;
  try {
    await pool.query(queryText);
    console.log('✅ Таблица заданий с названиями создана');
  } catch (error) {
    console.error('❌ Ошибка создания таблицы заданий:', error);
  }
};

const saveUserTasks = async (userId, tasks) => {
  const queryText = `
    INSERT INTO user_tasks (
      user_id,
      level_1_title, level_1_task,
      level_2_title, level_2_task,
      level_3_title, level_3_task,
      level_4_title, level_4_task,
      level_5_title, level_5_task,
      level_6_title, level_6_task,
      level_7_title, level_7_task,
      level_8_title, level_8_task,
      level_9_title, level_9_task
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
    ON CONFLICT (user_id) 
    DO UPDATE SET
      level_1_title = EXCLUDED.level_1_title,
      level_1_task = EXCLUDED.level_1_task,
      level_2_title = EXCLUDED.level_2_title,
      level_2_task = EXCLUDED.level_2_task,
      level_3_title = EXCLUDED.level_3_title,
      level_3_task = EXCLUDED.level_3_task,
      level_4_title = EXCLUDED.level_4_title,
      level_4_task = EXCLUDED.level_4_task,
      level_5_title = EXCLUDED.level_5_title,
      level_5_task = EXCLUDED.level_5_task,
      level_6_title = EXCLUDED.level_6_title,
      level_6_task = EXCLUDED.level_6_task,
      level_7_title = EXCLUDED.level_7_title,
      level_7_task = EXCLUDED.level_7_task,
      level_8_title = EXCLUDED.level_8_title,
      level_8_task = EXCLUDED.level_8_task,
      level_9_title = EXCLUDED.level_9_title,
      level_9_task = EXCLUDED.level_9_task,
      
      level_1_completed = FALSE,
      level_2_completed = FALSE,
      level_3_completed = FALSE,
      level_4_completed = FALSE,
      level_5_completed = FALSE,
      level_6_completed = FALSE,
      level_7_completed = FALSE,
      level_8_completed = FALSE,
      level_9_completed = FALSE
    RETURNING *;
  `;
  
  const values = [
    userId,
    tasks[0].title, tasks[0].task,
    tasks[1].title, tasks[1].task,
    tasks[2].title, tasks[2].task,
    tasks[3].title, tasks[3].task,
    tasks[4].title, tasks[4].task,
    tasks[5].title, tasks[5].task,
    tasks[6].title, tasks[6].task,
    tasks[7].title, tasks[7].task,
    tasks[8].title, tasks[8].task
  ];
  
  try {
    const res = await pool.query(queryText, values);
    return res.rows[0];
  } catch (error) {
    throw error;
  }
};

const getUserTasks = async (userId) => {
  const queryText = 'SELECT * FROM user_tasks WHERE user_id = $1';
  const values = [userId];
  try {
    const res = await pool.query(queryText, values);
    return res.rows[0];
  } catch (error) {
    throw error;
  }
};

const completeTask = async (userId, level) => {
  const queryText = `UPDATE user_tasks SET level_${level}_completed = TRUE WHERE user_id = $1 RETURNING *`;
  const values = [userId];
  try {
    const res = await pool.query(queryText, values);
    return res.rows[0];
  } catch (error) {
    throw error;
  }
};

module.exports = { createUserTasksTable, saveUserTasks, getUserTasks, completeTask };