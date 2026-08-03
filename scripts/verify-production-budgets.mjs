import { gzipSync } from "node:zlib";
import { readdir, readFile, stat } from "node:fs/promises";
import { extname, resolve } from "node:path";

const buildDirectory = resolve(process.cwd(), ".next");
const manifestPath = resolve(buildDirectory, "server/app/page_client-reference-manifest.js");
const buildManifestPath = resolve(buildDirectory, "build-manifest.json");
const manifestPrefix = 'globalThis.__RSC_MANIFEST["/page"] = ';

const budgets = {
  homeJavaScriptRaw: 1_200_000,
  homeJavaScriptGzip: 360_000,
  // Locale-aware metric rendering adds a small raw-CSS allowance while the
  // stricter gzip ceiling remains unchanged.
  homeCssRaw: 324_000,
  homeCssGzip: 55_000,
  // The shared currency/progress renderer is intentionally kept in the
  // homepage chunk so every locale receives the same alignment logic.
  largestJavaScriptRaw: 467_000,
  allJavaScriptRaw: 2_900_000,
  allJavaScriptGzip: 870_000,
  allCssRaw: 350_000,
  allCssGzip: 65_000,
};

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(path));
    else if (entry.isFile()) files.push(path);
  }
  return files;
}

async function measure(paths) {
  let raw = 0;
  let gzip = 0;
  let largestRaw = 0;
  for (const path of paths) {
    const bytes = await readFile(path);
    raw += bytes.byteLength;
    gzip += gzipSync(bytes, { level: 9 }).byteLength;
    largestRaw = Math.max(largestRaw, bytes.byteLength);
  }
  return { raw, gzip, largestRaw };
}

function uniqueBuildPaths(paths) {
  return [...new Set(paths)].map((path) => resolve(buildDirectory, path));
}

function formatBytes(value) {
  return `${(value / 1024).toFixed(1)} KiB`;
}

await stat(manifestPath).catch(() => {
  throw new Error("Next production output is missing. Run `npm run build` before the budget gate.");
});

const manifestSource = await readFile(manifestPath, "utf8");
const manifestStart = manifestSource.indexOf(manifestPrefix);
if (manifestStart < 0) {
  throw new Error("Could not read the homepage client-reference manifest.");
}
const manifestJson = manifestSource
  .slice(manifestStart + manifestPrefix.length)
  .trim()
  .replace(/;\s*$/, "");
const manifest = JSON.parse(manifestJson);
const buildManifest = JSON.parse(await readFile(buildManifestPath, "utf8"));
const pageKey = "[project]/src/app/page";
const homeJavaScript = uniqueBuildPaths([
  ...(buildManifest.polyfillFiles ?? []),
  ...(buildManifest.rootMainFiles ?? []),
  ...(manifest.entryJSFiles?.[pageKey] ?? []),
]);
const homeCss = uniqueBuildPaths(
  (manifest.entryCSSFiles?.[pageKey] ?? []).map((entry) => entry.path),
);

if (homeJavaScript.length === 0 || homeCss.length === 0) {
  throw new Error("Homepage JavaScript or CSS entries were missing from the production manifest.");
}

const allStaticFiles = await listFiles(resolve(buildDirectory, "static/chunks"));
const allJavaScript = allStaticFiles.filter((path) => extname(path) === ".js");
const allCss = allStaticFiles.filter((path) => extname(path) === ".css");
const homeJsSize = await measure(homeJavaScript);
const homeCssSize = await measure(homeCss);
const allJsSize = await measure(allJavaScript);
const allCssSize = await measure(allCss);

const measurements = [
  ["Homepage JavaScript (raw)", homeJsSize.raw, budgets.homeJavaScriptRaw],
  ["Homepage JavaScript (gzip)", homeJsSize.gzip, budgets.homeJavaScriptGzip],
  ["Homepage CSS (raw)", homeCssSize.raw, budgets.homeCssRaw],
  ["Homepage CSS (gzip)", homeCssSize.gzip, budgets.homeCssGzip],
  ["Largest JavaScript chunk (raw)", allJsSize.largestRaw, budgets.largestJavaScriptRaw],
  ["All JavaScript chunks (raw)", allJsSize.raw, budgets.allJavaScriptRaw],
  ["All JavaScript chunks (gzip)", allJsSize.gzip, budgets.allJavaScriptGzip],
  ["All CSS chunks (raw)", allCssSize.raw, budgets.allCssRaw],
  ["All CSS chunks (gzip)", allCssSize.gzip, budgets.allCssGzip],
];

const failures = [];
for (const [label, actual, budget] of measurements) {
  const status = actual <= budget ? "PASS" : "FAIL";
  console.log(`${status} ${label}: ${formatBytes(actual)} / ${formatBytes(budget)}`);
  if (actual > budget) failures.push(`${label} exceeded its budget by ${formatBytes(actual - budget)}.`);
}

if (failures.length > 0) {
  throw new Error(`Production asset budget failed:\n- ${failures.join("\n- ")}`);
}
