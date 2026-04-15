const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { initializeDatabase, initializeDatabaseSchema, registerViews, getDB } = require('./database');

// 加载环境变量
dotenv.config();

// 导入路由
const quotesRouter = require('./routes/quotes');
const expensesRouter = require('./routes/expenses');
const designConceptsRouter = require('./routes/design-concepts');
const purchasePlansRouter = require('./routes/purchase-plans');
const renovationResultsRouter = require('./routes/renovation-results');
const timelineRouter = require('./routes/timeline');
const spacesRouter = require('./routes/spaces');
const remindersRouter = require('./routes/reminders');
const vendorsRouter = require('./routes/vendors');
const categoriesRouter = require('./routes/categories');
const healthRouter = require('./routes/health');
const aiChatRouter = require('./routes/ai-chat');
const floorPlansRouter = require('./routes/floor-plans');
const memosRouter = require('./routes/memos');
const schedulesRouter = require('./routes/schedules');

// 初始化 Express 应用
const app = express();

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务（上传的文件）
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 静态文件服务（前端界面）
app.use(express.static(path.join(__dirname, '../public')));

// 静态文件服务（移动端应用）
app.use('/app', express.static(path.join(__dirname, '../public/app')));

// 静态文件服务（图片上传目录）
app.use('/data/image', express.static(path.join(__dirname, '../data/image')));

// 健康检查接口
app.use('/api/health', healthRouter);

// API 路由
app.use('/api/quotes', quotesRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/design-concepts', designConceptsRouter);
app.use('/api/purchase-plans', purchasePlansRouter);
app.use('/api/renovation-results', renovationResultsRouter);
app.use('/api/timeline', timelineRouter);
app.use('/api/spaces', spacesRouter);
app.use('/api/reminders', remindersRouter);
app.use('/api/vendors', vendorsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/ai-chat', aiChatRouter);
app.use('/api/floor-plans', floorPlansRouter);
app.use('/api/memos', memosRouter);
app.use('/api/schedules', schedulesRouter);

// 根路径欢迎
app.get('/', (req, res) => {
  res.json({
    message: '🦁 装修管理系统 API',
    version: '1.0.0',
    description: '房屋装修全周期管理 RESTful API',
    endpoints: {
      health: '/api/health',
      docs: '/api/docs',
      quotes: '/api/quotes',
      expenses: '/api/expenses',
      designConceps: '/api/design-concepts',
      purchasePlans: '/api/purchase-plans',
      renovationResults: '/api/renovation-results',
      timeline: '/api/timeline',
      spaces: '/api/spaces',
      reminders: '/api/reminders',
      vendors: '/api/vendors',
      categories: '/api/categories',
    },
  });
});

// 404 处理器
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', message: `Cannot ${req.method} ${req.url}` });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 启动服务器
async function startServer() {
  const PORT = process.env.PORT || 3000;
  
  try {
    await initializeDatabase();
    
    // 尝试初始化 schema
    try {
      const db = getDB();
      if (db) {
        const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name != 'sqlite_sequence';");
        if (!tables || !tables[0] || tables[0].values.length === 0) {
          console.log('🔧 检测到空数据库，正在初始化表结构...');
          initializeDatabaseSchema();
        } else {
          console.log('✅ 检测到已有表，跳过 schema 初始化');
        }
        
        registerViews();
      }
    } catch (dbErr) {
      console.warn('⚠️ 数据库初始化警告:', dbErr.message);
    }
    
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════╗
║  🦁 装修管理系统 API 启动成功！                          ║
║  📡 服务地址：http://localhost:${PORT}                 ║
║  🗄️ 数据库：./data/renovation.db                       ║
║  🌿 环境：${process.env.NODE_ENV || 'development'}          ║
╚════════════════════════════════════════════════════════╝
      `);
    });
  } catch (err) {
    console.error('❌ 启动失败:', err);
    process.exit(1);
  }
}

startServer().catch(err => {
  console.error('启动失败:', err);
  process.exit(1);
});

module.exports = app;
