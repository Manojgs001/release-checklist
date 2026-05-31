const express = require('express');
const router = express.Router();
const pool = require('../db');
const { RELEASE_STEPS, computeStatus } = require('../steps');

function formatRelease(row) {
  const completedSteps = row.completed_steps || [];
  return {
    id: row.id,
    name: row.name,
    release_date: row.release_date,
    additional_info: row.additional_info,
    completed_steps: completedSteps,
    status: computeStatus(completedSteps),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// GET /api/releases
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM releases ORDER BY release_date ASC'
    );
    res.json(result.rows.map(formatRelease));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/releases/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM releases WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Release not found' });
    res.json(formatRelease(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/releases
router.post('/', async (req, res) => {
  const { name, release_date, additional_info } = req.body;
  if (!name || !release_date) {
    return res.status(400).json({ error: 'name and release_date are required' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO releases (name, release_date, additional_info, completed_steps)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, release_date, additional_info || null, '{}']
    );
    res.status(201).json(formatRelease(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/releases/:id
router.patch('/:id', async (req, res) => {
  const { additional_info } = req.body;
  try {
    const result = await pool.query(
      `UPDATE releases SET additional_info = $1, updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [additional_info, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Release not found' });
    res.json(formatRelease(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/releases/:id/steps
router.patch('/:id/steps', async (req, res) => {
  const { step_id, completed } = req.body;
  if (!step_id) return res.status(400).json({ error: 'step_id is required' });
  const validIds = RELEASE_STEPS.map(s => s.id);
  if (!validIds.includes(step_id)) return res.status(400).json({ error: 'Invalid step_id' });

  try {
    const current = await pool.query('SELECT completed_steps FROM releases WHERE id = $1', [req.params.id]);
    if (!current.rows.length) return res.status(404).json({ error: 'Release not found' });

    let steps = current.rows[0].completed_steps || [];
    if (completed && !steps.includes(step_id)) {
      steps = [...steps, step_id];
    } else if (!completed) {
      steps = steps.filter(s => s !== step_id);
    }

    const result = await pool.query(
      `UPDATE releases SET completed_steps = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [steps, req.params.id]
    );
    res.json(formatRelease(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/releases/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM releases WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Release not found' });
    res.json({ deleted: true, id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/releases/meta/steps
router.get('/meta/steps', (req, res) => {
  res.json(RELEASE_STEPS);
});

module.exports = router;
