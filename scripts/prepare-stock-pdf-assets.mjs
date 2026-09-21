// Prepare exact, block-specific artwork for the merged owner inventory.
// Status and total area remain workbook-authoritative, never fetched from Otium.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const sourceRoot = process.argv[2];
if (!sourceRoot) throw Error('Supply the AiXESS project root containing both geometry snapshots.');
const regular = JSON.parse(await fs.readFile('src/data/reverance-regular-stock.json', 'utf8'));
const { GOLDEN_PREMIUM_APARTMENTS } = await import(path.join(sourceRoot, 'src/data/goldenPremiumApartments.js').replaceAll('\\', '/').replace(/^([A-Z]):/, 'file:///$1:'));
const units = [...regular, ...GOLDEN_PREMIUM_APARTMENTS.filter(u => u.status === 'available')];
const snapshots = {
  A: JSON.parse(await fs.readFile(path.join(sourceRoot, 'public/data/reverance-a.json'), 'utf8')),
  B: JSON.parse(await fs.readFile(path.join(sourceRoot, 'src/data/reveranceBPlans.json'), 'utf8')),
};
const dir = 'public/aixco-global-op2/images/reverance-offer';
const catalog = JSON.parse(await fs.readFile(`${dir}/catalog.json`, 'utf8'));
const saved = new Map();
async function prepare(source, kind) {
  const key = kind + source;
  if (saved.has(key)) return saved.get(key);
  const promise = (async () => {
    const name = `${kind}-${createHash('sha256').update(source).digest('hex').slice(0,16)}.jpg`;
    try { await fs.access(`${dir}/${name}`); return name; } catch { /* new artwork */ }
    let bytes;
    if (source.startsWith('/assets/')) bytes = await fs.readFile(path.join(sourceRoot, 'public', source));
    else {
      const response = await fetch(source, { signal: AbortSignal.timeout(30000) });
      if (!response.ok) throw Error(`Artwork HTTP ${response.status}: ${source}`);
      bytes = Buffer.from(await response.arrayBuffer());
    }
    await sharp(bytes).resize({width:1400,height:1400,fit:'inside',withoutEnlargement:true})
      .flatten({background:'#ffffff'}).jpeg({quality:85}).toFile(`${dir}/${name}`);
    return name;
  })();
  saved.set(key, promise);
  return promise;
}
let index = 0;
async function worker() {
  while (index < units.length) {
    const u = units[index++];
    const floor = snapshots[u.building].floors.find(f => f.number === u.floor);
    const shape = floor?.shapes.find(s => String(s.target) === u.code.slice(1));
    const meta = floor?.units.find(item => String(item.name) === u.code.slice(1));
    if (!shape || !floor.planImage) throw Error(`Missing exact floor geometry for ${u.code}`);
    const valid = meta && Math.abs(meta.totalArea - u.area) < .05;
    const floorFile = await prepare(floor.planImage, 'floor');
    const existing = catalog[u.code];
    if (existing?.source?.includes('/api/flats/')) {
      catalog[u.code] = {...existing, floorFile, planFile:u.code+'-plan.png', roomsFile:u.code+'-rooms.jpg'};
    } else {
      catalog[u.code] = {
        floor:u.floor, building:u.building, points:shape.points,
        areas:valid ? meta.areas.map(a=>({type:a.type,size:Number(a.size)})) : [],
        floorFile,
        planFile:valid && meta.image2d ? await prepare(meta.image2d, 'plan') : floorFile,
        roomsFile:valid && meta.image3d ? await prepare(meta.image3d, 'rooms') : null,
        floorReference:!valid || !meta.image2d,
        planSource:valid ? meta.image2d : floor.source,
        roomsSource:valid ? meta.image3d : null,
      };
    }
    console.log(`Prepared ${u.code}${valid ? '' : ' (floor only: conflicting room area)'}`);
  }
}
await Promise.all(Array.from({length:4}, worker));
await fs.writeFile(`${dir}/catalog.json`, JSON.stringify(catalog,null,2)+'\n');
console.log(`Prepared ${units.length} available units; ${Object.values(catalog).filter(a=>!a.roomsFile).length} require room-plan confirmation.`);
