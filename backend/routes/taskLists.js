const express = require('express');
const router = express.Router();
const db = require('../models/database');
// AI task generation removed
const { validateRequired, sendSuccess, sendError, sendNotFound } = require('../utils/responseHelper');

router.get('/', (req, res) => {
  db.all('SELECT * FROM task_lists ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM task_lists WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Lista no encontrada' });
      return;
    }
    res.json(row);
  });
});

router.post('/', (req, res) => {
  const { title, description, created_by } = req.body;
  if (!title || !title.trim()) {
    res.status(400).json({ error: 'Título requerido' });
    return;
  }

  db.run(
    'INSERT INTO task_lists (title, description, created_by) VALUES (?, ?, ?)',
    [title.trim(), description || '', created_by || 'Usuario'],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        id: this.lastID,
        title: title.trim(),
        description: description || '',
        created_by: created_by || 'Usuario',
        created_at: new Date().toISOString()
      });
    }
  );
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  if (!title || !title.trim()) {
    res.status(400).json({ error: 'Título requerido' });
    return;
  }

  db.run(
    'UPDATE task_lists SET title = ?, description = ? WHERE id = ?',
    [title.trim(), description || '', id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Lista actualizada' });
    }
  );
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  if (id === '1') {
    res.status(400).json({ error: 'No se puede eliminar la lista principal' });
    return;
  }

  db.run('DELETE FROM task_lists WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Lista eliminada' });
  });
});

// AI task generation route removed - keeping only time estimation in task creation

module.exports = router;
