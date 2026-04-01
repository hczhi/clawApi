const express = require('express');
const { getDB } = require('../database');
const router = express.Router();

/**
 * GET /api/health - 健康检查
 */
router.get('/', (req, res) => {
  try {
    // 测试数据库连接
    const db = getDB();
    if (!db) {
      return res.status(503).json({
        status: 'error',
        message: '数据库未初始化',
      });
    }
    db.run('SELECT 1');
    
    res.json({
      status: 'ok',
      message: '装修管理系统 API 运行正常',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: 'connected',
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: '系统异常',
      error: err.message,
    });
  }
});

/**
 * GET /api/docs - API 文档首页
 */
router.get('/docs', (req, res) => {
  res.json({
    title: '装修管理系统 API 文档',
    version: '1.0.0',
    baseUrl: '/',
    endpoints: {
      health: '/api/health',
      categories: {
        list: 'GET /api/categories',
        get: 'GET /api/categories/:id',
        create: 'POST /api/categories',
        update: 'PUT /api/categories/:id',
        delete: 'DELETE /api/categories/:id',
      },
      vendors: {
        list: 'GET /api/vendors',
        get: 'GET /api/vendors/:id',
        create: 'POST /api/vendors',
        update: 'PUT /api/vendors/:id',
        delete: 'DELETE /api/vendors/:id',
      },
      quotes: {
        list: 'GET /api/quotes',
        get: 'GET /api/quotes/:id',
        create: 'POST /api/quotes',
        update: 'PUT /api/quotes/:id',
        delete: 'DELETE /api/quotes/:id',
      },
      expenses: {
        list: 'GET /api/expenses',
        get: 'GET /api/expenses/:id',
        create: 'POST /api/expenses',
        update: 'PUT /api/expenses/:id',
        delete: 'DELETE /api/expenses/:id',
        stats: 'GET /api/expenses/stats/overview',
      },
      designConceps: {
        list: 'GET /api/design-concepts',
        get: 'GET /api/design-concepts/:id',
        create: 'POST /api/design-concepts',
        update: 'PUT /api/design-concepts/:id',
        delete: 'DELETE /api/design-concepts/:id',
      },
      purchasePlans: {
        list: 'GET /api/purchase-plans',
        get: 'GET /api/purchase-plans/:id',
        create: 'POST /api/purchase-plans',
        update: 'PUT /api/purchase-plans/:id',
        delete: 'DELETE /api/purchase-plans/:id',
      },
      renovationResults: {
        list: 'GET /api/renovation-results',
        get: 'GET /api/renovation-results/:id',
        create: 'POST /api/renovation-results',
        update: 'PUT /api/renovation-results/:id',
        delete: 'DELETE /api/renovation-results/:id',
      },
      timeline: {
        list: 'GET /api/timeline',
        get: 'GET /api/timeline/:id',
        create: 'POST /api/timeline',
        update: 'PUT /api/timeline/:id',
        delete: 'DELETE /api/timeline/:id',
        stats: 'GET /api/timeline/stats',
      },
      spaces: {
        list: 'GET /api/spaces',
        get: 'GET /api/spaces/:id',
        create: 'POST /api/spaces',
        update: 'PUT /api/spaces/:id',
        delete: 'DELETE /api/spaces/:id',
      },
      reminders: {
        list: 'GET /api/reminders',
        upcoming: 'GET /api/reminders/upcoming',
        get: 'GET /api/reminders/:id',
        create: 'POST /api/reminders',
        update: 'PUT /api/reminders/:id',
        delete: 'DELETE /api/reminders/:id',
      },
    },
  });
});

module.exports = router;
