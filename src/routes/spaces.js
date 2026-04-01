const express = require('express');
const { db } = require('../database');
const router = express.Router();

/**
 * GET /api/spaces - 获取空间列表
 */
router.get('/', (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    
    let sql = 'SELECT * FROM space_planning WHERE 1=1';
    const params = [];
    
    if (search) {
      sql += ' AND (room_name LIKE ? OR original_plan LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    sql += ' ORDER BY priority_level ASC, area DESC';
    
    // 分页
    const offset = (page - 1) * parseInt(limit);
    sql += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    
    const spaces = db.prepare(sql).all(...params);
    
    // 总数统计
    let countSql = 'SELECT COUNT(*) as total FROM space_planning WHERE 1=1';
    const countParams = [];
    if (search) { countSql += ' AND room_name LIKE ?'; countParams.push(`%${search}%`); }
    
    const { total } = db.prepare(countSql).get(...countParams);
    
    res.json({ success: true, data: spaces, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/spaces/:id - 获取单个空间详情
 */
router.get('/:id', (req, res) => {
  try {
    const space = db.prepare(`
      SELECT 
        s.*,
        dc.title as final_design_title
      FROM space_planning s
      LEFT JOIN design_concepts dc ON s.final_design_id = dc.id
      WHERE s.id = ?
    `).get(req.params.id);
    
    if (!space) {
      return res.status(404).json({ success: false, error: '空间不存在' });
    }
    
    res.json({ success: true, data: space });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/spaces - 创建新空间
 */
router.post('/', (req, res) => {
  try {
    const { room_name, area, original_plan, final_design_id, priority_level, planned_start, planned_end, notes } = req.body;
    
    if (!room_name) {
      return res.status(400).json({ success: false, error: '房间名称不能为空' });
    }
    
    // 检查是否已存在同名房间
    const existing = db.prepare('SELECT id FROM space_planning WHERE room_name = ?').get(room_name);
    if (existing) {
      return res.status(400).json({ success: false, error: '该房间名称已存在' });
    }
    
    const result = db.prepare(`
      INSERT INTO space_planning 
      (room_name, area, original_plan, final_design_id, priority_level, planned_start, planned_end, actual_start, actual_end, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?)
    `).run(room_name, area || null, original_plan || null, final_design_id || null, priority_level || 3, planned_start || null, planned_end || null, notes || null);
    
    const newSpace = db.prepare('SELECT * FROM space_planning WHERE id = ?').get(result.lastInsertRowid);
    
    res.status(201).json({ success: true, data: newSpace, message: '空间创建成功' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/spaces/:id - 更新空间
 */
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { room_name, area, original_plan, final_design_id, priority_level, planned_start, planned_end, actual_start, actual_end, notes } = req.body;
    
    const existing = db.prepare('SELECT * FROM space_planning WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: '空间不存在' });
    }
    
    // 如果修改了 room_name，检查是否与其他房间冲突
    if (room_name && room_name !== existing.room_name) {
      const conflict = db.prepare('SELECT id FROM space_planning WHERE room_name = ? AND id != ?').get(room_name, id);
      if (conflict) {
        return res.status(400).json({ success: false, error: '该房间名称已被其他空间使用' });
      }
    }
    
    db.prepare(`
      UPDATE space_planning 
      SET room_name = COALESCE(?, room_name),
          area = COALESCE(?, area),
          original_plan = COALESCE(?, original_plan),
          final_design_id = COALESCE(?, final_design_id),
          priority_level = COALESCE(?, priority_level),
          planned_start = COALESCE(?, planned_start),
          planned_end = COALESCE(?, planned_end),
          actual_start = COALESCE(?, actual_start),
          actual_end = COALESCE(?, actual_end),
          notes = COALESCE(?, notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(room_name ?? existing.room_name, area, original_plan, final_design_id, priority_level, planned_start, planned_end, actual_start, actual_end, notes, id);
    
    const updated = db.prepare('SELECT * FROM space_planning WHERE id = ?').get(id);
    res.json({ success: true, data: updated, message: '空间更新成功' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/spaces/:id - 删除空间
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查是否有装修结果关联
    const results = db.prepare('SELECT COUNT(*) as count FROM renovation_results WHERE task_id = ?').get(id);
    if (results.count > 0) {
      return res.status(400).json({ success: false, error: '存在关联的装修结果记录，无法删除' });
    }
    
    db.prepare('DELETE FROM space_planning WHERE id = ?').run(id);
    res.json({ success: true, message: '空间删除成功' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
