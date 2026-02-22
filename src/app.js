const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const goalRoutes = require('./routes/goalRoutes');
const levelRoutes = require('./routes/levelRoutes');
const { createUserTable } = require('./models/User');
const { createGoalTable } = require('./models/Goal');
const { createUserTasksTable } = require('./models/UserTasks');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Раздаем статические файлы из папки public
app.use(express.static(path.join(__dirname, '../public')));

// Маршруты API
app.use('/api/auth', authRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/levels', levelRoutes);

// Для всех остальных запросов отдаем index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Создание таблиц
createUserTable();
createGoalTable();
createUserTasksTable();

module.exports = app;