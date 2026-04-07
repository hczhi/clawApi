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
  
  const tables = [
    'quotes',
    'expenses',
    'design_concepts',
    'purchase_plans',
    'renovation_timeline',
    'renovation_results'
  ];

  try {
    for (const table of tables) {
      console.log(`Adding decoration_area to ${table}...`);
      try {
        db.run(`ALTER TABLE ${table} ADD COLUMN decoration_area TEXT CHECK(decoration_area IN ('客厅', '卧室', '卫浴', '厨房', '阳台', '过道'));`);
        console.log(`Added decoration_area to ${table}`);
      } catch (err) {
        if (err.message.includes('duplicate column name')) {
          console.log(`Column already exists in ${table}`);
        } else {
          console.error(`Failed for ${table}:`, err.message);
        }
      }
    }
    
    const data = db.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
    console.log('Migration successful.');
  } catch (e) {
    console.error('Migration failed:', e);
  }
}

migrate();
