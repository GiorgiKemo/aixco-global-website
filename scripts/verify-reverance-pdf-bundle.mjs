// Run after next build: prevent unrelated galleries from entering the PDF function.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const trace = '.next/server/app/api/reverance-calculator/pdf/route.js.nft.json';
const files = JSON.parse(fs.readFileSync(trace, 'utf8')).files.map(file => path.resolve(path.dirname(trace), file));
const size = files.reduce((total, file) => total + fs.statSync(file).size, 0);
assert(size < 50_000_000, `PDF function trace is too large: ${size} bytes`);
for (const directory of ['public/aixco-global-op2/images/reverance-offer', 'public/aixco-global-op2/fonts/reverance-pdf']) {
  for (const name of fs.readdirSync(directory).filter(name => /\.(png|jpg|ttf)$/.test(name))) {
    assert(files.includes(path.resolve(directory, name)), `Missing PDF asset: ${name}`);
  }
}
const unrelatedImages = files.filter(file => file.replaceAll('\\', '/').includes('/public/aixco-global-op2/images/') && !file.replaceAll('\\', '/').includes('/images/reverance-offer/'));
assert.deepEqual(unrelatedImages, [], 'Unrelated images must not be bundled into the PDF function');
console.log(`PASS: PDF function trace ${(size / 1_000_000).toFixed(2)} MB; all artwork and fonts present, no unrelated images.`);
