const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db } = require('../database');
const router = express.Router();

// 配置 multer 上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../data/image');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

/**
 * POST /api/purchase-plans/upload - 上传购买清单相关图片
 */
router.post('/upload', upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: '没有上传任何文件' });
    }
    
    const fileUrls = req.files.map(file => `/data/image/${file.filename}`);
    
    res.json({ success: true, data: { urls: fileUrls }, message: '图片上传成功' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/purchase-plans - 获取购买计划列表
 */
router.get('/', (req, res) => {
  try {
    const { category_id, decoration_area, status, purchase_method, search, page = 1, limit = 20 } = req.query;
    
    let sql = `
      SELECT *
      FROM purchase_plans p
      WHERE 1=1
    `;
    const params = [];
    
    if (category_id) {
      sql += ' AND p.category_id = ?';
      params.push(category_id);
    }
    if (decoration_area) {
      sql += ' AND p.decoration_area = ?';
      params.push(decoration_area);
    }
    if (status) {
      sql += ' AND p.status = ?';
      params.push(status);
    }
    if (purchase_method) {
      sql += ' AND p.purchase_method = ?';
      params.push(purchase_method);
    }
    if (search) {
      sql += ' AND (item_name LIKE ? OR notes LIKE ? OR merchant_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    // 分页
    const offset = (page - 1) * parseInt(limit);
    sql += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    
    const plans = db.all(sql, params);
    
    // 总数统计
    let countSql = 'SELECT COUNT(*) as total FROM purchase_plans p WHERE 1=1';
    const countParams = [];
    if (category_id) { countSql += ' AND p.category_id = ?'; countParams.push(category_id); }
    if (decoration_area) { countSql += ' AND p.decoration_area = ?'; countParams.push(decoration_area); }
    if (status) { countSql += ' AND p.status = ?'; countParams.push(status); }
    if (purchase_method) { countSql += ' AND p.purchase_method = ?'; countParams.push(purchase_method); }
    if (search) { countSql += ' AND (p.item_name LIKE ? OR p.merchant_name LIKE ?)'; countParams.push(`%${search}%`, `%${search}%`); }
    
    const countResult = db.get(countSql, countParams);
    const total = countResult ? countResult.total : 0;
    
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
    const plan = db.get(`
      SELECT *
      FROM purchase_plans p
      WHERE p.id = ?
    `, [req.params.id]);
    
    if (!plan) {
      return res.status(404).json({ success: false, error: '购买计划不存在' });
    }
    
    // 计算预算对比
    plan.budget_diff = (plan.actual_price || 0) - plan.estimated_budget;
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
    const { item_name, category_id, purchase_method, decoration_area, estimated_budget, actual_price, merchant_name, product_link, status, notes, image_urls } = req.body;
    
    if (!item_name || !category_id) {
      return res.status(400).json({ success: false, error: '物品名称和分类不能为空' });
    }
    
    const result = db.run(`
      INSERT INTO purchase_plans 
      (item_name, category_id, purchase_method, decoration_area, estimated_budget, actual_price, merchant_name, product_link, status, notes, image_urls)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [item_name, category_id, purchase_method || '其他', decoration_area || null, estimated_budget || null, actual_price || null, merchant_name || null, product_link || null, status || '计划', notes || null, image_urls || null]);
    
    const newPlan = db.get(`
      SELECT *
      FROM purchase_plans p
      WHERE p.id = ?
    `, [result.lastInsertRowid]);
    
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
    const { item_name, category_id, purchase_method, decoration_area, estimated_budget, actual_price, merchant_name, product_link, status, notes, image_urls } = req.body;
    
    const existing = db.get('SELECT * FROM purchase_plans WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: '购买计划不存在' });
    }
    
    db.run(`
      UPDATE purchase_plans 
      SET item_name = COALESCE(?, item_name),
          category_id = COALESCE(?, category_id),
          purchase_method = COALESCE(?, purchase_method),
          decoration_area = COALESCE(?, decoration_area),
          estimated_budget = COALESCE(?, estimated_budget),
          actual_price = COALESCE(?, actual_price),
          merchant_name = COALESCE(?, merchant_name),
          product_link = COALESCE(?, product_link),
          status = COALESCE(?, status),
          notes = COALESCE(?, notes),
          image_urls = COALESCE(?, image_urls),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [item_name, category_id, purchase_method, decoration_area, estimated_budget, actual_price, merchant_name, product_link, status, notes, image_urls, id]);
    
    const updated = db.get(`
      SELECT *
      FROM purchase_plans p
      WHERE p.id = ?
    `, [id]);
    
    // 计算预算对比
    updated.budget_diff = (updated.actual_price || 0) - updated.estimated_budget;
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
    
    db.run('DELETE FROM purchase_plans WHERE id = ?', [id]);
    res.json({ success: true, message: '购买计划删除成功' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;