import fs from "node:fs";
import ts from "typescript";

function unwrapExpression(node) {
  if (ts.isSatisfiesExpression(node) || ts.isAsExpression(node)) return unwrapExpression(node.expression);
  return node;
}

function readCatalog(file, variableName) {
  const source = fs.readFileSync(file, "utf8");
  const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  let catalog;
  sourceFile.forEachChild((node) => {
    if (!ts.isVariableStatement(node)) return;
    for (const declaration of node.declarationList.declarations) {
      if (declaration.name.getText(sourceFile) === variableName) catalog = unwrapExpression(declaration.initializer);
    }
  });
  if (!catalog || !ts.isObjectLiteralExpression(catalog)) throw new Error(`Could not read ${variableName}`);

  return new Map(catalog.properties.flatMap((property) => {
    if (!ts.isPropertyAssignment(property) || !ts.isObjectLiteralExpression(property.initializer)) return [];
    const key = property.name.text ?? property.name.getText(sourceFile);
    const values = Object.fromEntries(property.initializer.properties.flatMap((localeProperty) => {
      if (!ts.isPropertyAssignment(localeProperty)) return [];
      const locale = localeProperty.name.text ?? localeProperty.name.getText(sourceFile);
      const value = localeProperty.initializer.text ?? localeProperty.initializer.getText(sourceFile);
      return [[locale, value]];
    }));
    return [[key, values]];
  }));
}

const curated = readCatalog("src/i18n/curated-visible-translations.ts", "curatedVisibleTranslations");
const supplemental = readCatalog("src/i18n/I18nProvider.tsx", "supplementalTranslations");
const germanQuality = readCatalog("src/i18n/I18nProvider.tsx", "germanQualityTranslations");
const germanFixes = readCatalog("src/i18n/german-translation-fixes.ts", "germanTranslationFixes");
const localeFixes = readCatalog("src/i18n/locale-translation-fixes.ts", "localeTranslationFixes");
const passthroughFixes = readCatalog("src/i18n/locale-passthrough-fixes.ts", "localePassthroughFixes");
const textTranslations = readCatalog("src/i18n/translations.ts", "textTranslations");
const assetTranslations = readCatalog("src/i18n/asset-translations.ts", "assetTranslations");
const siteContentTranslations = readCatalog("src/i18n/site-content-translations.ts", "siteContentTranslations");
const polishSources = [
  readCatalog("src/i18n/polish-translations.ts", "polishTranslations"),
  readCatalog("src/i18n/polish-translations-extra.ts", "polishTranslationsExtra"),
  readCatalog("src/i18n/polish-translations-final.ts", "polishTranslationsFinal"),
];

const requiredKeys = new Set([...curated.keys(), ...supplemental.keys(), ...germanQuality.keys()]);
const intentionalGermanMatches = new Set([
  "AIXCO.Global", "Batumi", "Broker", "Dubai", "Email", "Partner", "Risk", "Status", "Team",
]);
const errors = [];

for (const key of requiredKeys) {
  const german = germanFixes.get(key)?.de ?? curated.get(key)?.de ?? germanQuality.get(key)?.de ?? supplemental.get(key)?.de;
  if (!german) errors.push(`Missing German: ${key}`);
  if (german === key && !intentionalGermanMatches.has(key)) errors.push(`German passthrough: ${key}`);

  const polish = polishSources.reduce((value, source) => value ?? source.get(key)?.pl, undefined);
  if (!polish) errors.push(`Missing Polish: ${key}`);
}

const sharedSources = [germanFixes, localeFixes, passthroughFixes, curated, germanQuality, supplemental, textTranslations, assetTranslations, siteContentTranslations];
const intentionalMatchesByLocale = {
  de: new Set(["AIXCO.Global", "Batumi", "Dubai"]),
  ru: new Set(["AIXCO.Global"]),
  ka: new Set(["AIXCO.Global"]),
  tr: new Set(["AIXCO.Global", "Risk", "Platform", "Dubai"]),
  ar: new Set(["AIXCO.Global"]),
};
for (const locale of ["de", "ru", "ka", "tr", "ar"]) {
  for (const key of requiredKeys) {
    const value = sharedSources.reduce((match, source) => match ?? source.get(key)?.[locale], undefined);
    if (!value) errors.push(`Missing ${locale}: ${key}`);
    else if (value === key && !intentionalMatchesByLocale[locale].has(key)) errors.push(`${locale} passthrough: ${key}`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Localization coverage passed for ${requiredKeys.size} public strings across German, Russian, Georgian, Turkish, Arabic, and Polish.`);
