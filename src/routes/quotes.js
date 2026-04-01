const express = require('express');
const { db } = require('../database');
const router = express.Router();

/**
 * GET /api/quotes - 获取报价列表
 */
router.get('/', (req, res) => {
  try {
    const { vendor_id, category_id, status, priority, search, page = 1, limit = 20 } = req.query;
    
    let sql = `
      SELECT 
        q.*,
        v.name as vendor_name,
        ec.name as category_name
      FROM quotes q
      LEFT JOIN vendors v ON q.vendor_id = v.id
      LEFT JOIN expense_categories ec ON q.category_id = ec.id
      WHERE 1=1
    `;
    const params = [];
    
    if (vendor_id) {
      sql += ' AND q.vendor_id = ?';
      params.push(vendor_id);
    }
    if (category_id) {
      sql += ' AND q.category_id = ?';
      params.push(category_id);
    }
    if (status) {
      sql += ' AND q.status = ?';
      params.push(status);
    }
    if (priority) {
      sql += ' AND q.priority = ?';
      params.push(priority);
    }
    if (search) {
      sql += ' AND (q.project_name LIKE ? OR q.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    sql += ' ORDER BY q.created_at DESC';
    
    // 分页
    const offset = (page - 1) * parseInt(limit);
    sql += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    
    const quotes = db.prepare(sql).all(...params);
    
    // 总数统计
    let countSql = `SELECT COUNT(*) as total FROM quotes WHERE 1=1`;
    const countParams = [];
    if (vendor_id) { countSql += ' AND vendor_id = ?'; countParams.push(vendor_id); }
    if (category_id) { countSql += ' AND category_id = ?'; countParams.push(category_id); }
    if (status) { countSql += ' AND status = ?'; countParams.push(status); }
    if (priority) { countSql += ' AND priority = ?'; countParams.push(priority); }
    if (search) { countSql += ' AND (project_name LIKE ? OR description LIKE ?)'; countParams.push(`%${search}%`, `%${search}%`); }
    
    const { total } = db.prepare(countSql).get(...countParams);
    
    res.json({ success: true, data: quotes, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/quotes/:id - 获取单个报价详情
 */
router.get('/:id', (req, res) => {
  try {
    const quote = db.prepare(`
      SELECT 
        q.*,
        v.name as vendor_name,
        ec.name as category_name
      FROM quotes q
      LEFT JOIN vendors v ON q.vendor_id = v.id
      LEFT JOIN expense_categories ec ON q.category_id = ec.id
      WHERE q.id = ?
    `).get(req.params.id);
    
    if (!quote) {
      return res.status(404).json({ success: false, error: '报价不存在' });
    }
    
    res.json({ success: true, data: quote });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/quotes - 创建新报价
 */
router.post('/', (req, res) => {
  try {
    const { vendor_id, category_id, design_concept_id, project_name, description, amount, currency, validity_start, validity_end, notes } = req.body;
    
    if (!vendor_id || !category_id || !project_name) {
      return res.status(400).json({ success: false, error: '商家 ID、分类 ID、项目名称不能为空' });
    }
    
    // 验证外键存在
    const vendor = db.prepare('SELECT id FROM vendors WHERE id = ?').get(vendor_id);
    const category = db.prepare('SELECT id FROM expense_categories WHERE id = ?').get(category_id);
    
    if (!vendor || !category) {
      return res.status(400).json({ success: false, error: '商家或分类不存在' });
    }
    
    const result = db.prepare(`
      INSERT INTO quotes (vendor_id, category_id, design_concept_id, project_name, description, amount, currency, validity_start, validity_end, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(vendor_id, category_id, design_concept_id || null, project_name, description || null, amount, currency || 'CNY', validity_start || null, validity_end || null, notes || null);
    
    const newQuote = db.prepare(`
      SELECT 
        q.*,
        v.name as vendor_name,
        ec.name as category_name
      FROM quotes q
      LEFT JOIN vendors v ON q.vendor_id = v.id
      LEFT JOIN expense_categories ec ON q.category_id = ec.id
      WHERE q.id = ?
    `).get(result.lastInsertRowid);
    
    res.status(201).json({ success: true, data: newQuote, message: '报价创建成功' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/quotes/:id - 更新报价
 */
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { project_name, description, amount, status, priority, validity_end, notes } = req.body;
    
    const existing = db.prepare('SELECT * FROM quotes WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: '报价不存在' });
    }
    
    db.prepare(`
      UPDATE quotes 
      SET project_name = COALESCE(?, project_name),
          description = COALESCE(?, description),
          amount = COALESCE(?, amount),
          status = COALESCE(?, status),
          priority = COALESCE(?, priority),
          validity_end = COALESCE(?, validity_end),
          notes = COALESCE(?, notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(project_name, description, amount, status, priority, validity_end, notes, id);
    
    const updated = db.prepare(`
      SELECT 
        q.*,
        v.name as vendor_name,
        ec.name as category_name
      FROM quotes q
      LEFT JOIN vendors v ON q.vendor_id = v.id
      LEFT JOIN expense_categories ec ON q.category_id = ec.id
      WHERE q.id = ?
    `).get(id);
    
    res.json({ success: true, data: updated, message: '报价更新成功' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/quotes/:id - 删除报价
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    db.prepare('DELETE FROM quotes WHERE id = ?').run(id);
    res.json({ success: true, message: '报价删除成功' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
