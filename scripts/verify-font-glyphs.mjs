import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { openSync } from "fontkit";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fontDirectory = path.join(projectRoot, "src", "assets", "fonts", "gilroy");
const germanFontDirectory = path.join(fontDirectory, "german");
const fontFiles = readdirSync(fontDirectory)
  .filter((fileName) => /\.(?:otf|ttf|woff2?)$/i.test(fileName))
  .sort();

const requiredBaseCharacters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const localizedCharacterSets = {
  de: "äÄöÖüÜßẞ\u0308",
  pl: "ąćęłńóśźżĄĆĘŁŃÓŚŹŻ",
  sl: "čČšŠžŽ",
  ru: "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ" +
    "абвгдеёжзийклмнопрстуфхцчшщъыьэюя",
};
const localeNames = {
  de: "German",
  pl: "Polish",
  sl: "Slovenian",
  ru: "Russian",
};
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
const bundledFontsCoverLocale = Object.fromEntries(
  Object.keys(localizedCharacterSets).map((locale) => [locale, true]),
);

const germanFontFiles = readdirSync(germanFontDirectory)
  .filter((fileName) => /-German\.(?:otf|ttf|woff2?)$/i.test(fileName))
  .sort();

for (const fileName of germanFontFiles) {
  const font = openSync(path.join(germanFontDirectory, fileName));
  const mappedCodePoints = new Set(font.characterSet);

  for (const character of requiredBaseCharacters + localizedCharacterSets.de) {
    const codePoint = character.codePointAt(0);
    const glyph = font.glyphForCodePoint(codePoint);
    if (!mappedCodePoints.has(codePoint) || glyph.path.commands.length === 0) {
      failures.push(`${fileName}: required German brand glyph ${character} is missing or empty`);
    }
  }
}

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

  for (const [locale, requiredCharacters] of Object.entries(localizedCharacterSets)) {
    for (const character of requiredCharacters) {
      const codePoint = character.codePointAt(0);
      const glyph = font.glyphForCodePoint(codePoint);
      if (!mappedCodePoints.has(codePoint) || glyph.path.commands.length === 0) {
        bundledFontsCoverLocale[locale] = false;
      }
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

const incompleteLocales = Object.entries(bundledFontsCoverLocale)
  .filter(([locale, isComplete]) => locale !== "de" && !isComplete)
  .map(([locale]) => locale);

if (incompleteLocales.length > 0) {
  const stylesheet = readFileSync(path.join(projectRoot, "src", "index.css"), "utf8");
  const tailwindConfig = readFileSync(path.join(projectRoot, "tailwind.config.ts"), "utf8");
  const localeSelector =
    "html:is([lang='pl'], [lang='sl'], [lang='ru'])";
  const localeOverrideStart = stylesheet.indexOf(`${localeSelector} {`);
  const localeOverride = stylesheet.slice(
    localeOverrideStart,
    stylesheet.indexOf("\n}", localeOverrideStart),
  );
  const localeFontVariables = [
    "--font-brand-sans",
    "--font-brand-display",
    "--font-legacy-ui",
    "--font-legacy-display",
    "--font-sans",
    "--font-display",
  ];

  if (localeOverrideStart < 0) {
    failures.push("Complete translated-locale font override is missing");
  }

  for (const locale of incompleteLocales) {
    if (!localeSelector.includes(`[lang='${locale}']`)) {
      failures.push(`${localeNames[locale]} is missing from the complete locale selector`);
    }
  }

  for (const variable of localeFontVariables) {
    if (!localeOverride.includes(variable)) {
      failures.push(`Translated-locale fallback is missing ${variable}`);
    }
  }
  if (!localeOverride.includes("system-ui, -apple-system, BlinkMacSystemFont")) {
    failures.push("Translated locales must start with the device's complete system UI face");
  }
  if (!localeOverride.includes("font-synthesis: none")) {
    failures.push("Translated locales must disable synthetic font styles");
  }
  if (/font-gilroy/i.test(localeOverride)) {
    failures.push("Translated locales must not mix incomplete Gilroy into localized words");
  }
  if (/avenir/i.test(localeOverride)) {
    failures.push("Translated locales must avoid Avenir's optically heavier fallback glyphs");
  }
  if (
    !tailwindConfig.includes('"var(--font-brand-display)"') ||
    !tailwindConfig.includes('"var(--font-brand-sans)"') ||
    tailwindConfig.includes('"var(--font-gilroy)"')
  ) {
    failures.push("Tailwind font utilities must inherit locale-aware brand font variables");
  }
}

if (failures.length > 0) {
  console.error("Font validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Font validation passed: ${germanFontFiles.length} German Gilroy weights include native umlauts, while Polish, Slovenian, and Russian use one complete locale stack.`,
);
