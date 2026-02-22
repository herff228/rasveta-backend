const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const goalRoutes = require('./routes/goalRoutes');
const levelRoutes = require('./routes/levelRoutes');
const { createUserTable } = require('./models/User');
const { createGoalTable } = require('./models/Goal');
const { createLevelTable } = require('./models/UserTasks');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Простой тестовый маршрут (чтобы проверить, работает ли сервер)
app.get('/', (req, res) => {
    res.json({ message: 'API работает!' });
});

// Маршруты
app.use('/api/auth', authRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/levels', levelRoutes);

// Создание таблиц при запуске (но не ждем ошибок)
Promise.all([
    createUserTable().catch(e => console.log('Таблица users уже существует')),
    createGoalTable().catch(e => console.log('Таблица goals уже существует')),
    createLevelTable().catch(e => console.log('Таблица уровней уже существует'))
]).then(() => {
    console.log('✅ Проверка таблиц завершена');
});

module.exports = app;
