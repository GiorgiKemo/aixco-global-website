// Refresh only the approved public apartment artwork, never prices or availability.
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const snapshotPath = process.argv[2];
if (!snapshotPath) throw Error('Supply the existing Reverance A geometry snapshot path.');
const snapshot = JSON.parse(await fs.readFile(snapshotPath, 'utf8'));
const sourcePublic = path.dirname(path.dirname(snapshotPath));
const dir = 'public/aixco-global-op2/images/reverance-offer';
await fs.mkdir(dir, { recursive: true });
const wanted = ['1305','1306','1307','1308','1309','1310','1401','1405','1407','1408'];
const catalog = {};
async function get(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw Error(`${response.status}: ${url}`);
  return response;
}
// This bounded public catalog range spans floor 13 through floor 14.
for (let id = 683; id <= 706; id++) {
  const source = `https://api.otium.ge/api/flats/${id}`;
  const { data: flat } = await (await get(source)).json();
  if (!wanted.includes(String(flat.name))) continue;
  const code = `A${flat.name}`;
  const floor = snapshot.floors.find(f => f.number === Number(flat.floor));
  const shape = floor.shapes.find(s => s.target === String(flat.name));
  if (!shape || !flat.image_2d || !flat.image_3d) throw Error(`Incomplete artwork: ${code}`);
  for (const [kind, url] of [['plan',flat.image_2d], ['rooms',flat.image_3d]]) {
    const bytes = Buffer.from(await (await get(url)).arrayBuffer());
    const image = sharp(bytes).trim({threshold:12}).resize({width:1600,height:1600,fit:'inside',withoutEnlargement:true}).flatten({background:'#ffffff'});
    if (kind === 'rooms') await image.jpeg({quality:88}).toFile(`${dir}/${code}-${kind}.jpg`);
    else await image.png().toFile(`${dir}/${code}-${kind}.png`);
  }
  await sharp(await fs.readFile(path.join(sourcePublic, floor.planImage))).resize({width:1600,withoutEnlargement:true}).flatten({background:'#f2efe8'}).jpeg({quality:90}).toFile(`${dir}/floor-${floor.number}.jpg`);
  catalog[code] = { source, planSource:flat.image_2d, roomsSource:flat.image_3d, floor:floor.number, points:shape.points,
    areas:flat.areas.map(a=>({type:a.type,size:Number(a.size)})) };
  console.log(`Prepared ${code}: exact 2D plan, furnished 3D layout, floor polygon.`);
}
if (Object.keys(catalog).length !== wanted.length) throw Error('Missing approved apartment artwork.');
await fs.writeFile(`${dir}/catalog.json`, JSON.stringify(catalog,null,2)+'\n');
await sharp('public/aixco-global-op2/images/project-gallery-2026/01-hero-exterior-2048.jpg').resize(540,680,{fit:'cover'}).jpeg({quality:88}).toFile(`${dir}/hero.jpg`);
