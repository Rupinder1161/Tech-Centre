const { getQuery, allQuery, runQuery } = require('../database/db');

const VALID_ACTIONS = ['IN', 'OUT'];
const VALID_PURPOSES = ['NEW STOCK', 'RETURNED', 'USER ISSUE', 'WAREHOUSE', 'REPAIR'];

const normalizeLaptopNumber = (value = '') => String(value).trim().toUpperCase();
const normalizeAction = (value = '') => String(value).trim().toUpperCase();
const normalizePurpose = (value = '') => (value === undefined || value === null ? '' : String(value).trim().toUpperCase());

const getLatestTransaction = async (laptopNumber) => {
  const normalizedLaptop = normalizeLaptopNumber(laptopNumber);

  const row = await getQuery(
    `SELECT *
     FROM transactions
     WHERE laptop_number = ?
     ORDER BY id DESC
     LIMIT 1`,
    [normalizedLaptop],
  );

  return row || null;
};

const getDashboard = async () => {
  const currentInventoryRow = await getQuery(`
    WITH latest_transactions AS (
      SELECT laptop_number, action,
             ROW_NUMBER() OVER (PARTITION BY laptop_number ORDER BY id DESC) AS rn
      FROM transactions
    )
    SELECT COUNT(*) AS currentInventory
    FROM latest_transactions
    WHERE rn = 1 AND action = 'IN'
  `);

  const totalReceivedRow = await getQuery(`
    SELECT COUNT(*) AS totalReceived
    FROM transactions
    WHERE action = 'IN'
  `);

  const totalSentOutRow = await getQuery(`
    SELECT COUNT(*) AS totalSentOut
    FROM transactions
    WHERE action = 'OUT'
  `);

  return {
    currentInventory: Number(currentInventoryRow?.currentInventory || 0),
    totalReceived: Number(totalReceivedRow?.totalReceived || 0),
    totalSentOut: Number(totalSentOutRow?.totalSentOut || 0),
  };
};

const getInventoryList = async () => {
  const rows = await allQuery(`
    SELECT laptop_number AS laptopNumber
    FROM transactions
    WHERE id IN (
      SELECT MAX(id)
      FROM transactions
      GROUP BY laptop_number
    )
    AND action = 'IN'
    ORDER BY laptop_number ASC
  `);

  return rows.map((row) => ({ laptopNumber: row.laptopNumber }));
};

const getTransactions = async ({ page = 1, limit = 10 } = {}) => {
  const pageNumber = Math.max(1, Number(page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(limit) || 10));
  const offset = (pageNumber - 1) * pageSize;

  const [rows, totalRow] = await Promise.all([
    allQuery(
      `SELECT id, laptop_number AS laptopNumber, action, purpose, notes, created_at AS createdAt
       FROM transactions
       ORDER BY id DESC
       LIMIT ? OFFSET ?`,
      [pageSize, offset],
    ),
    getQuery('SELECT COUNT(*) AS total FROM transactions'),
  ]);

  return {
    page: pageNumber,
    limit: pageSize,
    total: Number(totalRow?.total || 0),
    totalPages: Math.max(1, Math.ceil((Number(totalRow?.total || 0) || 0) / pageSize)),
    items: rows.map((row) => ({
      id: row.id,
      laptopNumber: row.laptopNumber,
      action: row.action,
      purpose: row.purpose,
      notes: row.notes,
      createdAt: row.createdAt,
    })),
  };
};

const searchLaptopHistory = async (laptopNumber) => {
  const normalizedLaptop = normalizeLaptopNumber(laptopNumber);

  if (!normalizedLaptop) {
    return [];
  }

  const rows = await allQuery(
    `SELECT id, laptop_number AS laptopNumber, action, purpose, notes, created_at AS createdAt
     FROM transactions
     WHERE laptop_number = ?
     ORDER BY id DESC`,
    [normalizedLaptop],
  );

  return rows.map((row) => ({
    id: row.id,
    laptopNumber: row.laptopNumber,
    action: row.action,
    purpose: row.purpose,
    notes: row.notes,
    createdAt: row.createdAt,
  }));
};

const recordTransaction = async ({ laptopNumber, action, purpose, notes }) => {
  const normalizedLaptop = normalizeLaptopNumber(laptopNumber);
  const normalizedAction = normalizeAction(action);
  const normalizedPurpose = normalizePurpose(purpose);
  const trimmedNotes = (notes === undefined || notes === null) ? '' : String(notes).trim();

  if (!normalizedLaptop) {
    throw new Error('Laptop number is required');
  }

  if (!VALID_ACTIONS.includes(normalizedAction)) {
    throw new Error('Action must be IN or OUT');
  }

  if (normalizedPurpose && !VALID_PURPOSES.includes(normalizedPurpose)) {
    throw new Error('Purpose is invalid');
  }

  const latestTransaction = await getLatestTransaction(normalizedLaptop);

  if (normalizedAction === 'IN' && latestTransaction && latestTransaction.action === 'IN') {
    throw new Error('Laptop is already in Tech Centre');
  }

  if (normalizedAction === 'OUT') {
    if (!latestTransaction) {
      throw new Error('Laptop is not currently in Tech Centre');
    }

    if (latestTransaction.action === 'OUT') {
      throw new Error('Laptop is already out of Tech Centre');
    }
  }

  await runQuery(
    `INSERT INTO transactions (laptop_number, action, purpose, notes)
     VALUES (?, ?, ?, ?)`,
    [normalizedLaptop, normalizedAction, normalizedPurpose || null, trimmedNotes || null],
  );

  return {
    success: true,
  };
};

module.exports = {
  getDashboard,
  getInventoryList,
  getTransactions,
  recordTransaction,
  searchLaptopHistory,
  getLatestTransaction,
  normalizeLaptopNumber,
};
