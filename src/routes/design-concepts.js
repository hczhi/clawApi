const express = require('express');
const { db } = require('../database');
const router = express.Router();

/**
 * GET /api/design-concepts - 获取设计方案列表
 */
router.get('/', (req, res) => {
  try {
    const { style, category, source_type, priority, search, page = 1, limit = 20 } = req.query;
    
    let sql = 'SELECT * FROM design_concepts WHERE 1=1';
    const params = [];
    
    if (style) {
      sql += ' AND style = ?';
      params.push(style);
    }
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (source_type) {
      sql += ' AND source_type = ?';
      params.push(source_type);
    }
    if (priority) {
      sql += ' AND priority = ?';
      params.push(priority);
    }
    if (search) {
      sql += ' AND (title LIKE ? OR description LIKE ? OR notes LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    sql += ' ORDER BY priority DESC, created_at DESC';
    
    // 分页
    const offset = (page - 1) * parseInt(limit);
    sql += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    
    const designs = db.prepare(sql).all(...params);
    
    // 总数统计
    let countSql = 'SELECT COUNT(*) as total FROM design_concepts WHERE 1=1';
    const countParams = [];
    if (style) { countSql += ' AND style = ?'; countParams.push(style); }
    if (category) { countSql += ' AND category = ?'; countParams.push(category); }
    if (source_type) { countSql += ' AND source_type = ?'; countParams.push(source_type); }
    if (priority) { countSql += ' AND priority = ?'; countParams.push(priority); }
    if (search) { countSql += ' AND (title LIKE ? OR description LIKE ?)'; countParams.push(`%${search}%`, `%${search}%`); }
    
    const { total } = db.prepare(countSql).get(...countParams);
    
    res.json({ success: true, data: designs, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/design-concepts/:id - 获取单个设计方案详情
 */
router.get('/:id', (req, res) => {
  try {
    const design = db.prepare('SELECT * FROM design_concepts WHERE id = ?').get(req.params.id);
    
    if (!design) {
      return res.status(404).json({ success: false, error: '设计方案不存在' });
    }
    
    res.json({ success: true, data: design });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/design-concepts - 创建新设计方案
 */
router.post('/', (req, res) => {
  try {
    const { title, description, style, category, source_type, image_urls, reference_link, budget_min, budget_max, priority, matched_spaces, tags, notes } = req.body;
    
    if (!title) {
      return res.status(400).json({ success: false, error: '方案标题不能为空' });
    }
    
    const result = db.prepare(`
      INSERT INTO design_concepts 
      (title, description, style, category, source_type, image_urls, reference_link, budget_min, budget_max, priority, matched_spaces, tags, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(title, description || null, style || null, category || null, source_type || null, image_urls || null, reference_link || null, budget_min || null, budget_max || null, priority || 'medium', matched_spaces || null, tags || null, notes || null);
    
    const newDesign = db.prepare('SELECT * FROM design_concepts WHERE id = ?').get(result.lastInsertRowid);
    
    res.status(201).json({ success: true, data: newDesign, message: '设计方案创建成功' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/design-concepts/:id - 更新设计方案
 */
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, style, category, source_type, image_urls, reference_link, budget_min, budget_max, priority, matched_spaces, tags, notes } = req.body;
    
    const existing = db.prepare('SELECT * FROM design_concepts WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: '设计方案不存在' });
    }
    
    db.prepare(`
      UPDATE design_concepts 
      SET title = COALESCE(?, title),
          description = COALESCE(?, description),
          style = COALESCE(?, style),
          category = COALESCE(?, category),
          source_type = COALESCE(?, source_type),
          image_urls = COALESCE(?, image_urls),
          reference_link = COALESCE(?, reference_link),
          budget_min = COALESCE(?, budget_min),
          budget_max = COALESCE(?, budget_max),
          priority = COALESCE(?, priority),
          matched_spaces = COALESCE(?, matched_spaces),
          tags = COALESCE(?, tags),
          notes = COALESCE(?, notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title, description, style, category, source_type, image_urls, reference_link, budget_min, budget_max, priority, matched_spaces, tags, notes, id);
    
    const updated = db.prepare('SELECT * FROM design_concepts WHERE id = ?').get(id);
    res.json({ success: true, data: updated, message: '设计方案更新成功' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/design-concepts/:id - 删除设计方案
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    db.prepare('DELETE FROM design_concepts WHERE id = ?').run(id);
    res.json({ success: true, message: '设计方案删除成功' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
