const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createUser, findUserByEmail } = require('../models/User');
const { saveUserTasks } = require('../models/UserTasks');
const { generateAllTasks } = require('../services/aiService');
require('dotenv').config();

const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email уже используется' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await createUser(email, hashedPassword, name);
    
    // Генерируем задания для всех уровней
    const tasks = await generateAllTasks();
    await saveUserTasks(newUser.id, tasks);

    const payload = { user: { id: newUser.id, email: newUser.email } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      message: 'Регистрация успешна!',
      token: token,
      user: newUser
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ error: 'Неверный email или пароль' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Неверный email или пароль' });
    }

    const payload = { user: { id: user.id, email: user.email } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({
      message: 'Вход выполнен успешно!',
      token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

module.exports = { register, login };