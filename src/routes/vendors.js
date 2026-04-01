const express = require('express');
const { db } = require('../database');
const router = express.Router();

/**
 * GET /api/vendors - 获取供应商列表
 */
router.get('/', (req, res) => {
  try {
    const { type, status, search } = req.query;
    
    let sql = 'SELECT * FROM vendors WHERE 1=1';
    const params = [];
    
    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (search) {
      sql += ' AND (name LIKE ? OR company_name LIKE ? OR contact_person LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    sql += ' ORDER BY rating DESC, id DESC';
    
    const vendors = db.prepare(sql).all(...params);
    res.json({ success: true, data: vendors });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/vendors/:id - 获取单个供应商详情
 */
router.get('/:id', (req, res) => {
  try {
    const vendor = db.prepare('SELECT * FROM vendors WHERE id = ?').get(req.params.id);
    
    if (!vendor) {
      return res.status(404).json({ success: false, error: '供应商不存在' });
    }
    
    // 关联查询该供应商的报价数量
    const quoteCount = db.prepare('SELECT COUNT(*) as count FROM quotes WHERE vendor_id = ?').get(vendor.id);
    vendor.quote_count = quoteCount.count;
    
    res.json({ success: true, data: vendor });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/vendors - 创建新供应商
 */
router.post('/', (req, res) => {
  try {
    const { name, type, contact_person, phone, email, address, company_name, business_license, rating, notes } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, error: '供应商名称不能为空' });
    }
    
    const result = db.prepare(`
      INSERT INTO vendors 
      (name, type, contact_person, phone, email, address, company_name, business_license, rating, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, type || null, contact_person || null, phone || null, email || null, address || null, company_name || null, business_license || null, rating || null, notes || null);
    
    const newVendor = db.prepare('SELECT * FROM vendors WHERE id = ?').get(result.lastInsertRowid);
    
    res.status(201).json({ success: true, data: newVendor, message: '供应商创建成功' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/vendors/:id - 更新供应商
 */
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM vendors WHERE id = ?').get(id);
    
    if (!existing) {
      return res.status(404).json({ success: false, error: '供应商不存在' });
    }
    
    const { name, type, contact_person, phone, email, address, company_name, business_license, rating, status, notes } = req.body;
    
    db.prepare(`
      UPDATE vendors 
      SET name = COALESCE(?, name),
          type = COALESCE(?, type),
          contact_person = COALESCE(?, contact_person),
          phone = COALESCE(?, phone),
          email = COALESCE(?, email),
          address = COALESCE(?, address),
          company_name = COALESCE(?, company_name),
          business_license = COALESCE(?, business_license),
          rating = COALESCE(?, rating),
          status = COALESCE(?, status),
          notes = COALESCE(?, notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, type, contact_person, phone, email, address, company_name, business_license, rating, status, notes, id);
    
    const updated = db.prepare('SELECT * FROM vendors WHERE id = ?').get(id);
    res.json({ success: true, data: updated, message: '供应商更新成功' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/vendors/:id - 删除供应商
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查是否有报价记录
    const quotes = db.prepare('SELECT COUNT(*) as count FROM quotes WHERE vendor_id = ?').get(id);
    if (quotes.count > 0) {
      return res.status(400).json({ success: false, error: '存在关联的报价记录，只能设置为 inactive 状态' });
    }
    
    db.prepare('DELETE FROM vendors WHERE id = ?').run(id);
    res.json({ success: true, message: '供应商删除成功' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
