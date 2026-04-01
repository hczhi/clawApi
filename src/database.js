const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

// 确保数据目录存在
const dbDir = path.join(__dirname, '../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// 获取数据库路径
const dbPath = process.env.DB_PATH || path.join(dbDir, 'renovation.db');

let dbInstance = null;

/**
 * 初始化数据库连接
 */
async function initializeDatabase() {
  console.log('📦 正在初始化 SQL.js...');
  
  // 在 Node.js 21+ 中，sql.js 可能会因为 URL 解析绝对路径失败而报错
  // 手动指定 locateFile 并确保它返回正确的路径，或者对于 Node 环境，
  // 某些情况下需要将路径转换为 file:// 协议，或者干脆手动加载 WASM 二进制文件
  const wasmPath = path.join(__dirname, '../node_modules/sql.js/dist/sql-wasm.wasm');
  
  const SQL = await initSqlJs({
    // 使用 wasmBinary 直接加载以避免 fetch 时的 URL 解析错误
    wasmBinary: fs.readFileSync(wasmPath)
  });
  
  // 尝试加载现有数据库
  if (fs.existsSync(dbPath)) {
    console.log('🔄 加载现有数据库...');
    const buffer = fs.readFileSync(dbPath);
    dbInstance = new SQL.Database(buffer);
  } else {
    console.log('➕ 创建新数据库...');
    dbInstance = new SQL.Database();
  }
  
  console.log(`✅ 数据库连接成功：${dbPath}`);
  return dbInstance;
}

/**
 * 获取数据库实例（必须等初始化完成后调用）
 */
function getDB() {
  return dbInstance;
}

/**
 * 初始化数据库结构
 */
function initializeDatabaseSchema() {
  if (!dbInstance) throw new Error('数据库未初始化');
  
  console.log('🔧 正在初始化数据库结构...');
  
  const schemaPath = path.join(__dirname, '../src/schema.sql');
  
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    // 移除注释行和空行
    const lines = schema.split('\n')
      .map(line => line.trim())
      .filter(line => !line.startsWith('#') && !line.startsWith('--'))
      .filter(line => line.length > 0);
    
    const cleanSchema = lines.join('\n');
    
    try {
      dbInstance.run(cleanSchema);
      console.log('✅ 数据库结构初始化完成！');
    } catch (err) {
      console.error('❌ 创建表失败:', err.message);
    }
  } else {
    console.warn('⚠️ 未找到 schema.sql 文件');
  }
}

/**
 * 注册所有辅助视图（如果尚未创建）
 */
function registerViews() {
  if (!dbInstance) throw new Error('数据库未初始化');
  
  const viewsSQL = `
    CREATE VIEW IF NOT EXISTS expense_overview AS
    SELECT 
        ec.name as category,
        COUNT(e.id) as total_expenses,
        SUM(e.amount) as total_amount,
        AVG(e.amount) as avg_amount,
        MAX(e.payment_date) as last_payment_date
    FROM expenses e
    JOIN expense_categories ec ON e.category_id = ec.id
    WHERE e.status = 'paid'
    GROUP BY ec.id;

    CREATE VIEW IF NOT EXISTS timeline_summary AS
    SELECT 
        phase,
        COUNT(*) as total_tasks,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tasks,
        ROUND(100.0 * SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) / COUNT(*), 2) as completion_rate
    FROM renovation_timeline
    GROUP BY phase;

    CREATE VIEW IF NOT EXISTS budget_breakeven_analysis AS
    SELECT 
        p.item_name,
        p.estimated_budget,
        COALESCE(p.actual_price, 0) as actual_price,
        COALESCE(p.actual_price, 0) - p.estimated_budget as over_under_budget,
        CASE 
            WHEN COALESCE(p.actual_price, 0) > p.estimated_budget THEN '超支'
            WHEN COALESCE(p.actual_price, 0) < p.estimated_budget THEN '节省'
            ELSE '持平'
        END as status_text
    FROM purchase_plans p
    WHERE p.actual_price IS NOT NULL;
  `;

  try {
    dbInstance.run(viewsSQL);
    console.log('✅ 辅助视图已创建或已存在');
  } catch (err) {
    console.error('❌ 创建视图失败:', err.message);
  }
}

/**
 * 保存数据库到文件
 */
function saveDatabase() {
  if (!dbInstance) return;
  
  const data = dbInstance.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
  console.log('💾 数据库已保存到文件');
}

/**
 * 关闭数据库连接
 */
function closeDatabase() {
  saveDatabase();
  if (dbInstance) {
    dbInstance.close();
  }
  console.log('🔒 数据库连接已关闭');
}

/**
 * 将 sql.js 的执行结果转换为对象数组
 */
function formatResult(result) {
  if (!result || !result[0]) return [];
  const { columns, values } = result[0];
  return values.map(row => {
    const obj = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return obj;
  });
}

/**
 * 运行 SQL 语句并绑定参数 (用于 INSERT/UPDATE/DELETE)
 */
function run(sql, params = []) {
  if (!dbInstance) throw new Error('数据库未初始化');
  
  const stmt = dbInstance.prepare(sql);
  stmt.bind(params);
  stmt.step();
  stmt.free();
  
  // 对于插入操作，返回最后插入的 ID
  if (sql.trim().toUpperCase().startsWith('INSERT')) {
    const res = dbInstance.exec('SELECT last_insert_rowid()');
    return { lastInsertRowid: res[0].values[0][0] };
  }
  return { changes: dbInstance.getRowsModified() };
}

/**
 * 执行查询并返回所有结果 (用于 SELECT)
 */
function all(sql, params = []) {
  if (!dbInstance) throw new Error('数据库未初始化');
  
  const stmt = dbInstance.prepare(sql);
  stmt.bind(params);
  
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

/**
 * 执行查询并返回第一个结果 (用于 SELECT)
 */
function get(sql, params = []) {
  if (!dbInstance) throw new Error('数据库未初始化');
  
  const stmt = dbInstance.prepare(sql);
  stmt.bind(params);
  
  let result = null;
  if (stmt.step()) {
    result = stmt.getAsObject();
  }
  stmt.free();
  return result;
}

module.exports = {
  getDB,
  initializeDatabase,
  initializeDatabaseSchema,
  registerViews,
  closeDatabase,
  formatResult,
  run,
  all,
  get,
  db: {
    run,
    all,
    get,
    prepare: (sql) => ({
      all: (...params) => all(sql, params),
      get: (...params) => get(sql, params),
      run: (...params) => run(sql, params)
    })
  }
};
