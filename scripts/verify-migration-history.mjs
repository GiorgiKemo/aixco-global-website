import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const migrationsDirectory = resolve(process.cwd(), "supabase/migrations");
const migrationNamePattern = /^(\d{14})_[a-z0-9_]+\.sql$/;

const entries = (await readdir(migrationsDirectory, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
  .map((entry) => entry.name)
  .sort((left, right) => left.localeCompare(right));

if (entries.length === 0) {
  throw new Error("No Supabase migrations were found.");
}

const seenVersions = new Set();
let previousVersion = "";

for (const migration of entries) {
  const match = migration.match(migrationNamePattern);
  if (!match) {
    throw new Error(
      `Invalid migration filename ${migration}. Expected YYYYMMDDHHMMSS_descriptive_name.sql.`,
    );
  }

  const version = match[1];
  if (seenVersions.has(version)) {
    throw new Error(`Duplicate Supabase migration version ${version}.`);
  }
  if (previousVersion && version <= previousVersion) {
    throw new Error(`Migration ${migration} is not ordered after ${previousVersion}.`);
  }

  const sql = await readFile(resolve(migrationsDirectory, migration), "utf8");
  if (!sql.trim()) {
    throw new Error(`Migration ${migration} is empty.`);
  }
  if (/^(<{7}|={7}|>{7})/m.test(sql)) {
    throw new Error(`Migration ${migration} contains unresolved merge markers.`);
  }

  seenVersions.add(version);
  previousVersion = version;
}

console.log(
  `Supabase migration history passed: ${entries.length} ordered migration files through ${previousVersion}.`,
);
