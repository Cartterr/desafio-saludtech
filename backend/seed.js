const db = require('./models/database');

const defaultLists = [
  {
    name: 'Proyecto Personal',
    description: 'Lista de tareas para proyectos personales'
  },
  {
    name: 'Trabajo',
    description: 'Tareas relacionadas con el trabajo'
  },
  {
    name: 'Casa',
    description: 'Tareas del hogar y mantenimiento'
  }
];

const defaultTasks = [
  {
    title: 'Configurar entorno de desarrollo',
    description: 'Instalar herramientas y configurar workspace',
    estimated_time: '2 horas',
    priority: 'alta',
    list_id: 1
  },
  {
    title: 'Revisar emails pendientes',
    description: 'Responder correos importantes del día',
    estimated_time: '30 minutos',
    priority: 'media',
    list_id: 2
  },
  {
    title: 'Limpiar escritorio',
    description: 'Organizar documentos y limpiar superficie',
    estimated_time: '15 minutos',
    priority: 'baja',
    list_id: 3
  },
  {
    title: 'Planificar sprint',
    description: 'Definir objetivos y tareas para el próximo sprint',
    estimated_time: '1 hora',
    priority: 'alta',
    list_id: 2
  }
];

function seedDatabase() {
  return new Promise((resolve, reject) => {
    db.get("SELECT COUNT(*) as count FROM task_lists", [], (err, row) => {
      if (err) {
        console.error('Error checking database:', err);
        return reject(err);
      }

      if (row.count === 0) {
        console.log('Seeding database with default data...');

        const insertList = db.prepare("INSERT INTO task_lists (name, description) VALUES (?, ?)");
        const insertTask = db.prepare("INSERT INTO tasks (title, description, estimated_time, priority, list_id, completed) VALUES (?, ?, ?, ?, ?, 0)");

        db.serialize(() => {
          defaultLists.forEach(list => {
            insertList.run(list.name, list.description);
          });

          defaultTasks.forEach(task => {
            insertTask.run(task.title, task.description, task.estimated_time, task.priority, task.list_id);
          });

          insertList.finalize();
          insertTask.finalize();

          console.log('Database seeded successfully!');
          resolve();
        });
      } else {
        console.log('Database already has data, skipping seed.');
        resolve();
      }
    });
  });
}

module.exports = { seedDatabase };
