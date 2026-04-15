const express = require('express');
const router = express.Router();
const { db } = require('../database');

// GET /api/schedules - 获取日程列表
router.get('/', (req, res) => {
  try {
    const schedules = db.prepare(`
      SELECT * FROM schedules 
      ORDER BY start_date ASC
    `).all();
    
    res.json(schedules);
  } catch (error) {
    console.error('Failed to fetch schedules:', error);
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
});

// POST /api/schedules - 创建日程
router.post('/', (req, res) => {
  const { title, start_date, end_date, type, related_id, color, notes } = req.body;
  
  if (!title || !start_date) {
    return res.status(400).json({ error: 'Title and start_date are required' });
  }

  try {
    const info = db.prepare(`
      INSERT INTO schedules (title, start_date, end_date, type, related_id, color, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      title, 
      start_date, 
      end_date || null, 
      type || 'custom', 
      related_id || null, 
      color || '#3b82f6', 
      notes || ''
    );
    
    const schedule = db.prepare('SELECT * FROM schedules WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(schedule);
  } catch (error) {
    console.error('Failed to create schedule:', error);
    res.status(500).json({ error: 'Failed to create schedule' });
  }
});

// PUT /api/schedules/:id - 更新日程
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, start_date, end_date, type, related_id, color, notes } = req.body;
  
  try {
    const info = db.prepare(`
      UPDATE schedules 
      SET title = ?, start_date = ?, end_date = ?, type = ?, related_id = ?, color = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title, 
      start_date, 
      end_date || null, 
      type || 'custom', 
      related_id || null, 
      color || '#3b82f6', 
      notes || '',
      id
    );
    
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    const schedule = db.prepare('SELECT * FROM schedules WHERE id = ?').get(id);
    res.json(schedule);
  } catch (error) {
    console.error('Failed to update schedule:', error);
    res.status(500).json({ error: 'Failed to update schedule' });
  }
});

// DELETE /api/schedules/:id - 删除日程
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  try {
    const info = db.prepare('DELETE FROM schedules WHERE id = ?').run(id);
    
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    res.json({ success: true, message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Failed to delete schedule:', error);
    res.status(500).json({ error: 'Failed to delete schedule' });
  }
});

module.exports = router;
