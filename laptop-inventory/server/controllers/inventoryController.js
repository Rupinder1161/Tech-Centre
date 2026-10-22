const { getDashboard, getInventoryList, getTransactions, recordTransaction, searchLaptopHistory } = require('../services/inventoryService');
const { buildInventoryWorkbook } = require('../exports/inventoryExport');
const XLSX = require('xlsx');

const dashboard = async (req, res) => {
  try {
    const dashboardData = await getDashboard();
    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createInTransaction = async (req, res) => {
  try {
    const { laptopNumber, purpose, notes } = req.body || {};
    await recordTransaction({
      laptopNumber,
      action: 'IN',
      purpose,
      notes,
    });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const createOutTransaction = async (req, res) => {
  try {
    const { laptopNumber, purpose, notes } = req.body || {};
    await recordTransaction({
      laptopNumber,
      action: 'OUT',
      purpose,
      notes,
    });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const inventory = async (req, res) => {
  try {
    const items = await getInventoryList();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const transactions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const items = await getTransactions({ page, limit });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const search = async (req, res) => {
  try {
    const query = String(req.query.q || '').trim();
    const results = await searchLaptopHistory(query);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const exportInventory = async (req, res) => {
  try {
    const dashboardData = await getDashboard();
    const inventory = await getInventoryList();
    const generatedAt = new Date().toISOString();

    const workbook = buildInventoryWorkbook({
      currentInventory: dashboardData.currentInventory,
      inventoryList: inventory,
      generatedAt,
    });

    const fileName = `Inventory_Report_${new Date().toISOString().slice(0, 10).replace(/-/g, '_')}.xlsx`;
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  dashboard,
  createInTransaction,
  createOutTransaction,
  inventory,
  transactions,
  search,
  exportInventory,
};
