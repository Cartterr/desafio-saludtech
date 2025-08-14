const OpenAI = require('openai');

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com'
});

const FALLBACK_ESTIMATES = ['30 minutos', '1 hora', '2 horas', '3-4 horas', '1 día', '2-3 días'];
const FALLBACK_TASKS = [
  {
    title: "Definir objetivos del proyecto",
    description: "Establecer metas claras y alcanzables",
    estimated_time: "1 hora",
    assigned_to: "",
    priority: "alta"
  },
  {
    title: "Investigar requisitos",
    description: "Recopilar información necesaria para el proyecto",
    estimated_time: "2-3 horas",
    assigned_to: "",
    priority: "alta"
  },
  {
    title: "Crear plan de trabajo",
    description: "Desarrollar cronograma y asignar recursos",
    estimated_time: "1-2 horas",
    assigned_to: "",
    priority: "media"
  }
];

async function callDeepSeek(messages, maxTokens = 50, temperature = 0.2) {
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error('API key not configured');
  }

  // Add timeout to prevent long delays
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('AI request timeout')), 10000); // 10 second timeout
  });

  const apiPromise = deepseek.chat.completions.create({
    model: 'deepseek-chat',
    messages,
    max_tokens: maxTokens,
    temperature
  });

  const response = await Promise.race([apiPromise, timeoutPromise]);
  return response.choices?.[0]?.message?.content?.trim();
}

async function estimateTaskTime(title, description) {
  // Quick fallback for common task patterns
  const quickEstimates = {
    'reunión': '1 hora',
    'meeting': '1 hora',
    'call': '30 minutos',
    'email': '15 minutos',
    'review': '30 minutos',
    'test': '2 horas',
    'bug': '1-2 horas',
    'fix': '1 hora'
  };

  const titleLower = title.toLowerCase();
  for (const [keyword, estimate] of Object.entries(quickEstimates)) {
    if (titleLower.includes(keyword)) {
      return estimate;
    }
  }

  try {
    const messages = [
      {
        role: 'system',
        content: 'Eres un experto en estimación de tiempos. Responde solo con tiempo como "2 horas", "1 día", etc.'
      },
      {
        role: 'user',
        content: `Tiempo para: ${title}${description ? ` - ${description}` : ''}`
      }
    ];

    const result = await callDeepSeek(messages, 30, 0.1); // Reduced tokens and temperature for faster response
    return result || '1-2 horas';
  } catch (error) {
    console.error('Error estimating time:', error);
    return FALLBACK_ESTIMATES[Math.floor(Math.random() * FALLBACK_ESTIMATES.length)];
  }
}

// Task generation removed - keeping only time estimation

module.exports = {
  estimateTaskTime
};