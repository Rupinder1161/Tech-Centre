const express = require('express');
const {
  dashboard,
  createInTransaction,
  createOutTransaction,
  inventory,
  transactions,
  search,
  exportInventory,
} = require('../controllers/inventoryController');

const router = express.Router();

router.get('/dashboard', dashboard);
router.post('/in', createInTransaction);
router.post('/out', createOutTransaction);
router.get('/inventory', inventory);
router.get('/transactions', transactions);
router.get('/search', search);
router.get('/export', exportInventory);

module.exports = router;
