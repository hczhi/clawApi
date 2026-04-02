const express = require('express');
const { db } = require('../database');
const router = express.Router();

/**
 * GET /api/categories - 获取费用分类列表
 */
router.get('/', (req, res) => {
  try {
    const { level, parent_id, page = 1, limit = 20 } = req.query;
    
    let sql = 'SELECT * FROM expense_categories WHERE 1=1';
    const params = [];
    
    if (level) {
      sql += ' AND level = ?';
      params.push(level);
    }
    if (parent_id) {
      sql += ' AND parent_id = ?';
      params.push(parent_id);
    }
    
    sql += ' ORDER BY sort_order, id';
    
    // 分页
    const offset = (page - 1) * parseInt(limit);
    sql += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    
    const categories = db.all(sql, params);
    
    // 总数统计
    let countSql = 'SELECT COUNT(*) as total FROM expense_categories WHERE 1=1';
    const countParams = [];
    if (level) { countSql += ' AND level = ?'; countParams.push(level); }
    if (parent_id) { countSql += ' AND parent_id = ?'; countParams.push(parent_id); }
    
    const countResult = db.get(countSql, countParams);
    const total = countResult ? countResult.total : 0;
    
    res.json({ success: true, data: categories, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/categories/:id - 获取单个分类详情
 */
router.get('/:id', (req, res) => {
  try {
    const category = db.get('SELECT * FROM expense_categories WHERE id = ?', [req.params.id]);
    
    if (!category) {
      return res.status(404).json({ success: false, error: '分类不存在' });
    }
    
    res.json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/categories - 创建新分类
 */
router.post('/', (req, res) => {
  try {
    const { name, parent_id, level, sort_order, color_code, notes } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, error: '分类名称不能为空' });
    }
    
    // 计算层级和路径
    let finalLevel = level || 1;
    let pathValue = '/';
    
    if (parent_id) {
      const parent = db.get('SELECT path, level FROM expense_categories WHERE id = ?', [parent_id]);
      if (!parent) {
        return res.status(400).json({ success: false, error: '父分类不存在' });
      }
      finalLevel = parent.level + 1;
      pathValue = parent.path + parent_id + '/';
    }
    
    const result = db.run(
      'INSERT INTO expense_categories (name, parent_id, level, path, sort_order, color_code, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, parent_id || null, finalLevel, pathValue, sort_order || 0, color_code || null, notes || null]
    );
    
    const newCategory = db.get('SELECT * FROM expense_categories WHERE id = ?', [result.lastInsertRowid]);
    
    res.status(201).json({ success: true, data: newCategory, message: '分类创建成功' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/categories/:id - 更新分类
 */
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.get('SELECT * FROM expense_categories WHERE id = ?', [id]);
    
    if (!existing) {
      return res.status(404).json({ success: false, error: '分类不存在' });
    }
    
    const { name, parent_id, sort_order, color_code, notes } = req.body;
    
    db.run(
      `UPDATE expense_categories 
       SET name = COALESCE(?, name),
           parent_id = COALESCE(?, parent_id),
           sort_order = COALESCE(?, sort_order),
           color_code = COALESCE(?, color_code),
           notes = COALESCE(?, notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, parent_id, sort_order, color_code, notes, id]
    );
    
    const updated = db.get('SELECT * FROM expense_categories WHERE id = ?', [id]);
    res.json({ success: true, data: updated, message: '分类更新成功' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/categories/:id - 删除分类
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查是否有子分类
    const children = db.get('SELECT COUNT(*) as count FROM expense_categories WHERE parent_id = ?', [id]);
    if (children.count > 0) {
      return res.status(400).json({ success: false, error: '该分类下有子分类，无法删除' });
    }
    
    // 检查是否有关联的费用
    const expenses = db.get('SELECT COUNT(*) as count FROM expenses WHERE category_id = ?', [id]);
    if (expenses.count > 0) {
      return res.status(400).json({ success: false, error: '该分类下已有关联费用，无法删除' });
    }
    
    db.run('DELETE FROM expense_categories WHERE id = ?', [id]);
    res.json({ success: true, message: '分类删除成功' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;