const fs = require('fs');

const appJsxPath = 'c:\\Users\\ahari\\pdd\\eco-pantry\\src\\App.jsx';
let content = fs.readFileSync(appJsxPath, 'utf8');

// Insert API_BASE_URL if it doesn't exist
if (!content.includes('const API_BASE_URL')) {
    content = content.replace("import './App.css';", "import './App.css';\n\nconst API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';");
}

// Replace single-quoted hardcoded strings: 'http://localhost:5000...' -> `${API_BASE_URL}...`
content = content.replace(/'http:\/\/localhost:5000([^']*)'/g, '`${API_BASE_URL}$1`');

// Replace template literals: `http://localhost:5000...` -> `${API_BASE_URL}...`
content = content.replace(/`http:\/\/localhost:5000([^`]*)`/g, '`${API_BASE_URL}$1`');

fs.writeFileSync(appJsxPath, content, 'utf8');
console.log('App.jsx refactored successfully.');
