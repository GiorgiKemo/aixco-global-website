import { readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { openSync } from "fontkit";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fontDirectory = path.join(projectRoot, "src", "assets", "fonts", "gilroy");
const fontFiles = readdirSync(fontDirectory)
  .filter((fileName) => /\.(?:otf|ttf|woff2?)$/i.test(fileName))
  .sort();

const requiredBaseCharacters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const intentionallyBlankCodePoints = new Set([
  0x0020, // space
  0x00a0, // no-break space
  0x2000,
  0x2001,
  0x2002,
  0x2003,
  0x2004,
  0x2005,
  0x2006,
  0x2007,
  0x2008,
  0x2009,
  0x200a,
  0x202f,
  0x205f,
  0x3000,
]);

const failures = [];

for (const fileName of fontFiles) {
  const filePath = path.join(fontDirectory, fileName);
  const font = openSync(filePath);
  const mappedCodePoints = new Set(font.characterSet);

  for (const character of requiredBaseCharacters) {
    const codePoint = character.codePointAt(0);
    const glyph = font.glyphForCodePoint(codePoint);

    if (!mappedCodePoints.has(codePoint) || glyph.path.commands.length === 0) {
      failures.push(`${fileName}: required base glyph ${character} is missing or empty`);
    }
  }

  for (const codePoint of mappedCodePoints) {
    if (intentionallyBlankCodePoints.has(codePoint)) continue;

    const glyph = font.glyphForCodePoint(codePoint);
    if (glyph.path.commands.length === 0) {
      failures.push(
        `${fileName}: U+${codePoint.toString(16).toUpperCase().padStart(4, "0")} is mapped to an empty glyph`,
      );
    }
  }
}

if (failures.length > 0) {
  console.error("Font validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Font validation passed: ${fontFiles.length} bundled Gilroy weights contain no visible character mapped to an empty glyph.`,
);
