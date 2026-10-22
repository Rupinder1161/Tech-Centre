const XLSX = require('xlsx');

const buildInventoryWorkbook = ({ currentInventory, inventoryList, generatedAt }) => {
  const rows = [
    ['Laptop Inventory Report'],
    [],
    ['Generation Date', generatedAt],
    ['Current Inventory Count', currentInventory],
    [],
    ['Laptop Number'],
  ];

  inventoryList.forEach((item) => {
    rows.push([item.laptopNumber]);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 28 },
    { wch: 28 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory Report');

  return workbook;
};

module.exports = {
  buildInventoryWorkbook,
};
