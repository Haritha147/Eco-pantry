const fs = require('fs');

const appContent = fs.readFileSync('src/App.jsx', 'utf8');
const lines = appContent.split('\n');

let startIdx = lines.findIndex(l => l.includes('function App() {'));
let endIdx = 1520; // Hardcoded right before the main return

const imports = lines.slice(0, startIdx).join('\n');
const stateAndLogic = lines.slice(startIdx + 1, endIdx).join('\n');

// Find all top level declarations
const declarations = [];
const regex = /const \[([a-zA-Z0-9_]+),\s*([a-zA-Z0-9_]+)\]\s*=\s*useState/g;
let match;
while ((match = regex.exec(stateAndLogic)) !== null) {
  declarations.push(match[1]);
  declarations.push(match[2]);
}

const refRegex = /const ([a-zA-Z0-9_]+)\s*=\s*useRef/g;
while ((match = refRegex.exec(stateAndLogic)) !== null) {
  declarations.push(match[1]);
}

const funcRegex = /const ([a-zA-Z0-9_]+)\s*=\s*(\(.*?\)|\w+)\s*=>/g;
while ((match = funcRegex.exec(stateAndLogic)) !== null) {
  if (!declarations.includes(match[1])) {
    declarations.push(match[1]);
  }
}

// other function declarations
const funcDeclRegex = /function ([a-zA-Z0-9_]+)\s*\(/g;
while ((match = funcDeclRegex.exec(stateAndLogic)) !== null) {
  if (!declarations.includes(match[1])) {
    declarations.push(match[1]);
  }
}

const varsRegex = /const ([a-zA-Z0-9_]+)\s*=\s*[^=]/g;
while ((match = varsRegex.exec(stateAndLogic)) !== null) {
    if (!declarations.includes(match[1]) && !match[1].includes('[')) {
        declarations.push(match[1]);
    }
}

const contextContent = `${imports.replace(/import React.*?;/, "import React, { createContext, useContext, useState, useEffect, useRef } from 'react';")}

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
${stateAndLogic}

  const value = {
    ${declarations.join(',\n    ')}
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
`;

fs.writeFileSync('src/context/AppContext.jsx', contextContent);
console.log('AppContext.jsx generated.');
