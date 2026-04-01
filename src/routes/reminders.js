const express = require('express');
const { db } = require('../database');
const router = express.Router();

/**
 * GET /api/reminders - 获取提醒列表
 */
router.get('/', (req, res) => {
  try {
    const { reminder_type, status, due_date_from, due_date_to, entity_type, page = 1, limit = 20 } = req.query;
    
    let sql = 'SELECT * FROM reminders WHERE 1=1';
    const params = [];
    
    if (reminder_type) {
      sql += ' AND reminder_type = ?';
      params.push(reminder_type);
    }
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (due_date_from) {
      sql += ' AND due_date >= ?';
      params.push(due_date_from);
    }
    if (due_date_to) {
      sql += ' AND due_date <= ?';
      params.push(due_date_to);
    }
    if (entity_type) {
      sql += ' AND entity_type = ?';
      params.push(entity_type);
    }
    
    sql += ' ORDER BY due_date ASC, created_at DESC';
    
    // 分页
    const offset = (page - 1) * parseInt(limit);
    sql += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    
    const reminders = db.all(sql, params);
    
    // 总数统计
    let countSql = 'SELECT COUNT(*) as total FROM reminders WHERE 1=1';
    const countParams = [];
    if (reminder_type) { countSql += ' AND reminder_type = ?'; countParams.push(reminder_type); }
    if (status) { countSql += ' AND status = ?'; countParams.push(status); }
    if (due_date_from) { countSql += ' AND due_date >= ?'; countParams.push(due_date_from); }
    if (due_date_to) { countSql += ' AND due_date <= ?'; countParams.push(due_date_to); }
    if (entity_type) { countSql += ' AND entity_type = ?'; countParams.push(entity_type); }
    
    const countResult = db.get(countSql, countParams);
    const total = countResult ? countResult.total : 0;
    
    res.json({ success: true, data: reminders, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/reminders/upcoming - 获取即将到期的提醒
 */
router.get('/upcoming', (req, res) => {
  try {
    const daysAhead = parseInt(req.query.days || 7);
    
    const upcoming = db.all(`
      SELECT * FROM reminders 
      WHERE status = 'pending' 
        AND due_date BETWEEN date('now') AND date('now', '+' || ? || ' days')
      ORDER BY due_date ASC
    `, [daysAhead]);
    
    res.json({ success: true, data: upcoming, count: upcoming.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/reminders/:id - 获取单个提醒详情
 */
router.get('/:id', (req, res) => {
  try {
    const reminder = db.get('SELECT * FROM reminders WHERE id = ?', [req.params.id]);
    
    if (!reminder) {
      return res.status(404).json({ success: false, error: '提醒不存在' });
    }
    
    res.json({ success: true, data: reminder });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/reminders - 创建新提醒
 */
router.post('/', (req, res) => {
  try {
    const { title, reminder_type, due_date, reminder_date, entity_type, entity_id, notes } = req.body;
    
    if (!title || !due_date || !reminder_date) {
      return res.status(400).json({ success: false, error: '标题、截止日期、提醒日期不能为空' });
    }
    
    const result = db.run(`
      INSERT INTO reminders (title, reminder_type, due_date, reminder_date, entity_type, entity_id, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [title, reminder_type || 'custom', due_date, reminder_date, entity_type || null, entity_id || null, notes || null]);
    
    const newReminder = db.get('SELECT * FROM reminders WHERE id = ?', [result.lastInsertRowid]);
    
    res.status(201).json({ success: true, data: newReminder, message: '提醒创建成功' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/reminders/:id - 更新提醒
 */
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, due_date, reminder_date, status, notification_sent, completed_date, notes } = req.body;
    
    const existing = db.get('SELECT * FROM reminders WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: '提醒不存在' });
    }
    
    db.run(`
      UPDATE reminders 
      SET title = COALESCE(?, title),
          due_date = COALESCE(?, due_date),
          reminder_date = COALESCE(?, reminder_date),
          status = COALESCE(?, status),
          notification_sent = COALESCE(?, notification_sent),
          notified_date = CASE WHEN ? = 1 AND notified_date IS NULL THEN CURRENT_DATE ELSE notified_date END,
          completed_date = COALESCE(?, completed_date),
          notes = COALESCE(?, notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [title, due_date, reminder_date, status, notification_sent, notification_sent, completed_date, notes, id]);
    
    const updated = db.get('SELECT * FROM reminders WHERE id = ?', [id]);
    res.json({ success: true, data: updated, message: '提醒更新成功' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/reminders/:id - 删除提醒
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    db.run('DELETE FROM reminders WHERE id = ?', [id]);
    res.json({ success: true, message: '提醒删除成功' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;