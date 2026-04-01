const express = require('express');
const { db } = require('../database');
const router = express.Router();

/**
 * GET /api/categories - 获取费用分类列表
 */
router.get('/', (req, res) => {
  try {
    const { level, parent_id } = req.query;
    
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
    
    const result = db.exec(sql);
    const categories = result[0] ? result[0].values : [];
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/categories/:id - 获取单个分类详情
 */
router.get('/:id', (req, res) => {
  try {
    const result = db.exec(`SELECT * FROM expense_categories WHERE id = ${req.params.id}`);
    const category = result[0] ? result[0].values[0] : null;
    
    if (!category) {
      return res.status(404).json({ success: false, error: '分类不存在' });
    }
    
    // 转换为对象
    const cols = result[0].columns;
    const categoryObj = {};
    cols.forEach((col, idx) => {
      categoryObj[col] = category[idx];
    });
    
    res.json({ success: true, data: categoryObj });
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
      const result = db.exec(`SELECT path, level FROM expense_categories WHERE id = ${parent_id}`);
      if (!result[0]) {
        return res.status(400).json({ success: false, error: '父分类不存在' });
      }
      const row = result[0].values[0];
      finalLevel = row[1] + 1;
      pathValue = row[0] + parent_id + '/';
    }
    
    db.run(`INSERT INTO expense_categories (name, parent_id, level, path, sort_order, color_code, notes) VALUES ('${name}', ${parent_id || 'NULL'}, ${finalLevel}, '${pathValue}', ${sort_order || 0}, '${color_code || 'NULL'}', '${notes || 'NULL'}')`);
    
    const newCategoryResult = db.exec(`SELECT * FROM expense_categories WHERE id = ${db.exec("SELECT last_insert_rowid()")[0].values[0][0]}`);
    const newCategory = newCategoryResult[0] ? newCategoryResult[0].values[0] : null;
    
    // 转换为对象
    if (newCategory) {
      const cols = newCategoryResult[0].columns;
      const categoryObj = {};
      cols.forEach((col, idx) => {
        categoryObj[col] = newCategory[idx];
      });
    }
    
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
    const { name, parent_id, sort_order, color_code, notes } = req.body;
    
    const existingResult = db.exec(`SELECT * FROM expense_categories WHERE id = ${id}`);
    if (!existingResult[0]) {
      return res.status(404).json({ success: false, error: '分类不存在' });
    }
    
    const existing = existingResult[0].values[0];
    const cols = existingResult[0].columns;
    const existingObj = {};
    cols.forEach((col, idx) => {
      existingObj[col] = existing[idx];
    });
    
    // 简化处理，不更新层级路径
    db.run(`UPDATE expense_categories SET name = '${name || existingObj.name}', parent_id = ${parent_id !== undefined ? parent_id : existingObj.parent_id}, sort_order = ${sort_order !== undefined ? sort_order : existingObj.sort_order}, color_code = '${color_code || existingObj.color_code}', notes = '${notes || existingObj.notes}', updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`);
    
    const updatedResult = db.exec(`SELECT * FROM expense_categories WHERE id = ${id}`);
    const updated = updatedResult[0] ? updatedResult[0].values[0] : null;
    
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
    const childrenResult = db.exec(`SELECT COUNT(*) as count FROM expense_categories WHERE parent_id = ${id}`);
    if (childrenResult[0].values[0][0] > 0) {
      return res.status(400).json({ success: false, error: '存在子分类，无法删除' });
    }
    
    // 检查是否有使用该分类的费用记录
    const expensesResult = db.exec(`SELECT COUNT(*) as count FROM expenses WHERE category_id = ${id}`);
    if (expensesResult[0].values[0][0] > 0) {
      return res.status(400).json({ success: false, error: '存在关联的费用记录，无法删除' });
    }
    
    db.run(`DELETE FROM expense_categories WHERE id = ${id}`);
    res.json({ success: true, message: '分类删除成功' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
