const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireRole } = require('../middleware/auth');

// Facilitator uploads a course resource
router.post('/resources', requireRole('facilitator'), (req, res) => {
  const { title, description, fileLink } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'title is required' });
  }
  const stmt = db.prepare(
    'INSERT INTO resources (title, description, file_link) VALUES (?, ?, ?)'
  );
  const info = stmt.run(title, description || null, fileLink || null);
  res.status(201).json({ id: info.lastInsertRowid, title, description, fileLink });
});

// Anyone (facilitator or student) can list resources
router.get('/resources', (req, res) => {
  const resources = db.prepare('SELECT * FROM resources ORDER BY id').all();
  res.json(resources);
});

// Student marks a resource as completed
router.post('/resources/:id/complete', requireRole('student'), (req, res) => {
  const { studentId } = req.body;
  if (!studentId) {
    return res.status(400).json({ error: 'studentId is required' });
  }
  const resource = db.prepare('SELECT id FROM resources WHERE id = ?').get(req.params.id);
  if (!resource) {
    return res.status(404).json({ error: 'resource not found' });
  }
  try {
    db.prepare(
      'INSERT INTO completions (resource_id, student_id) VALUES (?, ?)'
    ).run(req.params.id, studentId);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(200).json({ message: 'already marked complete' });
    }
    throw err;
  }
  res.status(201).json({ message: 'marked complete', resourceId: req.params.id, studentId });
});

module.exports = router;