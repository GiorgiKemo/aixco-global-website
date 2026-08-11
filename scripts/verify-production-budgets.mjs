import { gzipSync } from "node:zlib";
import { readdir, readFile, stat } from "node:fs/promises";
import { extname, resolve } from "node:path";

const buildDirectory = resolve(process.cwd(), ".next");
const manifestPath = resolve(buildDirectory, "server/app/page_client-reference-manifest.js");
const adminAnalyticsManifestPath = resolve(
  buildDirectory,
  "server/app/admin/analytics/page_client-reference-manifest.js",
);
const buildManifestPath = resolve(buildDirectory, "build-manifest.json");

const budgets = {
  // Next 16.2.12 clean-HEAD measurement (before the admin redesign):
  // 1,317,530 raw / 397,163 gzip. Keep less than 1.5% headroom so this
  // gate catches a real public-route regression without attributing the
  // already-committed homepage payload to an admin-only change.
  homeJavaScriptRaw: 1_335_000,
  homeJavaScriptGzip: 403_000,
  // Locale-aware responsive rules add a small raw-CSS allowance while the
  // stricter gzip ceiling remains unchanged.
  homeCssRaw: 336_000,
  // Clean HEAD was 55,399 bytes gzip; this remains within 1.1% of it.
  homeCssGzip: 56_000,
  // The shared currency/progress renderer is intentionally kept in the
  // homepage chunk so every locale receives the same alignment logic.
  largestJavaScriptRaw: 467_000,
  // Private analytics is a separate route, so measure its actual route
  // payload rather than summing mutually exclusive chunks from every route.
  adminAnalyticsJavaScriptRaw: 665_000,
  adminAnalyticsJavaScriptGzip: 200_000,
  // Option 2 adds the private admin shell and launchpad surfaces. This raw
  // ceiling is only 1,513 bytes above the verified 354,487-byte output;
  // the stricter all-CSS gzip ceiling remains unchanged below.
  allCssRaw: 356_000,
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
await stat(adminAnalyticsManifestPath).catch(() => {
  throw new Error("The admin analytics client-reference manifest is missing.");
});

function parseRouteManifest(source, routeKey) {
  const prefix = `globalThis.__RSC_MANIFEST["${routeKey}"] = `;
  const start = source.indexOf(prefix);
  if (start < 0) throw new Error(`Could not read the ${routeKey} client-reference manifest.`);
  return JSON.parse(source
    .slice(start + prefix.length)
    .trim()
    .replace(/;\s*$/, ""));
}

const manifest = parseRouteManifest(await readFile(manifestPath, "utf8"), "/page");
const adminAnalyticsManifest = parseRouteManifest(
  await readFile(adminAnalyticsManifestPath, "utf8"),
  "/admin/analytics/page",
);
const buildManifest = JSON.parse(await readFile(buildManifestPath, "utf8"));
const pageKey = "[project]/src/app/page";
const routeJavaScript = (routeManifest, routePageKey) => uniqueBuildPaths([
  ...(buildManifest.polyfillFiles ?? []),
  ...(buildManifest.rootMainFiles ?? []),
  ...(routeManifest.entryJSFiles?.[routePageKey] ?? []),
]);
const homeJavaScript = routeJavaScript(manifest, pageKey);
const adminAnalyticsJavaScript = routeJavaScript(
  adminAnalyticsManifest,
  "[project]/src/app/admin/analytics/page",
);
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
const adminAnalyticsJsSize = await measure(adminAnalyticsJavaScript);
const homeCssSize = await measure(homeCss);
const allJsSize = await measure(allJavaScript);
const allCssSize = await measure(allCss);

const measurements = [
  ["Homepage JavaScript (raw)", homeJsSize.raw, budgets.homeJavaScriptRaw],
  ["Homepage JavaScript (gzip)", homeJsSize.gzip, budgets.homeJavaScriptGzip],
  ["Homepage CSS (raw)", homeCssSize.raw, budgets.homeCssRaw],
  ["Homepage CSS (gzip)", homeCssSize.gzip, budgets.homeCssGzip],
  ["Largest JavaScript chunk (raw)", allJsSize.largestRaw, budgets.largestJavaScriptRaw],
  ["Admin analytics JavaScript (raw)", adminAnalyticsJsSize.raw, budgets.adminAnalyticsJavaScriptRaw],
  ["Admin analytics JavaScript (gzip)", adminAnalyticsJsSize.gzip, budgets.adminAnalyticsJavaScriptGzip],
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
