const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

async function migrate() {
  const dbPath = path.join(__dirname, '../data/renovation.db');
  const wasmPath = path.join(__dirname, '../node_modules/sql.js/dist/sql-wasm.wasm');
  
  const SQL = await initSqlJs({
    wasmBinary: fs.readFileSync(wasmPath)
  });
  
  if (!fs.existsSync(dbPath)) {
    console.log('Database not found, skipping migration.');
    return;
  }
  
  const buffer = fs.readFileSync(dbPath);
  const db = new SQL.Database(buffer);
  
  try {
    db.run(`
      CREATE TABLE IF NOT EXISTS design_concepts_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          style TEXT,
          category TEXT,
          source_type TEXT CHECK(source_type IN ('xiaohongshu', 'haozhu', 'instagram', 'pinterest', 'taobao', 'jingdong', 'douyin', 'other')),
          image_urls TEXT,
          reference_link TEXT,
          budget_min DECIMAL(12,2),
          budget_max DECIMAL(12,2),
          priority TEXT CHECK(priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
          matched_spaces TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          tags TEXT,
          notes TEXT
      );
    `);
    
    db.run(`INSERT INTO design_concepts_new SELECT * FROM design_concepts;`);
    db.run(`DROP TABLE design_concepts;`);
    db.run(`ALTER TABLE design_concepts_new RENAME TO design_concepts;`);
    
    const data = db.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
    console.log('Migration successful.');
  } catch (e) {
    console.error('Migration failed:', e);
  }
}

migrate();
