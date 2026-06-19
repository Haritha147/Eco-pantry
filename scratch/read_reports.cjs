const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const dir = 'c:/Users/ahari/pdd/eco-pantry/testfinal';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.xlsx'));

files.forEach(file => {
  console.log(`\n--- File: ${file} ---`);
  const workbook = xlsx.readFile(path.join(dir, file));
  workbook.SheetNames.forEach(sheetName => {
    console.log(`Sheet: ${sheetName}`);
    const sheet = workbook.Sheets[sheetName];
    const json = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    if (json.length > 0) {
      console.log(`  Headers: ${json[0].join(', ')}`);
      if (json.length > 1) {
        console.log(`  Sample Row: ${json[1].join(', ')}`);
      }
    }
  });
});
