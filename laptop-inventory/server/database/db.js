const path = require('node:path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, 'inventory.db');
const db = new sqlite3.Database(dbPath);

const initializeDatabase = () => {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        laptop_number TEXT NOT NULL,
        action TEXT NOT NULL,
        purpose TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE INDEX IF NOT EXISTS idx_transactions_laptop_number
      ON transactions (laptop_number)
    `);

    db.run(`
      CREATE INDEX IF NOT EXISTS idx_transactions_created_at
      ON transactions (created_at DESC)
    `);
  });
};

const run = (sql, params = [], callback) => db.run(sql, params, callback);
const get = (sql, params = [], callback) => db.get(sql, params, callback);
const all = (sql, params = [], callback) => db.all(sql, params, callback);
const close = () => db.close();

const runQuery = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function runCallback(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ id: this.lastID, changes: this.changes });
    });
  });

const getQuery = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });

const allQuery = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows || []);
    });
  });

initializeDatabase();

module.exports = { db, run, get, all, close, runQuery, getQuery, allQuery };
