const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = [
  // Primary brand (Orange/Amber -> Blue)
  { regex: /\borange-600\b/g, replacement: 'blue-700' },
  { regex: /\borange-500\b/g, replacement: 'blue-600' },
  { regex: /\borange-400\b/g, replacement: 'blue-500' },
  { regex: /\borange-100\b/g, replacement: 'blue-50' },
  { regex: /\bamber-600\b/g, replacement: 'blue-700' },
  { regex: /\bamber-500\b/g, replacement: 'blue-600' },
  { regex: /\bamber-400\b/g, replacement: 'blue-500' },
  { regex: /\bamber-100\b/g, replacement: 'blue-50' },
  { regex: /\bamber-900\b/g, replacement: 'blue-900' },
  { regex: /\bamber-950\b/g, replacement: 'blue-950' },

  // Dark backgrounds & accents (Emerald/Teal -> Slate/Dark Blue)
  { regex: /\bemerald-950\b/g, replacement: 'slate-950' },
  { regex: /\bemerald-900\b/g, replacement: 'slate-900' },
  { regex: /\bemerald-800\b/g, replacement: 'slate-800' },
  { regex: /\bemerald-700\b/g, replacement: 'slate-700' },
  { regex: /\bemerald-600\b/g, replacement: 'blue-600' },
  { regex: /\bemerald-500\b/g, replacement: 'slate-500' },
  { regex: /\bemerald-400\b/g, replacement: 'slate-400' },
  
  { regex: /\bteal-950\b/g, replacement: 'slate-950' },
  { regex: /\bteal-900\b/g, replacement: 'slate-900' },
  { regex: /\bteal-800\b/g, replacement: 'slate-800' },
  { regex: /\bteal-700\b/g, replacement: 'slate-700' },
  { regex: /\bteal-600\b/g, replacement: 'blue-600' },
  { regex: /\bteal-500\b/g, replacement: 'slate-500' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (stat.isFile() && (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts'))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;

      for (const { regex, replacement } of replacements) {
        content = content.replace(regex, replacement);
      }

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated colors in: ${fullPath.replace(__dirname, '')}`);
      }
    }
  }
}

console.log('Starting global color replacement...');
processDirectory(srcDir);
console.log('Done!');
