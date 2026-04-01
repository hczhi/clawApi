const express = require('express');
const { db } = require('../database');
const router = express.Router();

/**
 * GET /api/purchase-plans - 获取购买计划列表
 */
router.get('/', (req, res) => {
  try {
    const { category_id, vendor_id, status, tags, date_from, date_to, search, page = 1, limit = 20 } = req.query;
    
    let sql = `
      SELECT 
        p.*,
        ec.name as category_name,
        v.name as vendor_name
      FROM purchase_plans p
      LEFT JOIN expense_categories ec ON p.category_id = ec.id
      LEFT JOIN vendors v ON p.vendor_id = v.id
      WHERE 1=1
    `;
    const params = [];
    
    if (category_id) {
      sql += ' AND p.category_id = ?';
      params.push(category_id);
    }
    if (vendor_id) {
      sql += ' AND p.vendor_id = ?';
      params.push(vendor_id);
    }
    if (status) {
      sql += ' AND p.status = ?';
      params.push(status);
    }
    if (tags) {
      sql += ' AND p.tags LIKE ?';
      params.push(`%${tags}%`);
    }
    if (date_from && !date_to) {
      sql += ' AND (estimated_purchase_date >= ? OR purchased_date >= ?)';
      params.push(date_from, date_from);
    } else if (date_from && date_to) {
      sql += ' AND (estimated_purchase_date BETWEEN ? AND ? OR purchased_date BETWEEN ? AND ?)';
      params.push(date_from, date_to, date_from, date_to);
    } else if (date_to) {
      sql += ' AND (estimated_purchase_date <= ? OR purchased_date <= ?)';
      params.push(date_to, date_to);
    }
    if (search) {
      sql += ' AND (item_name LIKE ? OR notes LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    sql += ' ORDER BY estimated_purchase_date ASC NULLS FIRST, created_at DESC';
    
    // 分页
    const offset = (page - 1) * parseInt(limit);
    sql += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    
    const plans = db.prepare(sql).all(...params);
    
    // 总数统计
    let countSql = 'SELECT COUNT(*) as total FROM purchase_plans WHERE 1=1';
    const countParams = [];
    if (category_id) { countSql += ' AND category_id = ?'; countParams.push(category_id); }
    if (vendor_id) { countSql += ' AND vendor_id = ?'; countParams.push(vendor_id); }
    if (status) { countSql += ' AND status = ?'; countParams.push(status); }
    if (search) { countSql += ' AND item_name LIKE ?'; countParams.push(`%${search}%`); }
    
    const { total } = db.prepare(countSql).get(...countParams);
    
    res.json({ success: true, data: plans, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/purchase-plans/:id - 获取单个购买计划详情
 */
router.get('/:id', (req, res) => {
  try {
    const plan = db.prepare(`
      SELECT 
        p.*,
        ec.name as category_name,
        v.name as vendor_name
      FROM purchase_plans p
      LEFT JOIN expense_categories ec ON p.category_id = ec.id
      LEFT JOIN vendors v ON p.vendor_id = v.id
      WHERE p.id = ?
    `).get(req.params.id);
    
    if (!plan) {
      return res.status(404).json({ success: false, error: '购买计划不存在' });
    }
    
    // 计算预算对比
    plan.budget_diff = plan.actual_price - plan.estimated_budget;
    plan.budget_ratio = plan.estimated_budget ? ((plan.actual_price / plan.estimated_budget) * 100).toFixed(2) : null;
    
    res.json({ success: true, data: plan });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/purchase-plans - 创建新购买计划
 */
router.post('/', (req, res) => {
  try {
    const { item_name, category_id, estimated_budget, actual_price, estimated_purchase_date, purchased_date, installation_required, scheduled_installation_date, vendor_id, tags, notes } = req.body;
    
    if (!item_name || !category_id) {
      return res.status(400).json({ success: false, error: '物品名称和分类 ID 不能为空' });
    }
    
    const result = db.prepare(`
      INSERT INTO purchase_plans 
      (item_name, category_id, estimated_budget, actual_price, estimated_purchase_date, purchased_date, installation_required, scheduled_installation_date, vendor_id, tags, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(item_name, category_id, estimated_budget || null, actual_price || null, estimated_purchase_date || null, purchased_date || null, installation_required || 0, scheduled_installation_date || null, vendor_id || null, tags || null, notes || null);
    
    const newPlan = db.prepare(`
      SELECT 
        p.*,
        ec.name as category_name,
        v.name as vendor_name
      FROM purchase_plans p
      LEFT JOIN expense_categories ec ON p.category_id = ec.id
      LEFT JOIN vendors v ON p.vendor_id = v.id
      WHERE p.id = ?
    `).get(result.lastInsertRowid);
    
    res.status(201).json({ success: true, data: newPlan, message: '购买计划创建成功' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/purchase-plans/:id - 更新购买计划
 */
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { item_name, estimated_budget, actual_price, estimated_purchase_date, purchased_date, installation_required, scheduled_installation_date, vendor_id, tags, notes } = req.body;
    
    const existing = db.prepare('SELECT * FROM purchase_plans WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: '购买计划不存在' });
    }
    
    db.prepare(`
      UPDATE purchase_plans 
      SET item_name = COALESCE(?, item_name),
          estimated_budget = COALESCE(?, estimated_budget),
          actual_price = COALESCE(?, actual_price),
          estimated_purchase_date = COALESCE(?, estimated_purchase_date),
          purchased_date = COALESCE(?, purchased_date),
          installation_required = COALESCE(?, installation_required),
          scheduled_installation_date = COALESCE(?, scheduled_installation_date),
          vendor_id = COALESCE(?, vendor_id),
          tags = COALESCE(?, tags),
          notes = COALESCE(?, notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(item_name, estimated_budget, actual_price, estimated_purchase_date, purchased_date, installation_required, scheduled_installation_date, vendor_id, tags, notes, id);
    
    const updated = db.prepare(`
      SELECT 
        p.*,
        ec.name as category_name,
        v.name as vendor_name
      FROM purchase_plans p
      LEFT JOIN expense_categories ec ON p.category_id = ec.id
      LEFT JOIN vendors v ON p.vendor_id = v.id
      WHERE p.id = ?
    `).get(id);
    
    // 计算预算对比
    updated.budget_diff = updated.actual_price - updated.estimated_budget;
    updated.budget_ratio = updated.estimated_budget ? ((updated.actual_price / updated.estimated_budget) * 100).toFixed(2) : null;
    
    res.json({ success: true, data: updated, message: '购买计划更新成功' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/purchase-plans/:id - 删除购买计划
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    db.prepare('DELETE FROM purchase_plans WHERE id = ?').run(id);
    res.json({ success: true, message: '购买计划删除成功' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
