const fs = require('fs');
const path = require('path');

const apiUrl = process.env.NG_APP_API_URL || process.env.API_URL || 'http://localhost:5000/api';
const targetPath = path.join(__dirname, '../src/assets/env.js');

const content = `window.__env__ = {
  apiUrl: '${apiUrl.replace(/'/g, "\\'")}'
};\n`;

fs.writeFileSync(targetPath, content, 'utf8');
console.log(`Wrote runtime environment file at ${targetPath}`);
console.log(`API URL = ${apiUrl}`);
