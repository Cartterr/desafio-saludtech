const db = require('./models/database');

const defaultLists = [
  {
    name: 'Tareas Pendientes',
    description: 'Lista principal de tareas pendientes'
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

const specificTasks = [
  {
    title: 'Definir objetivos del proyecto',
    description: 'Establecer metas claras y alcanzables para el proyecto',
    estimated_time: '1 hora',
    priority: 'alta',
    list_id: 1,
    completed: 0,
    assigned_to: '',
    due_date: null
  },
  {
    title: 'Investigar requisitos',
    description: 'Recopilar información necesaria para el desarrollo del proyecto',
    estimated_time: '2-3 horas',
    priority: 'alta',
    list_id: 1,
    completed: 0,
    assigned_to: '',
    due_date: null
  },
  {
    title: 'Crear plan de trabajo',
    description: 'Desarrollar cronograma detallado y asignar recursos',
    estimated_time: '1-2 horas',
    priority: 'media',
    list_id: 1,
    completed: 0,
    assigned_to: '',
    due_date: null
  },
  {
    title: 'Seguimiento a los contratos para firmar pendientes en Mis Abogados',
    description: 'Revisar y dar seguimiento a contratos pendientes de firma',
    estimated_time: '2-3 horas',
    priority: 'alta',
    list_id: 1,
    completed: 0,
    assigned_to: 'CD',
    due_date: '2024-08-19'
  },
  {
    title: 'Consultar con los contadores el caso de Capcut (reportado por Emilio)',
    description: 'Revisar situación financiera y contable del caso Capcut',
    estimated_time: '1 hora',
    priority: 'alta',
    list_id: 1,
    completed: 0,
    assigned_to: 'CD',
    due_date: '2024-08-17'
  },
  {
    title: 'Calendario de cumpleaños normales y laborales en Saludtech',
    description: 'Crear y organizar calendario de cumpleaños del equipo',
    estimated_time: '30 minutos',
    priority: 'media',
    list_id: 1,
    completed: 0,
    assigned_to: '',
    due_date: '2024-08-24'
  },
  {
    title: 'Consultar cierre financiero a Katherine',
    description: 'Revisar estado del cierre financiero mensual',
    estimated_time: '45 minutos',
    priority: 'media',
    list_id: 1,
    completed: 0,
    assigned_to: '',
    due_date: '2024-08-18'
  },
  {
    title: 'Hacer Matches en Clay',
    description: 'Realizar matching de datos en la plataforma Clay',
    estimated_time: '1 hora',
    priority: 'media',
    list_id: 1,
    completed: 1,
    assigned_to: 'CD',
    due_date: null
  },
  {
    title: 'Cotizar Duemint/Toku/Bemmbo para la cobranza de medecly y B2B',
    description: 'Solicitar cotizaciones para servicios de cobranza',
    estimated_time: '2 horas',
    priority: 'alta',
    list_id: 1,
    completed: 1,
    assigned_to: '',
    due_date: null
  },
  {
    title: 'Subir información de transacciones a Cardda',
    description: 'Cargar datos de transacciones en el sistema Cardda',
    estimated_time: '1.5 horas',
    priority: 'media',
    list_id: 1,
    completed: 1,
    assigned_to: 'CD',
    due_date: null
  }
];

function seedDatabase() {
  return new Promise((resolve, reject) => {
    console.log('Checking database and ensuring specific tasks exist...');

    db.serialize(() => {
      db.get("SELECT COUNT(*) as count FROM task_lists", [], (err, row) => {
        if (err) {
          console.error('Error checking task_lists:', err);
          return reject(err);
        }

        if (row.count === 0) {
          console.log('Creating default task lists...');
          const insertList = db.prepare("INSERT INTO task_lists (name, description) VALUES (?, ?)");
          defaultLists.forEach(list => {
            insertList.run(list.name, list.description);
          });
          insertList.finalize();
        }

        checkAndCreateSpecificTasks()
          .then(() => resolve())
          .catch(reject);
      });
    });
  });
}

function checkAndCreateSpecificTasks() {
  return new Promise((resolve, reject) => {
    console.log('Checking for specific tasks...');

    const checkTask = db.prepare("SELECT id, completed FROM tasks WHERE title = ? LIMIT 1");
    const insertTask = db.prepare(`INSERT INTO tasks (title, description, estimated_time, priority, list_id, completed, assigned_to, due_date)
                                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    const updateTask = db.prepare("UPDATE tasks SET completed = ?, assigned_to = ?, due_date = ?, description = ?, estimated_time = ?, priority = ? WHERE id = ?");

    let tasksProcessed = 0;
    let tasksCreated = 0;
    let tasksUpdated = 0;

    specificTasks.forEach((task, index) => {
      checkTask.get(task.title, (err, existingTask) => {
        if (err) {
          console.error(`Error checking task "${task.title}":`, err);
          return;
        }

        if (!existingTask) {
          insertTask.run(
            task.title,
            task.description,
            task.estimated_time,
            task.priority,
            task.list_id,
            task.completed,
            task.assigned_to,
            task.due_date
          );
          console.log(`✓ Created task: "${task.title}"`);
          tasksCreated++;
        } else {
          updateTask.run(
            task.completed,
            task.assigned_to,
            task.due_date,
            task.description,
            task.estimated_time,
            task.priority,
            existingTask.id
          );
          console.log(`✓ Updated task: "${task.title}" (completed: ${task.completed ? 'Yes' : 'No'})`);
          tasksUpdated++;
        }

        tasksProcessed++;
        if (tasksProcessed === specificTasks.length) {
          checkTask.finalize();
          insertTask.finalize();
          updateTask.finalize();

          console.log(`Database sync complete: ${tasksCreated} created, ${tasksUpdated} updated`);
          resolve();
        }
      });
    });
  });
}

module.exports = { seedDatabase };
