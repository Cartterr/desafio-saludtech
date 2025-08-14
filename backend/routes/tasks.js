const express = require('express');
const router = express.Router();
const db = require('../models/database');
const { estimateTaskTime } = require('../utils/aiService');
const { validateRequired, sendSuccess, sendError, sendNotFound } = require('../utils/responseHelper');

router.get('/', (req, res) => {
  const { list_id } = req.query;
  let query = 'SELECT * FROM tasks';
  let params = [];

  if (list_id) {
    query += ' WHERE list_id = ?';
    params.push(list_id);
  }

  query += ' ORDER BY created_at DESC';

  db.all(query, params, (err, rows) => {
    if (err) return sendError(res, err);

    const tasks = rows.map(row => ({
      ...row,
      attachments: row.attachments ? JSON.parse(row.attachments) : []
    }));

    sendSuccess(res, tasks);
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
    if (err) {
      return sendError(res, err);
    }
    if (!row) {
      return sendNotFound(res, 'Tarea');
    }

    // Parse attachments if they exist
    let attachments = [];
    if (row.attachments) {
      try {
        attachments = JSON.parse(row.attachments);
      } catch (e) {
        console.error('Error parsing attachments for task', id, ':', e);
        attachments = [];
      }
    }

    const task = {
      ...row,
      attachments
    };

    sendSuccess(res, task);
  });
});

router.post('/', async (req, res) => {
  const { title, description, assigned_to, due_date, notes, created_by, list_id, attachments } = req.body;
  if (!title || !title.trim()) {
    res.status(400).json({ error: 'Título requerido' });
    return;
  }
  try {
    const estimated_time = await estimateTaskTime(title, description);
    const attachmentsJson = attachments && attachments.length > 0 ? JSON.stringify(attachments) : null;

    db.run(
      'INSERT INTO tasks (title, description, assigned_to, due_date, notes, estimated_time, created_by, list_id, attachments, completed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title.trim(), description || '', assigned_to || null, due_date || null, notes || '', estimated_time, created_by || 'Usuario', list_id || 1, attachmentsJson, 0],
      function (err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({
          id: this.lastID,
          title: title.trim(),
          description: description || '',
          assigned_to: assigned_to || null,
          due_date: due_date || null,
          notes: notes || '',
          estimated_time,
          created_by: created_by || 'Usuario',
          list_id: list_id || 1,
          attachments: attachments || [],
          completed: 0,
          created_at: new Date().toISOString()
        });
      }
    );
  } catch (e) {
    const attachmentsJson = attachments && attachments.length > 0 ? JSON.stringify(attachments) : null;
    db.run(
      'INSERT INTO tasks (title, description, assigned_to, due_date, notes, estimated_time, created_by, list_id, attachments, completed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title.trim(), description || '', assigned_to || null, due_date || null, notes || '', '1-2 horas', created_by || 'Usuario', list_id || 1, attachmentsJson, 0],
      function (err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({
          id: this.lastID,
          title: title.trim(),
          description: description || '',
          assigned_to: assigned_to || null,
          due_date: due_date || null,
          notes: notes || '',
          estimated_time: '1-2 horas',
          created_by: created_by || 'Usuario',
          list_id: list_id || 1,
          attachments: attachments || [],
          completed: 0,
          created_at: new Date().toISOString()
        });
      }
    );
  }
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { completed, title, description, assigned_to, due_date, notes } = req.body;

  if (completed !== undefined) {
    const value = completed ? 1 : 0;
    db.run('UPDATE tasks SET completed = ? WHERE id = ?', [value, id], function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Tarea actualizada' });
    });
  } else {
    if (!title || !title.trim()) {
      res.status(400).json({ error: 'Título requerido' });
      return;
    }

    db.run(
      'UPDATE tasks SET title = ?, description = ?, assigned_to = ?, due_date = ?, notes = ? WHERE id = ?',
      [title.trim(), description || '', assigned_to || null, due_date || null, notes || '', id],
      function (err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ message: 'Tarea actualizada' });
      }
    );
  }
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM tasks WHERE id = ?', [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Tarea eliminada' });
  });
});

router.get('/:id/comments', (req, res) => {
  const { id } = req.params;
  db.all('SELECT * FROM comments WHERE task_id = ? ORDER BY created_at ASC', [id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

router.post('/:id/comments', (req, res) => {
  const { id } = req.params;
  const { content, author, photo_url, mentions } = req.body;

  if (!content || !content.trim()) {
    res.status(400).json({ error: 'Contenido del comentario requerido' });
    return;
  }

  db.run(
    'INSERT INTO comments (task_id, content, author, photo_url, mentions) VALUES (?, ?, ?, ?, ?)',
    [id, content.trim(), author || 'Usuario Anónimo', photo_url || null, mentions || null],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        id: this.lastID,
        task_id: parseInt(id),
        content: content.trim(),
        author: author || 'Usuario Anónimo',
        photo_url: photo_url || null,
        mentions: mentions || null,
        created_at: new Date().toISOString()
      });
    }
  );
});

router.delete('/:id/comments/:commentId', (req, res) => {
  const { commentId } = req.params;
  db.run('DELETE FROM comments WHERE id = ?', [commentId], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Comentario eliminado' });
  });
});

module.exports = router;


