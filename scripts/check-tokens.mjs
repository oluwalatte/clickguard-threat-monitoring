// Rule 1 enforcement: no raw hex or px anywhere in src/ or packages/ui/src outside the tokens folder.
// Stories and data files are included. A line may carry a reviewed exception by
// placing `token-ok` on it or on the line above; the count of exceptions is printed.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, sep } from 'node:path';

const ROOTS = ['src', join('packages', 'ui', 'src')];
const EXEMPT = join('packages', 'ui', 'src', 'tokens') + sep;
const HEX = /#[0-9a-fA-F]{3,8}\b/;
const PX = /(^|[^-\w])\d+(\.\d+)?px\b/;

const offenders = [];
let exceptions = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    if (p.startsWith(EXEMPT)) continue;
    if (!/\.(css|tsx|ts)$/.test(name)) continue;
    const lines = readFileSync(p, 'utf8').split('\n');
    lines.forEach((line, i) => {
      const hit = HEX.test(line) || PX.test(line);
      if (!hit) return;
      if (line.includes('token-ok') || (i > 0 && lines[i - 1].includes('token-ok'))) { exceptions += 1; return; }
      offenders.push(`${p}:${i + 1}: ${line.trim()}`);
    });
  }
}
ROOTS.forEach(walk);
if (offenders.length) {
  console.error('Raw values outside packages/ui/src/tokens:\n' + offenders.join('\n'));
  process.exit(1);
}
console.log(`check:tokens ok (${exceptions} reviewed exception${exceptions === 1 ? '' : 's'})`);
