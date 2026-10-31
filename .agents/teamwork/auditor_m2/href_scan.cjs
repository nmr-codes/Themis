const fs = require('fs');
const path = require('path');

function getFiles(dir) {
  let results = [];
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      results = results.concat(getFiles(full));
    } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
      results.push(full);
    }
  }
  return results;
}

const files = getFiles('src');
const hrefs = new Map();
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const regex = /href=(?:\{["'`]([^"'`]+)["'`]\}|["']([^"']+)["'])/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const val = match[1] || match[2];
    if (!hrefs.has(val)) hrefs.set(val, []);
    hrefs.get(val).push(file);
  }
}

console.log("Found " + hrefs.size + " unique href targets:");
for (const [target, fileList] of Array.from(hrefs.entries()).sort()) {
  console.log(`  ${target} -> in ${fileList.length} files (e.g. ${fileList[0]})`);
}
