const pool = require('../config/db');

const createAchievementsTable = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS user_achievements (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      achievement_id VARCHAR(50) NOT NULL,
      earned_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, achievement_id)
    );
  `;
  try {
    await pool.query(queryText);
    console.log('✅ Таблица достижений создана');
  } catch (error) {
    console.error('❌ Ошибка создания таблицы достижений:', error);
  }
};

const awardAchievement = async (userId, achievementId) => {
  const queryText = `
    INSERT INTO user_achievements (user_id, achievement_id)
    VALUES ($1, $2)
    ON CONFLICT (user_id, achievement_id) DO NOTHING
    RETURNING *
  `;
  const values = [userId, achievementId];
  try {
    const res = await pool.query(queryText, values);
    return res.rows[0];
  } catch (error) {
    throw error;
  }
};

const getUserAchievements = async (userId) => {
  const queryText = 'SELECT achievement_id, earned_at FROM user_achievements WHERE user_id = $1';
  const values = [userId];
  try {
    const res = await pool.query(queryText, values);
    return res.rows;
  } catch (error) {
    throw error;
  }
};

module.exports = { createAchievementsTable, awardAchievement, getUserAchievements };