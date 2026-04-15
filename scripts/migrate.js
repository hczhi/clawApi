const path = require('path');
const { initializeDatabase, closeDatabase, getDB } = require('../src/database');

async function migrate() {
  console.log('🚀 开始执行数据库迁移脚本...');
  
  try {
    // 1. 初始化数据库连接
    await initializeDatabase();
    const db = getDB();
    
    if (!db) {
      throw new Error('无法获取数据库实例');
    }
    
    console.log('✅ 成功连接到数据库');
    
    // 2. 检查 memos 表是否存在
    const checkTableSql = "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('memos', 'schedules');";
    const result = db.exec(checkTableSql);
    
    const existingTables = result && result.length > 0 ? result[0].values.map(row => row[0]) : [];
    
    if (!existingTables.includes('memos')) {
      console.log('🔨 检测到 memos 表不存在，正在创建...');
      db.run(`
        CREATE TABLE IF NOT EXISTS memos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            content TEXT,
            tags TEXT,
            image_urls TEXT,
            link_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ memos 表创建成功！');
    } else {
      console.log('ℹ️ memos 表已存在，无需迁移。');
    }

    if (!existingTables.includes('schedules')) {
      console.log('🔨 检测到 schedules 表不存在，正在创建...');
      db.run(`
        CREATE TABLE IF NOT EXISTS schedules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            start_date DATE NOT NULL,
            end_date DATE,
            type TEXT DEFAULT 'custom',
            related_id INTEGER,
            color TEXT,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ schedules 表创建成功！');
    } else {
      console.log('ℹ️ schedules 表已存在，无需迁移。');
    }

    // 3. 检查 expenses 表是否缺少 decoration_area 字段
    const checkColumnSql = "PRAGMA table_info(expenses);";
    const columnResult = db.exec(checkColumnSql);
    const hasDecorationArea = columnResult && columnResult.length > 0 && columnResult[0].values.some(row => row[1] === 'decoration_area');
    
    if (!hasDecorationArea) {
      console.log('🔨 检测到 expenses 表缺少 decoration_area 字段，正在添加...');
      db.run("ALTER TABLE expenses ADD COLUMN decoration_area TEXT;");
      console.log('✅ expenses 表字段 decoration_area 添加成功！');
    } else {
      console.log('ℹ️ expenses 表已有 decoration_area 字段，无需修改。');
    }
    
  } catch (err) {
    console.error('❌ 迁移失败:', err);
  } finally {
    // 4. 关闭数据库连接并保存（非常重要，否则修改不会写入磁盘）
    console.log('💾 保存并关闭数据库连接...');
    closeDatabase();
    console.log('🏁 迁移脚本执行完毕');
  }
}

migrate();
