const express = require('express');
const { db } = require('../database');
const router = express.Router();

/**
 * GET /api/renovation-results - 获取装修结果列表
 */
router.get('/', (req, res) => {
  try {
    const { space_name, page = 1, limit = 20, search } = req.query;
    
    let sql = 'SELECT * FROM renovation_results WHERE 1=1';
    const params = [];
    
    if (space_name) {
      sql += ' AND space_name = ?';
      params.push(space_name);
    }
    if (search) {
      sql += ' AND (title LIKE ? OR experience_notes LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    sql += ' ORDER BY recorded_at DESC';
    
    // 分页
    const offset = (page - 1) * parseInt(limit);
    sql += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    
    const results = db.all(sql, params);
    
    // 总数统计
    let countSql = 'SELECT COUNT(*) as total FROM renovation_results WHERE 1=1';
    const countParams = [];
    if (space_name) { countSql += ' AND space_name = ?'; countParams.push(space_name); }
    if (search) { countSql += ' AND title LIKE ?'; countParams.push(`%${search}%`); }
    
    const countResult = db.get(countSql, countParams);
    const total = countResult ? countResult.total : 0;
    
    res.json({ success: true, data: results, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/renovation-results/:id - 获取单个装修结果详情
 */
router.get('/:id', (req, res) => {
  try {
    const result = db.get(`
      SELECT 
        r.*,
        t.title as task_title,
        t.phase
      FROM renovation_results r
      LEFT JOIN renovation_timeline t ON r.task_id = t.id
      WHERE r.id = ?
    `, [req.params.id]);
    
    if (!result) {
      return res.status(404).json({ success: false, error: '装修结果不存在' });
    }
    
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/renovation-results - 创建新装修结果
 */
router.post('/', (req, res) => {
  try {
    const { title, space_name, task_id, photo_before_url, photo_after_url, video_url, overall_rating, quality_rating, material_rating, aesthetics_rating, experience_notes, lessons_learned, tags, notes, decoration_area } = req.body;
    
    if (!title || !space_name) {
      return res.status(400).json({ success: false, error: '标题和装修区域不能为空' });
    }
    
    // 验证外键
    if (task_id && !db.get('SELECT id FROM renovation_timeline WHERE id = ?', [task_id])) {
      return res.status(400).json({ success: false, error: '关联的任务不存在' });
    }
    
    const result = db.run(`
      INSERT INTO renovation_results 
      (title, space_name, task_id, photo_before_url, photo_after_url, video_url, overall_rating, quality_rating, material_rating, aesthetics_rating, experience_notes, lessons_learned, tags, notes, decoration_area)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, space_name, task_id || null, photo_before_url || null, photo_after_url || null, video_url || null, overall_rating || null, quality_rating || null, material_rating || null, aesthetics_rating || null, experience_notes || null, lessons_learned || null, tags || null, notes || null, decoration_area || null]);
    
    const newResult = db.get(`
      SELECT 
        r.*,
        t.title as task_title,
        t.phase
      FROM renovation_results r
      LEFT JOIN renovation_timeline t ON r.task_id = t.id
      WHERE r.id = ?
    `, [result.lastInsertRowid]);
    
    res.status(201).json({ success: true, data: newResult, message: '装修结果记录成功' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/renovation-results/:id - 更新装修结果
 */
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, space_name, photo_before_url, photo_after_url, video_url, overall_rating, quality_rating, material_rating, aesthetics_rating, experience_notes, lessons_learned, tags, notes, decoration_area } = req.body;
    
    const existing = db.get('SELECT * FROM renovation_results WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: '装修结果不存在' });
    }
    
    db.run(`
      UPDATE renovation_results 
      SET title = COALESCE(?, title),
          space_name = COALESCE(?, space_name),
          photo_before_url = COALESCE(?, photo_before_url),
          photo_after_url = COALESCE(?, photo_after_url),
          video_url = COALESCE(?, video_url),
          overall_rating = COALESCE(?, overall_rating),
          quality_rating = COALESCE(?, quality_rating),
          material_rating = COALESCE(?, material_rating),
          aesthetics_rating = COALESCE(?, aesthetics_rating),
          experience_notes = COALESCE(?, experience_notes),
          lessons_learned = COALESCE(?, lessons_learned),
          tags = COALESCE(?, tags),
          notes = COALESCE(?, notes),
          decoration_area = COALESCE(?, decoration_area),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [title, space_name, photo_before_url, photo_after_url, video_url, overall_rating, quality_rating, material_rating, aesthetics_rating, experience_notes, lessons_learned, tags, notes, decoration_area, id]);
    
    const updated = db.get(`
      SELECT 
        r.*,
        t.title as task_title,
        t.phase
      FROM renovation_results r
      LEFT JOIN renovation_timeline t ON r.task_id = t.id
      WHERE r.id = ?
    `, [id]);
    
    res.json({ success: true, data: updated, message: '装修结果更新成功' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/renovation-results/:id - 删除装修结果
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    db.run('DELETE FROM renovation_results WHERE id = ?', [id]);
    res.json({ success: true, message: '装修结果删除成功' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;