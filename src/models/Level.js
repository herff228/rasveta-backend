const pool = require('../config/db');

const createLevelTable = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS user_levels (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      level INTEGER DEFAULT 1,
      completed_tasks INTEGER DEFAULT 0,
      tasks_for_level INTEGER DEFAULT 3,
      current_task TEXT,
      task_generated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id)
    );
    
    CREATE TABLE IF NOT EXISTS completed_tasks (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      level INTEGER,
      task TEXT,
      completed_at TIMESTAMP DEFAULT NOW()
    );
  `;
  try {
    await pool.query(queryText);
    console.log('✅ Таблицы уровней созданы');
  } catch (error) {
    console.error('❌ Ошибка создания таблиц уровней:', error);
  }
};

const getUserLevel = async (userId) => {
  const queryText = 'SELECT * FROM user_levels WHERE user_id = $1';
  const values = [userId];
  try {
    const res = await pool.query(queryText, values);
    if (res.rows.length === 0) {
      // Создаем запись для нового пользователя
      const insertQuery = 'INSERT INTO user_levels (user_id) VALUES ($1) RETURNING *';
      const insertRes = await pool.query(insertQuery, [userId]);
      return insertRes.rows[0];
    }
    return res.rows[0];
  } catch (error) {
    throw error;
  }
};

const updateTask = async (userId, newTask) => {
  const queryText = 'UPDATE user_levels SET current_task = $1, task_generated_at = NOW() WHERE user_id = $2 RETURNING *';
  const values = [newTask, userId];
  try {
    const res = await pool.query(queryText, values);
    return res.rows[0];
  } catch (error) {
    throw error;
  }
};

const completeTask = async (userId, level, task) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Добавляем в историю выполненных
    await client.query(
      'INSERT INTO completed_tasks (user_id, level, task) VALUES ($1, $2, $3)',
      [userId, level, task]
    );
    
    // Обновляем счетчик выполненных заданий
    const updateRes = await client.query(
      `UPDATE user_levels 
       SET completed_tasks = completed_tasks + 1 
       WHERE user_id = $1 
       RETURNING completed_tasks, tasks_for_level, level`,
      [userId]
    );
    
    const { completed_tasks, tasks_for_level, level: currentLevel } = updateRes.rows[0];
    
    let levelUp = false;
    // Если выполнил все задания на уровне - повышаем уровень
    if (completed_tasks >= tasks_for_level) {
      await client.query(
        'UPDATE user_levels SET level = level + 1, completed_tasks = 0 WHERE user_id = $1',
        [userId]
      );
      levelUp = true;
    }
    
    await client.query('COMMIT');
    
    const finalRes = await client.query('SELECT * FROM user_levels WHERE user_id = $1', [userId]);
    return { ...finalRes.rows[0], levelUp };
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { createLevelTable, getUserLevel, updateTask, completeTask };