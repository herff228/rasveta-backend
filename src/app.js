const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const goalRoutes = require('./routes/goalRoutes');
const levelRoutes = require('./routes/levelRoutes');
const userRoutes = require('./routes/userRoutes'); // <-- новый импорт
const { createUserTable } = require('./models/User');
const { createGoalTable } = require('./models/Goal');
const { createUserTasksTable } = require('./models/UserTasks');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Тестовый маршрут
app.get('/', (req, res) => {
    res.json({ message: 'API работает!' });
});

// Маршруты
app.use('/api/auth', authRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/levels', levelRoutes);
app.use('/api/users', userRoutes); // <-- новый маршрут

// Создание таблиц
Promise.all([
    createUserTable().catch(err => console.log('Таблица users уже существует')),
    createGoalTable().catch(err => console.log('Таблица goals уже существует')),
    createUserTasksTable().catch(err => console.log('Таблица уровней уже существует'))
]).then(() => {
    console.log('✅ Проверка таблиц завершена');
});

module.exports = app;