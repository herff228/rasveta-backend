const pool = require('../config/db');

const createUserTable = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;
  try {
    await pool.query(queryText);
    console.log('✅ Таблица users создана');
  } catch (error) {
    console.error('❌ Ошибка создания таблицы', error);
  }
};

const createUser = async (email, hashedPassword, name) => {
  const queryText = 'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at';
  const values = [email, hashedPassword, name];
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

module.exports = { createUserTable, createUser, findUserByEmail };