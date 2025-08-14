const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: __dirname + '/.env' });
const db = require('./models/database');
const { seedDatabase } = require('./seed');
const tasksRouter = require('./routes/tasks');
const taskListsRouter = require('./routes/taskLists');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/tasks', tasksRouter);
app.use('/api/task-lists', taskListsRouter);

const frontendBuildPath = path.join(__dirname, '../frontend/build');
if (require('fs').existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));

  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendBuildPath, 'index.html'));
    }
  });
}

async function startServer() {
  try {
    await seedDatabase();
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
      console.log(`DEEPSEEK_API_KEY configured: ${process.env.DEEPSEEK_API_KEY ? 'Yes' : 'No'}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

startServer();


