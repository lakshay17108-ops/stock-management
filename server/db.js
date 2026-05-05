const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'stock.db'));

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    item_code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    unit_price REAL DEFAULT 0,
    stock_qty INTEGER DEFAULT 0,
    reorder_level INTEGER DEFAULT 10,
    status TEXT DEFAULT 'Active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_code TEXT NOT NULL,
    transaction_type TEXT NOT NULL CHECK(transaction_type IN ('Purchase','Sale','Broken','Production')),
    quantity INTEGER NOT NULL,
    unit_price REAL DEFAULT 0,
    total_amount REAL DEFAULT 0,
    supplier TEXT,
    service_charge REAL DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_code) REFERENCES items(item_code)
  );

  CREATE TABLE IF NOT EXISTS production_recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    finished_item_code TEXT NOT NULL,
    ingredient_item_code TEXT NOT NULL,
    quantity_required INTEGER NOT NULL,
    FOREIGN KEY (finished_item_code) REFERENCES items(item_code),
    FOREIGN KEY (ingredient_item_code) REFERENCES items(item_code)
  );
`);

// Seed demo data if tables are empty
const itemCount = db.prepare('SELECT COUNT(*) as count FROM items').get().count;

if (itemCount === 0) {
  const insertItem = db.prepare(`
    INSERT INTO items (item_code, name, category, unit_price, stock_qty, reorder_level, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertTransaction = db.prepare(`
    INSERT INTO transactions (item_code, transaction_type, quantity, unit_price, total_amount, supplier, service_charge, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertRecipe = db.prepare(`
    INSERT INTO production_recipes (finished_item_code, ingredient_item_code, quantity_required)
    VALUES (?, ?, ?)
  `);

  const seedItems = [
    ['RAW-001', 'Steel Rod (10mm)', 'Raw Materials', 45.00, 500, 50, 'Active'],
    ['RAW-002', 'Aluminum Sheet (2mm)', 'Raw Materials', 120.00, 300, 30, 'Active'],
    ['RAW-003', 'Copper Wire (1.5mm)', 'Raw Materials', 85.00, 200, 25, 'Active'],
    ['RAW-004', 'Rubber Gasket', 'Raw Materials', 12.50, 1000, 100, 'Active'],
    ['RAW-005', 'Plastic Granules (1kg)', 'Raw Materials', 35.00, 150, 20, 'Active'],
    ['COMP-001', 'Motor Assembly Unit', 'Components', 450.00, 75, 10, 'Active'],
    ['COMP-002', 'Circuit Board v2.1', 'Components', 280.00, 120, 15, 'Active'],
    ['COMP-003', 'LED Display Module', 'Components', 190.00, 60, 8, 'Active'],
    ['PROD-001', 'Industrial Fan Unit', 'Finished Goods', 1200.00, 45, 5, 'Active'],
    ['PROD-002', 'Control Panel Assembly', 'Finished Goods', 2500.00, 30, 5, 'Active'],
    ['PROD-003', 'Hydraulic Press Mini', 'Finished Goods', 8500.00, 12, 3, 'Active'],
    ['PACK-001', 'Cardboard Box (Large)', 'Packaging', 15.00, 800, 100, 'Active'],
    ['PACK-002', 'Bubble Wrap Roll (50m)', 'Packaging', 65.00, 40, 10, 'Active'],
    ['TOOL-001', 'Precision Drill Bit Set', 'Tools', 340.00, 8, 5, 'Active'],
    ['CONS-001', 'Lubricant Oil (5L)', 'Consumables', 220.00, 25, 5, 'Active'],
  ];

  const seedTransactions = [
    ['RAW-001', 'Purchase', 200, 45.00, 9000.00, 'SteelMax Industries', 0, 'Initial stock purchase'],
    ['RAW-001', 'Purchase', 300, 45.00, 13500.00, 'SteelMax Industries', 0, 'Restocking order'],
    ['RAW-002', 'Purchase', 300, 120.00, 36000.00, 'AluTech Supplies', 0, 'Bulk order Q1'],
    ['PROD-001', 'Sale', 5, 1200.00, 6000.00, null, 150.00, 'Client: Apex Manufacturing'],
    ['PROD-001', 'Sale', 3, 1200.00, 3600.00, null, 100.00, 'Client: Beta Corp'],
    ['PROD-002', 'Sale', 2, 2500.00, 5000.00, null, 200.00, 'Client: Gamma Systems'],
    ['COMP-003', 'Broken', 3, 190.00, 570.00, null, 0, 'Damaged in transit'],
    ['RAW-004', 'Broken', 15, 12.50, 187.50, null, 0, 'Warehouse water leak damage'],
    ['PROD-003', 'Sale', 1, 8500.00, 8500.00, null, 500.00, 'Client: Delta Industries'],
    ['COMP-002', 'Purchase', 50, 280.00, 14000.00, 'ChipWorks Ltd', 0, 'New batch arrival'],
    ['TOOL-001', 'Purchase', 8, 340.00, 2720.00, 'ToolPro Distributor', 0, 'Workshop supplies'],
    ['RAW-005', 'Purchase', 150, 35.00, 5250.00, 'PolyPlast Inc', 0, 'Monthly restock'],
  ];

  const seedRecipes = [
    ['PROD-001', 'RAW-001', 4],
    ['PROD-001', 'COMP-001', 1],
    ['PROD-001', 'RAW-004', 6],
    ['PROD-002', 'COMP-002', 2],
    ['PROD-002', 'COMP-003', 1],
    ['PROD-002', 'RAW-002', 3],
  ];

  const seedAll = db.transaction(() => {
    for (const item of seedItems) insertItem.run(...item);
    for (const txn of seedTransactions) insertTransaction.run(...txn);
    for (const recipe of seedRecipes) insertRecipe.run(...recipe);
  });

  seedAll();
  console.log(' Database seeded with demo data');
}

module.exports = db;
