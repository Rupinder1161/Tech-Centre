const test = require('node:test');
const assert = require('node:assert/strict');

const db = require('../database/db');
const {
  recordTransaction,
  getDashboard,
  getInventoryList,
  searchLaptopHistory,
} = require('./inventoryService');

test.beforeEach(async () => {
  await new Promise((resolve, reject) => {
    db.run('DELETE FROM transactions WHERE laptop_number LIKE ?', ['TEST%'], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve, reject) => {
    db.run('DELETE FROM transactions WHERE laptop_number LIKE ?', ['TEST%'], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
  db.close();
});

test('records IN and OUT lifecycle with correct latest status', async () => {
  await recordTransaction({
    laptopNumber: 'test-001',
    action: 'IN',
    purpose: 'NEW STOCK',
    notes: 'Initial stock',
  });

  let dashboard = await getDashboard();
  assert.equal(dashboard.currentInventory >= 1, true);

  await recordTransaction({
    laptopNumber: 'test-001',
    action: 'OUT',
    purpose: 'USER ISSUE',
    notes: 'Issued to user',
  });

  const history = await searchLaptopHistory('TEST-001');
  assert.ok(history.length >= 2);
  assert.equal(history[0].action, 'OUT');

  const inventory = await getInventoryList();
  assert.equal(inventory.some((item) => item.laptopNumber === 'TEST-001'), false);

  dashboard = await getDashboard();
  assert.equal(dashboard.totalReceived >= 1, true);
  assert.equal(dashboard.totalSentOut >= 1, true);
});

test('rejects duplicate IN and OUT transactions', async () => {
  await recordTransaction({
    laptopNumber: 'test-002',
    action: 'IN',
    purpose: 'RETURNED',
    notes: 'Returned from repair',
  });

  await assert.rejects(
    () =>
      recordTransaction({
        laptopNumber: 'test-002',
        action: 'IN',
        purpose: 'NEW STOCK',
        notes: 'Duplicate IN',
      }),
    /already in Tech Centre/i,
  );

  await recordTransaction({
    laptopNumber: 'test-003',
    action: 'IN',
    purpose: 'NEW STOCK',
    notes: 'Another stock item',
  });

  await recordTransaction({
    laptopNumber: 'test-003',
    action: 'OUT',
    purpose: 'USER ISSUE',
    notes: 'Issued to user',
  });

  await assert.rejects(
    () =>
      recordTransaction({
        laptopNumber: 'test-003',
        action: 'OUT',
        purpose: 'WAREHOUSE',
        notes: 'Duplicate OUT after OUT',
      }),
    /already out of Tech Centre|not currently in Tech Centre/i,
  );
});
