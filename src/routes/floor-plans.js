const express = require('express');
const { db } = require('../database');
const router = express.Router();

/**
 * GET /api/floor-plans - 获取最新的户型图数据
 */
router.get('/', (req, res) => {
  try {
    const result = db.get('SELECT * FROM floor_plans ORDER BY id DESC LIMIT 1');
    
    if (!result) {
      return res.json({ success: true, data: null });
    }
    
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/floor-plans - 保存/更新户型图数据
 */
router.post('/', (req, res) => {
  try {
    const { name, grid_data, bg_image_url, bg_config } = req.body;
    
    const existing = db.get('SELECT id FROM floor_plans ORDER BY id DESC LIMIT 1');
    
    if (existing) {
      db.run(
        'UPDATE floor_plans SET name = ?, grid_data = ?, bg_image_url = ?, bg_config = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name || '我的家', grid_data || null, bg_image_url || null, bg_config || null, existing.id]
      );
      
      const updated = db.get('SELECT * FROM floor_plans WHERE id = ?', [existing.id]);
      res.json({ success: true, data: updated, message: '户型图已更新' });
    } else {
      const result = db.run(
        'INSERT INTO floor_plans (name, grid_data, bg_image_url, bg_config) VALUES (?, ?, ?, ?)',
        [name || '我的家', grid_data || null, bg_image_url || null, bg_config || null]
      );
      
      const newPlan = db.get('SELECT * FROM floor_plans WHERE id = ?', [result.lastInsertRowid]);
      res.json({ success: true, data: newPlan, message: '户型图已创建' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;