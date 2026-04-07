const axios = require('axios');

const generateAllTasks = async () => {
  try {
    console.log('🔄 Генерирую 9 заданий через Yandex GPT...');
    
    const response = await axios.post(
      'https://llm.api.cloud.yandex.net/foundationModels/v1/completion',
      {
        modelUri: `gpt://${process.env.YANDEX_FOLDER_ID}/yandexgpt/latest`,
        completionOptions: {
          stream: false,
          temperature: 0.9,
          maxTokens: 800
        },
        messages: [
          {
            role: 'user',
            text: `Придумай 9 разных заданий для саморазвития (по одному на уровень с 1 по 9). 
Для каждого задания придумай КОРОТКОЕ НАЗВАНИЕ (2-4 слова) и само задание.

Формат ответа строго (пример):
1. Утренняя прогулка: погуляй в парке 30 минут
2. Час с книгой: прочитай 20 страниц
3. Творческий вечер: нарисуй пейзаж
... и так до 9.`
          }
        ]
      },
      {
        headers: {
          'Authorization': `Api-Key ${process.env.YANDEX_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const content = response.data.result.alternatives[0].message.text;
    console.log('✅ Ответ от Yandex GPT получен');
    console.log('📝 Ответ:', content);
    
    const tasks = [];
    const lines = content.split('\n');
    
    for (let i = 1; i <= 9; i++) {
      let title = getDefaultTitle(i);
      let task = getDefaultTask(i);
      
      for (const line of lines) {
        if (line.startsWith(`${i}.`) || line.startsWith(`${i})`)) {
          const text = line.substring(line.indexOf('.') + 1).trim();
          const parts = text.split(':');
          if (parts.length >= 2) {
            title = parts[0].trim();
            task = parts.slice(1).join(':').trim();
          } else {
            task = text;
          }
          break;
        }
      }
      
      tasks.push({ title, task });
    }
    
    console.log('✅ Задания сгенерированы');
    return tasks;
    
  } catch (error) {
    console.error('❌ Ошибка Yandex GPT:', error.response?.data || error.message);
    console.log('🔄 Использую задания по умолчанию');
    return getDefaultTasks();
  }
};

const getDefaultTitle = (level) => {
  const titles = {
    1: "Утренняя прогулка", 2: "Час с книгой", 3: "Творческий вечер",
    4: "Кулинарный эксперимент", 5: "Зарядка для тела", 6: "Звонок близким",
    7: "Прогулка на природе", 8: "Культурный выход", 9: "Планирование будущего"
  };
  return titles[level] || `Уровень ${level}`;
};

const getDefaultTask = (level) => {
  const tasks = {
    1: "погуляй в парке 30 минут", 2: "прочитай 20 страниц книги",
    3: "нарисуй пейзаж", 4: "приготовь новое блюдо",
    5: "сделай зарядку на 15 минут", 6: "позвони родственнику",
    7: "сходи на природу", 8: "посети музей или выставку",
    9: "напиши план на месяц"
  };
  return tasks[level] || tasks[1];
};

const getDefaultTasks = () => {
  return [
    { title: "Утренняя прогулка", task: "погуляй в парке 30 минут" },
    { title: "Час с книгой", task: "прочитай 20 страниц книги" },
    { title: "Творческий вечер", task: "нарисуй пейзаж" },
    { title: "Кулинарный эксперимент", task: "приготовь новое блюдо" },
    { title: "Зарядка для тела", task: "сделай зарядку на 15 минут" },
    { title: "Звонок близким", task: "позвони родственнику" },
    { title: "Прогулка на природе", task: "сходи на природу" },
    { title: "Культурный выход", task: "посети музей или выставку" },
    { title: "Планирование будущего", task: "напиши план на месяц" }
  ];
};

module.exports = { generateAllTasks };
