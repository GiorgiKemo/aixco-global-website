import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const [sourceDirectory, outputDirectory] = process.argv.slice(2);

if (!sourceDirectory || !outputDirectory) {
  throw new Error("Usage: node scripts/import-current-project-gallery.mjs <source> <output>");
}

const images = [
  ["Cam08_final.png", "01-hero-exterior"],
  ["Cam06_final.png", "02-sunset-exterior"],
  ["Corona Camera002_Night.jpg", "03-night-exterior"],
  ["Cam02_final.png", "04-aerial-exterior"],
  ["Cam03_final.png", "05-front-facade"],
  ["Cam04_POST.png", "06-entrance"],
  ["Cam16_final.png", "07-balcony-detail"],
  ["Cam14_final.png", "08-rooftop-sunset"],
  ["Cam13_final.png", "09-pool-terrace"],
  ["3-1.png", "10-low-angle-facade"],
  ["Cam12_night_final.png", "11-night-arrival"],
  ["1.png", "12-reception"],
  ["2.png", "13-lobby-lounge"],
  ["3.png", "14-private-lounge"],
  ["c0020000.png", "15-business-lounge"],
  ["GYM.png", "16-gym"],
  ["Pool_1 copy.png", "17-indoor-pool"],
  ["Pool_2 copy.png", "18-indoor-pool-wide"],
  ["Pool_3.png", "19-garden-pool"],
  ["Sauna.png", "20-sauna"],
];

fs.mkdirSync(path.join(outputDirectory, "thumbs"), { recursive: true });

for (const [sourceName, outputName] of images) {
  const sourcePath = path.join(sourceDirectory, sourceName);
  console.log(`Processing ${outputName}`);

  await sharp(sourcePath, { limitInputPixels: false })
    .webp({ lossless: true, effort: 4 })
    .toFile(path.join(outputDirectory, `${outputName}.webp`));

  await sharp(sourcePath, { limitInputPixels: false })
    .resize(480, 320, { fit: "cover", position: "centre" })
    .webp({ lossless: true, effort: 4 })
    .toFile(path.join(outputDirectory, "thumbs", `${outputName}.webp`));
}

console.log("Current-project gallery import complete.");
