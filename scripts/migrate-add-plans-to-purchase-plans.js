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
    console.log('Adding plans and selected_plan_id to purchase_plans...');
    try {
      db.run(`ALTER TABLE purchase_plans ADD COLUMN plans TEXT DEFAULT '[]';`);
      console.log('Added plans to purchase_plans');
    } catch (err) {
      if (err.message.includes('duplicate column name')) {
        console.log('Column plans already exists');
      } else {
        throw err;
      }
    }

    try {
      db.run(`ALTER TABLE purchase_plans ADD COLUMN selected_plan_id TEXT;`);
      console.log('Added selected_plan_id to purchase_plans');
    } catch (err) {
      if (err.message.includes('duplicate column name')) {
        console.log('Column selected_plan_id already exists');
      } else {
        throw err;
      }
    }
    
    // Create initial plan for existing items
    const items = db.exec("SELECT id, item_name, actual_price, merchant_name, purchase_method, product_link, notes, image_urls FROM purchase_plans");
    if (items[0]) {
      const columns = items[0].columns;
      const rows = items[0].values;
      for (const row of rows) {
        const item = {};
        columns.forEach((col, i) => item[col] = row[i]);
        
        // If it doesn't have plans yet, create one
        const planId = "plan_" + Date.now() + "_" + item.id;
        const initialPlan = [{
          id: planId,
          name: "默认方案",
          price: item.actual_price,
          merchant_name: item.merchant_name,
          purchase_method: item.purchase_method || '其他',
          product_link: item.product_link,
          notes: item.notes,
          image_urls: item.image_urls || '[]'
        }];
        
        db.run("UPDATE purchase_plans SET plans = ?, selected_plan_id = ? WHERE id = ? AND (plans IS NULL OR plans = '[]')", 
               [JSON.stringify(initialPlan), planId, item.id]);
      }
      console.log('Migrated existing purchase_plans to have an initial plan.');
    }
    
    const data = db.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
    console.log('Migration successful.');
  } catch (e) {
    console.error('Migration failed:', e);
  }
}

migrate();