const fs = require('fs');
const path = require('path');

const dirs = ['components', 'views', 'src', '.'];

const colorMap = {
  '#FF69B4': '#a855f7',
  '#ff69b4': '#a855f7',
  '#e03a7a': '#7e22ce',
  '#E03A7A': '#7e22ce',
  '#c850c0': '#8b5cf6',
  '#C850C0': '#8b5cf6',
  '#FF1493': '#7e22ce',
  '#ff1493': '#7e22ce',
  'pink-500': 'purple-500',
  'pink-400': 'purple-400',
  'pink-600': 'purple-600',
};

function processDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.git' || file === 'dist') continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const [pink, purple] of Object.entries(colorMap)) {
        if (content.includes(pink)) {
          content = content.split(pink).join(purple);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

dirs.forEach(processDir);
console.log('Done replacing colors.');
