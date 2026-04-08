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
 * POST /api/expenses/upload - 上传账单相关图片
 */
router.post('/upload', upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: '没有上传任何文件' });
    }
    
    // 使用相对路径作为 URL 返回给前端，匹配 server.js 中的配置
    const fileUrls = req.files.map(file => `/data/image/${file.filename}`);
    
    res.json({ success: true, data: { urls: fileUrls }, message: '图片上传成功' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/expenses - 获取费用清单列表
 */
router.get('/', (req, res) => {
  try {
    const { category_id, vendor_id, payment_method, status, tags, date_from, date_to, search, decoration_area, page = 1, limit = 20 } = req.query;
    
    let sql = `
      SELECT 
        e.*,
        ec.name as category_name,
        v.name as vendor_name
      FROM expenses e
      LEFT JOIN expense_categories ec ON e.category_id = ec.id
      LEFT JOIN vendors v ON e.vendor_id = v.id
      WHERE 1=1
    `;
    const params = [];
    
    if (category_id) {
      sql += ' AND e.category_id = ?';
      params.push(category_id);
    }
    if (vendor_id) {
      sql += ' AND e.vendor_id = ?';
      params.push(vendor_id);
    }
    if (payment_method) {
      sql += ' AND e.payment_method = ?';
      params.push(payment_method);
    }
    if (status) {
      sql += ' AND e.status = ?';
      params.push(status);
    }
    if (tags) {
      sql += ' AND e.tags LIKE ?';
      params.push(`%${tags}%`);
    }
    if (decoration_area) {
      sql += ' AND e.decoration_area = ?';
      params.push(decoration_area);
    }
    if (date_from) {
      sql += ' AND e.payment_date >= ?';
      params.push(date_from);
    }
    if (date_to) {
      sql += ' AND e.payment_date <= ?';
      params.push(date_to);
    }
    if (search) {
      sql += ' AND (e.title LIKE ? OR e.notes LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    sql += ' ORDER BY e.payment_date DESC, e.created_at DESC';
    
    // 分页
    const offset = (page - 1) * parseInt(limit);
    sql += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    
    const expenses = db.all(sql, params);
    
    // 总数统计
    let countSql = `SELECT COUNT(*) as total FROM expenses WHERE 1=1`;
    const countParams = [];
    if (category_id) { countSql += ' AND category_id = ?'; countParams.push(category_id); }
    if (vendor_id) { countSql += ' AND vendor_id = ?'; countParams.push(vendor_id); }
    if (status) { countSql += ' AND status = ?'; countParams.push(status); }
    if (decoration_area) { countSql += ' AND decoration_area = ?'; countParams.push(decoration_area); }
    if (date_from) { countSql += ' AND payment_date >= ?'; countParams.push(date_from); }
    if (date_to) { countSql += ' AND payment_date <= ?'; countParams.push(date_to); }
    if (search) { countSql += ' AND (title LIKE ? OR notes LIKE ?)'; countParams.push(`%${search}%`, `%${search}%`); }
    
    const countResult = db.get(countSql, countParams);
    const total = countResult ? countResult.total : 0;
    
    res.json({ success: true, data: expenses, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/expenses/:id - 获取单个费用详情
 */
router.get('/:id', (req, res) => {
  try {
    const expense = db.get(`
      SELECT 
        e.*,
        ec.name as category_name,
        v.name as vendor_name,
        q.project_name as quote_project
      FROM expenses e
      LEFT JOIN expense_categories ec ON e.category_id = ec.id
      LEFT JOIN vendors v ON e.vendor_id = v.id
      LEFT JOIN quotes q ON e.quote_id = q.id
      WHERE e.id = ?
    `, [req.params.id]);
    
    if (!expense) {
      return res.status(404).json({ success: false, error: '费用记录不存在' });
    }
    
    res.json({ success: true, data: expense });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/expenses - 创建新费用
 */
router.post('/', (req, res) => {
  try {
    const { category_id, quote_id, title, amount, payment_method, payer_names, payment_date, receipt_file_path, image_urls, vendor_id, reimbursement_status, tags, notes, decoration_area } = req.body;
    
    if (!category_id || !title || !amount || !payment_date) {
      return res.status(400).json({ success: false, error: '分类 ID、标题、金额、支付日期不能为空' });
    }
    
    // 验证外键存在
    if (category_id && !db.get('SELECT id FROM expense_categories WHERE id = ?', [category_id])) {
      return res.status(400).json({ success: false, error: '分类不存在' });
    }
    if (quote_id && !db.get('SELECT id FROM quotes WHERE id = ?', [quote_id])) {
      return res.status(400).json({ success: false, error: '报价单不存在' });
    }
    if (vendor_id && !db.get('SELECT id FROM vendors WHERE id = ?', [vendor_id])) {
      return res.status(400).json({ success: false, error: '供应商不存在' });
    }
    
    const result = db.run(`
      INSERT INTO expenses (category_id, quote_id, title, amount, payment_method, payer_names, payment_date, receipt_file_path, image_urls, vendor_id, reimbursement_status, tags, notes, decoration_area)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [category_id, quote_id || null, title, amount, payment_method || 'cash', payer_names || null, payment_date, receipt_file_path || null, image_urls || null, vendor_id || null, reimbursement_status || 'not_required', tags || null, notes || null, decoration_area || null]);
    
    const newExpense = db.get(`
      SELECT 
        e.*,
        ec.name as category_name,
        v.name as vendor_name
      FROM expenses e
      LEFT JOIN expense_categories ec ON e.category_id = ec.id
      LEFT JOIN vendors v ON e.vendor_id = v.id
      WHERE e.id = ?
    `, [result.lastInsertRowid]);
    
    res.status(201).json({ success: true, data: newExpense, message: '费用记录创建成功' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/expenses/:id - 更新费用
 */
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, quote_id, title, amount, payment_method, payer_names, payment_date, receipt_file_path, image_urls, vendor_id, reimbursement_status, tags, notes, decoration_area, status } = req.body;
    
    const existing = db.get('SELECT * FROM expenses WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: '费用记录不存在' });
    }
    
    db.run(`
      UPDATE expenses 
      SET category_id = COALESCE(?, category_id),
          quote_id = COALESCE(?, quote_id),
          title = COALESCE(?, title),
          amount = COALESCE(?, amount),
          payment_method = COALESCE(?, payment_method),
          payer_names = COALESCE(?, payer_names),
          payment_date = COALESCE(?, payment_date),
          receipt_file_path = COALESCE(?, receipt_file_path),
          image_urls = COALESCE(?, image_urls),
          vendor_id = COALESCE(?, vendor_id),
          reimbursement_status = COALESCE(?, reimbursement_status),
          tags = COALESCE(?, tags),
          notes = COALESCE(?, notes),
          decoration_area = COALESCE(?, decoration_area),
          status = COALESCE(?, status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [category_id, quote_id, title, amount, payment_method, payer_names, payment_date, receipt_file_path, image_urls, vendor_id, reimbursement_status, tags, notes, decoration_area, status, id]);
    
    const updated = db.get(`
      SELECT 
        e.*,
        ec.name as category_name,
        v.name as vendor_name
      FROM expenses e
      LEFT JOIN expense_categories ec ON e.category_id = ec.id
      LEFT JOIN vendors v ON e.vendor_id = v.id
      WHERE e.id = ?
    `, [id]);
    
    res.json({ success: true, data: updated, message: '费用记录更新成功' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/expenses/:id - 删除费用
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    db.run('DELETE FROM expenses WHERE id = ?', [id]);
    res.json({ success: true, message: '费用记录删除成功' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/expenses/stats/overview - 获取费用总览统计
 */
router.get('/stats/overview', (req, res) => {
  try {
    const { from, to } = req.query;
    
    let sql = `
      SELECT 
        COUNT(*) as total_count,
        SUM(amount) as total_amount,
        AVG(amount) as avg_amount,
        MAX(payment_date) as last_payment_date
      FROM expenses 
      WHERE status = 'paid'
    `;
    const params = [];
    
    if (from) {
      sql += ' AND payment_date >= ?';
      params.push(from);
    }
    if (to) {
      sql += ' AND payment_date <= ?';
      params.push(to);
    }
    
    const stats = db.get(sql, params);
    
    // 按分类统计
    const byCategory = db.all(`
      SELECT 
        ec.name as category,
        COUNT(e.id) as count,
        SUM(e.amount) as amount
      FROM expenses e
      JOIN expense_categories ec ON e.category_id = ec.id
      WHERE e.status = 'paid'
      GROUP BY ec.id
      ORDER BY amount DESC
    `);

    res.json({ success: true, data: { stats, byCategory } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;