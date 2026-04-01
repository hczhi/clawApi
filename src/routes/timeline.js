const express = require('express');
const { db } = require('../database');
const router = express.Router();

/**
 * GET /api/timeline - 获取日程进度列表
 */
router.get('/', (req, res) => {
  try {
    const { phase, status, milestone_type, date_from, date_to, search, page = 1, limit = 20 } = req.query;
    
    let sql = `
      SELECT 
        t.*,
        v.name as vendor_name
      FROM renovation_timeline t
      LEFT JOIN vendors v ON t.vendor_id = v.id
      WHERE 1=1
    `;
    const params = [];
    
    if (phase) {
      sql += ' AND t.phase = ?';
      params.push(phase);
    }
    if (status) {
      sql += ' AND t.status = ?';
      params.push(status);
    }
    if (milestone_type) {
      sql += ' AND t.milestone_type = ?';
      params.push(milestone_type);
    }
    if (date_from) {
      sql += ' AND (t.planned_start >= ? OR t.actual_start >= ?)';
      params.push(date_from, date_from);
    }
    if (date_to) {
      sql += ' AND (t.planned_end <= ? OR t.actual_end <= ?)';
      params.push(date_to, date_to);
    }
    if (search) {
      sql += ' AND (t.title LIKE ? OR t.progress_notes LIKE ? OR t.inspection_notes LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    sql += ' ORDER BY t.planned_start ASC';
    
    // 分页
    const offset = (page - 1) * parseInt(limit);
    sql += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    
    const timelines = db.prepare(sql).all(...params);
    
    // 总数统计
    let countSql = 'SELECT COUNT(*) as total FROM renovation_timeline WHERE 1=1';
    const countParams = [];
    if (phase) { countSql += ' AND phase = ?'; countParams.push(phase); }
    if (status) { countSql += ' AND status = ?'; countParams.push(status); }
    if (date_from) { countSql += ' AND planned_start >= ?'; countParams.push(date_from); }
    if (date_to) { countSql += ' AND planned_end <= ?'; countParams.push(date_to); }
    if (search) { countSql += ' AND title LIKE ?'; countParams.push(`%${search}%`); }
    
    const { total } = db.prepare(countSql).get(...countParams);
    
    res.json({ success: true, data: timelines, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/timeline/stats - 获取进度统计概览
 */
router.get('/stats', (req, res) => {
  try {
    // 按阶段统计
    const byPhase = db.prepare(`
      SELECT 
        phase,
        COUNT(*) as total_tasks,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tasks,
        SUM(CASE WHEN status IN ('not_started', 'cancelled') THEN 1 ELSE 0 END) as pending_tasks,
        ROUND(100.0 * SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) / COUNT(*), 2) as completion_rate
      FROM renovation_timeline
      GROUP BY phase
      ORDER BY MIN(planned_start)
    `).all();
    
    // 总体完成率
    const overallStats = db.prepare(`
      SELECT 
        COUNT(*) as total_tasks,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tasks,
        ROUND(100.0 * SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) / COUNT(*), 2) as completion_rate
      FROM renovation_timeline
    `).get();
    
    // 延期任务数量
    const delayedTasks = db.prepare(`
      SELECT COUNT(*) as count 
      FROM renovation_timeline 
      WHERE status = 'delayed' OR (actual_end > planned_end AND actual_end IS NOT NULL)
    `).get();
    
    // 待验收任务
    const pendingInspections = db.prepare(`
      SELECT COUNT(*) as count 
      FROM renovation_timeline 
      WHERE status = 'in_progress' AND quality_check_passed = 0
    `).get();
    
    res.json({ success: true, data: { by_phase: byPhase, overall: overallStats, delayed_count: delayedTasks.count, pending_inspections: pendingInspections.count } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/timeline/:id - 获取单个进度详情
 */
router.get('/:id', (req, res) => {
  try {
    const timeline = db.prepare(`
      SELECT 
        t.*,
        v.name as vendor_name
      FROM renovation_timeline t
      LEFT JOIN vendors v ON t.vendor_id = v.id
      WHERE t.id = ?
    `).get(req.params.id);
    
    if (!timeline) {
      return res.status(404).json({ success: false, error: '进度记录不存在' });
    }
    
    res.json({ success: true, data: timeline });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/timeline - 创建新进度记录
 */
router.post('/', (req, res) => {
  try {
    const { title, phase, milestone_type, planned_start, planned_end, responsible_party, vendor_id, related_order_ids, tags, notes, progress_notes, photo_url } = req.body;
    
    if (!title || !phase || !planned_start || !planned_end) {
      return res.status(400).json({ success: false, error: '标题、阶段、计划开始和结束日期不能为空' });
    }
    
    // 验证外键
    if (vendor_id && !db.prepare('SELECT id FROM vendors WHERE id = ?').get(vendor_id)) {
      return res.status(400).json({ success: false, error: '供应商不存在' });
    }
    
    const result = db.prepare(`
      INSERT INTO renovation_timeline 
      (title, phase, milestone_type, planned_start, planned_end, actual_start, actual_end, status, progress_percent, responsible_party, vendor_id, related_order_ids, quality_check_passed, inspection_notes, photo_url, progress_notes, tags, notes)
      VALUES (?, ?, ?, ?, ?, NULL, NULL, 'not_started', 0, ?, ?, ?, 0, '', ?, ?, ?, ?)
    `).run(title, phase, milestone_type || 'routine_task', planned_start, planned_end, responsible_party || null, vendor_id || null, related_order_ids || null, photo_url || null, progress_notes || null, tags || null, notes || null);
    
    const newTimeline = db.prepare(`
      SELECT 
        t.*,
        v.name as vendor_name
      FROM renovation_timeline t
      LEFT JOIN vendors v ON t.vendor_id = v.id
      WHERE t.id = ?
    `).get(result.lastInsertRowid);
    
    res.status(201).json({ success: true, data: newTimeline, message: '进度记录创建成功' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/timeline/:id - 更新进度记录
 */
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, phase, planned_start, planned_end, actual_start, actual_end, status, progress_percent, responsible_party, quality_check_passed, inspection_notes, photo_url, progress_notes } = req.body;
    
    const existing = db.prepare('SELECT * FROM renovation_timeline WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: '进度记录不存在' });
    }
    
    // 自动计算状态（如果没提供）
    let finalStatus = status;
    if (!finalStatus) {
      if (actual_end) finalStatus = 'completed';
      else if (actual_start) finalStatus = 'in_progress';
      else finalStatus = 'not_started';
    }
    
    db.prepare(`
      UPDATE renovation_timeline 
      SET title = COALESCE(?, title),
          phase = COALESCE(?, phase),
          planned_start = COALESCE(?, planned_start),
          planned_end = COALESCE(?, planned_end),
          actual_start = COALESCE(?, actual_start),
          actual_end = COALESCE(?, actual_end),
          status = COALESCE(?, finalStatus),
          progress_percent = COALESCE(?, progress_percent),
          responsible_party = COALESCE(?, responsible_party),
          quality_check_passed = COALESCE(?, quality_check_passed),
          inspection_notes = COALESCE(?, inspection_notes),
          photo_url = COALESCE(?, photo_url),
          progress_notes = COALESCE(?, progress_notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title, phase, planned_start, planned_end, actual_start, actual_end, finalStatus, progress_percent, responsible_party, quality_check_passed, inspection_notes, photo_url, progress_notes, id);
    
    const updated = db.prepare(`
      SELECT 
        t.*,
        v.name as vendor_name
      FROM renovation_timeline t
      LEFT JOIN vendors v ON t.vendor_id = v.id
      WHERE t.id = ?
    `).get(id);
    
    res.json({ success: true, data: updated, message: '进度记录更新成功' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/timeline/:id - 删除进度记录
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    db.prepare('DELETE FROM renovation_timeline WHERE id = ?').run(id);
    res.json({ success: true, message: '进度记录删除成功' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
