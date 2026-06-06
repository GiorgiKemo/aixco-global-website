import { stat } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const watchedFiles = [
  "src/index.css",
  "src/components/sections/DesktopStoryHome.tsx",
  "src/components/ScrollManager.tsx",
  "src/app/client-shell.tsx",
];

async function getDevRuntimeVersion() {
  if (process.env.NODE_ENV !== "development") return "production";

  const versions = await Promise.all(
    watchedFiles.map(async (filePath) => {
      try {
        const fileStat = await stat(join(process.cwd(), filePath));
        return `${filePath}:${fileStat.mtimeMs}`;
      } catch {
        return `${filePath}:missing`;
      }
    }),
  );

  return versions.join("|");
}

export async function GET() {
  const response = NextResponse.json({
    version: await getDevRuntimeVersion(),
  });

  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  response.headers.set("Pragma", "no-cache");

  return response;
}
