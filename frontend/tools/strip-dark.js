const fs = require('fs');
const path = require('path');

function walk(dir, cb) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(ent => {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, cb);
    else cb(full);
  });
}

const root = path.join(__dirname, '..', 'src');
const exts = new Set(['.html', '.ts', '.css']);
let changed = 0;
let scanned = 0;

walk(root, file => {
  const ext = path.extname(file).toLowerCase();
  if (!exts.has(ext)) return;
  scanned++;
  let src = fs.readFileSync(file, 'utf8');
  // remove any token like dark:utilityName (stop at whitespace or ' or ")
  const updated = src.replace(/\bdark:[^\s"'`]+/g, '');
  if (updated !== src) {
    fs.writeFileSync(file, updated, 'utf8');
    changed++;
    console.log('updated', file);
  }
});

console.log(`scanned ${scanned} files, changed ${changed} files`);
