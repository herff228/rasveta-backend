const pool = require('../config/db');

const createUserTable = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(100),
      emoji VARCHAR(10) DEFAULT '😊',
      is_admin BOOLEAN DEFAULT FALSE,
      lifetime_completed INTEGER DEFAULT 0,
      game_cycles INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;
  try {
    await pool.query(queryText);
    console.log('✅ Таблица users создана или уже существует');
  } catch (error) {
    console.error('❌ Ошибка создания таблицы', error);
  }
};

const createUser = async (email, hashedPassword, name) => {
  const queryText = `
    INSERT INTO users (email, password, name, emoji, is_admin, lifetime_completed, game_cycles)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, email, name, emoji, is_admin, lifetime_completed, game_cycles, created_at
  `;
  const values = [email, hashedPassword, name, '😊', false, 0, 0];
  try {
    const res = await pool.query(queryText, values);
    return res.rows[0];
  } catch (error) {
    throw error;
  }
};

const findUserByEmail = async (email) => {
  const queryText = 'SELECT * FROM users WHERE email = $1';
  const values = [email];
  try {
    const res = await pool.query(queryText, values);
    return res.rows[0];
  } catch (error) {
    throw error;
  }
};

const findUserById = async (id) => {
  const queryText = 'SELECT id, email, name, emoji, is_admin, lifetime_completed, game_cycles, created_at FROM users WHERE id = $1';
  const values = [id];
  try {
    const res = await pool.query(queryText, values);
    return res.rows[0];
  } catch (error) {
    throw error;
  }
};

const updateUserEmoji = async (id, emoji) => {
  const queryText = 'UPDATE users SET emoji = $1 WHERE id = $2 RETURNING id, email, name, emoji';
  const values = [emoji, id];
  try {
    const res = await pool.query(queryText, values);
    return res.rows[0];
  } catch (error) {
    throw error;
  }
};

// 👇 ФУНКЦИИ ДЛЯ СТАТИСТИКИ
const incrementLifetimeCompleted = async (id) => {
  const queryText = `
    UPDATE users
    SET lifetime_completed = lifetime_completed + 1
    WHERE id = $1
    RETURNING lifetime_completed, game_cycles
  `;
  const values = [id];
  try {
    const res = await pool.query(queryText, values);
    return res.rows[0];
  } catch (error) {
    throw error;
  }
};

const incrementGameCycles = async (id) => {
  const queryText = `
    UPDATE users
    SET game_cycles = game_cycles + 1
    WHERE id = $1
    RETURNING game_cycles
  `;
  const values = [id];
  try {
    const res = await pool.query(queryText, values);
    return res.rows[0];
  } catch (error) {
    throw error;
  }
};

const getUserStats = async (id) => {
  const queryText = 'SELECT lifetime_completed, game_cycles FROM users WHERE id = $1';
  const values = [id];
  try {
    const res = await pool.query(queryText, values);
    return res.rows[0];
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createUserTable,
  createUser,
  findUserByEmail,
  findUserById,
  updateUserEmoji,
  incrementLifetimeCompleted,
  incrementGameCycles,
  getUserStats  // 👈 ЭТО ОДИН РАЗ
};