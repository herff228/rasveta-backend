const pool = require('../config/db');

const createUserTable = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(100),
      emoji VARCHAR(10) DEFAULT '😊',
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
  const queryText = 'INSERT INTO users (email, password, name, emoji) VALUES ($1, $2, $3, $4) RETURNING id, email, name, emoji, created_at';
  const values = [email, hashedPassword, name, '😊'];
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
  const queryText = 'SELECT id, email, name, emoji, created_at FROM users WHERE id = $1';
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

module.exports = { createUserTable, createUser, findUserByEmail, findUserById, updateUserEmoji };