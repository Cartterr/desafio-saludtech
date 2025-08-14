const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS task_lists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    created_by TEXT DEFAULT 'Sistema',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to TEXT,
    due_date TEXT,
    completed INTEGER DEFAULT 0,
    estimated_time TEXT,
    notes TEXT,
    created_by TEXT DEFAULT 'Sistema',
    list_id INTEGER DEFAULT 1,
    attachments TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (list_id) REFERENCES task_lists (id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    avatar_color TEXT DEFAULT '#4ade80'
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    photo_url TEXT,
    mentions TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
  )`);

  db.run(`INSERT OR IGNORE INTO task_lists (id, title, description) VALUES (1, 'Lista Principal', 'Lista de tareas por defecto')`, (err) => {
    if (err) {
      console.error('Error creating default task list:', err);
    }
  });

  db.run(`ALTER TABLE tasks ADD COLUMN created_by TEXT DEFAULT 'Sistema'`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding created_by column:', err);
    }
  });

  db.run(`ALTER TABLE tasks ADD COLUMN list_id INTEGER DEFAULT 1`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding list_id column:', err);
    }
  });

  db.run(`ALTER TABLE tasks ADD COLUMN attachments TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding attachments column:', err);
    }
  });

  db.run(`ALTER TABLE tasks ADD COLUMN priority TEXT DEFAULT 'media'`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding priority column:', err);
    }
  });
});

module.exports = db;


