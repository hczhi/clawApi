const express = require('express');
const { db } = require('../database');
const router = express.Router();

/**
 * GET /api/memos - 获取备忘录列表
 */
router.get('/', (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    
    let sql = 'SELECT * FROM memos WHERE 1=1';
    const params = [];
    
    if (search) {
      sql += ' AND (title LIKE ? OR content LIKE ? OR tags LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    // 分页
    const offset = (page - 1) * parseInt(limit);
    sql += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    
    const memos = db.all(sql, params);
    
    // 总数统计
    let countSql = 'SELECT COUNT(*) as total FROM memos WHERE 1=1';
    const countParams = [];
    if (search) { 
      countSql += ' AND (title LIKE ? OR content LIKE ? OR tags LIKE ?)'; 
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`); 
    }
    
    const countResult = db.get(countSql, countParams);
    const total = countResult ? countResult.total : 0;
    
    // 解析 JSON 字段
    const formattedMemos = memos.map(memo => ({
      ...memo,
      tags: memo.tags ? JSON.parse(memo.tags) : [],
      image_urls: memo.image_urls ? JSON.parse(memo.image_urls) : []
    }));

    res.json({ success: true, data: formattedMemos, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/memos/:id - 获取单个备忘录详情
 */
router.get('/:id', (req, res) => {
  try {
    const memo = db.get('SELECT * FROM memos WHERE id = ?', [req.params.id]);
    
    if (!memo) {
      return res.status(404).json({ success: false, error: '备忘录不存在' });
    }
    
    memo.tags = memo.tags ? JSON.parse(memo.tags) : [];
    memo.image_urls = memo.image_urls ? JSON.parse(memo.image_urls) : [];
    
    res.json({ success: true, data: memo });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/memos - 创建新备忘录
 */
router.post('/', (req, res) => {
  try {
    let { title, content, tags = [], image_urls = [], link_url } = req.body;
    
    // Ensure image_urls is an array before stringifying if it's passed as a string
    if (typeof image_urls === 'string') {
      try {
        image_urls = JSON.parse(image_urls);
      } catch (e) {
        image_urls = [];
      }
    }
    
    const result = db.run(`
      INSERT INTO memos (title, content, tags, image_urls, link_url)
      VALUES (?, ?, ?, ?, ?)
    `, [
      title || null,
      content || null, 
      JSON.stringify(tags), 
      JSON.stringify(image_urls), 
      link_url || null
    ]);
    
    const newMemo = db.get('SELECT * FROM memos WHERE id = ?', [result.lastInsertRowid]);
    newMemo.tags = newMemo.tags ? JSON.parse(newMemo.tags) : [];
    newMemo.image_urls = newMemo.image_urls ? JSON.parse(newMemo.image_urls) : [];
    
    res.status(201).json({ success: true, data: newMemo, message: '备忘录创建成功' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/memos/:id - 更新备忘录
 */
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    let { title, content, tags, image_urls, link_url } = req.body;
    
    const existing = db.get('SELECT * FROM memos WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: '备忘录不存在' });
    }
    
    const updateFields = [];
    const params = [];
    
    if (title !== undefined) { updateFields.push('title = ?'); params.push(title); }
    if (content !== undefined) { updateFields.push('content = ?'); params.push(content); }
    if (tags !== undefined) { updateFields.push('tags = ?'); params.push(JSON.stringify(tags)); }
    if (image_urls !== undefined) { 
      if (typeof image_urls === 'string') {
        try {
          image_urls = JSON.parse(image_urls);
        } catch (e) {
          image_urls = [];
        }
      }
      updateFields.push('image_urls = ?'); 
      params.push(JSON.stringify(image_urls)); 
    }
    if (link_url !== undefined) { updateFields.push('link_url = ?'); params.push(link_url); }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    
    db.run(`UPDATE memos SET ${updateFields.join(', ')} WHERE id = ?`, params);
    
    const updatedMemo = db.get('SELECT * FROM memos WHERE id = ?', [id]);
    updatedMemo.tags = updatedMemo.tags ? JSON.parse(updatedMemo.tags) : [];
    updatedMemo.image_urls = updatedMemo.image_urls ? JSON.parse(updatedMemo.image_urls) : [];
    
    res.json({ success: true, data: updatedMemo, message: '备忘录更新成功' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/memos/:id - 删除备忘录
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const existing = db.get('SELECT * FROM memos WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: '备忘录不存在' });
    }
    
    db.run('DELETE FROM memos WHERE id = ?', [id]);
    
    res.json({ success: true, message: '备忘录删除成功' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;