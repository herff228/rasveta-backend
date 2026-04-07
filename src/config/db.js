const { Pool } = require('pg');
require('dotenv').config();

// Поддержка как DATABASE_URL, так и отдельных переменных
const pool = new Pool(
  process.env.DATABASE_URL 
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false
        }
      }
    : {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        ssl: {
          rejectUnauthorized: false
        }
      }
);

pool.on('connect', () => {
  console.log('✅ База данных подключена!');
});

pool.on('error', (err) => {
  console.error('❌ Ошибка базы данных:', err);
});

module.exports = pool;
