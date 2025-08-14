const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./models/database');
const tasksRouter = require('./routes/tasks');
const taskListsRouter = require('./routes/taskLists');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/tasks', tasksRouter);
app.use('/api/task-lists', taskListsRouter);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});


