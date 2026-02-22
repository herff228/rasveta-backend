const app = require('./src/app');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

try {
  app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
  });
} catch (error) {
  console.log('❌ ОШИБКА:', error.message);
}