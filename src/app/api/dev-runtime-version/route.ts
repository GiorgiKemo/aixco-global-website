import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const runtimeSourceRoots = ["src/app", "src/components", "src/data", "src/hooks", "src/i18n", "src/lib", "src/index.css"];
const runtimeSourceExtensions = new Set([".css", ".js", ".jsx", ".json", ".ts", ".tsx"]);

function toRuntimePath(filePath: string) {
  return filePath.replace(/\\/g, "/");
}

function getRuntimeExtension(fileName: string) {
  const extensionStart = fileName.lastIndexOf(".");
  return extensionStart >= 0 ? fileName.slice(extensionStart) : "";
}

export function isRuntimeSourceFile(filePath: string) {
  const normalizedPath = toRuntimePath(filePath);
  const fileName = normalizedPath.split("/").pop() ?? "";
  const extension = getRuntimeExtension(fileName);

  if (!runtimeSourceExtensions.has(extension)) return false;
  if (fileName.endsWith(".d.ts")) return false;
  if (/\.(test|spec|stories)\.[jt]sx?$/.test(fileName)) return false;
  if (normalizedPath.includes("/__tests__/")) return false;

  return true;
}

function resolveRuntimePath(cwd: string, relativePath: string) {
  return `${cwd.replace(/[\\/]$/, "")}/${relativePath}`;
}

export async function getWatchedRuntimeFiles(cwd: string) {
  const { readdir, stat } = await import("node:fs/promises");
  const watchedFiles = new Set<string>();

  const collectPath = async (relativePath: string) => {
    const absolutePath = resolveRuntimePath(cwd, relativePath);
    const fileStat = await stat(absolutePath);

    if (fileStat.isFile()) {
      if (isRuntimeSourceFile(relativePath)) watchedFiles.add(toRuntimePath(relativePath));
      return;
    }

    if (!fileStat.isDirectory()) return;

    const entries = await readdir(absolutePath, { withFileTypes: true });
    await Promise.all(
      entries.map(async (entry) => {
        const childPath = `${relativePath}/${entry.name}`;
        if (entry.isDirectory()) {
          if (entry.name.startsWith(".")) return;
          await collectPath(childPath);
          return;
        }

        if (entry.isFile() && isRuntimeSourceFile(childPath)) {
          watchedFiles.add(childPath);
        }
      }),
    );
  };

  await Promise.all(runtimeSourceRoots.map((sourceRoot) => collectPath(sourceRoot)));

  return [...watchedFiles].sort();
}

export async function getDevRuntimeVersion({
  cwd,
  nodeEnv = process.env.NODE_ENV,
}: {
  cwd?: string;
  nodeEnv?: string;
} = {}) {
  if (nodeEnv !== "development") return "production";

  const root = cwd ?? process.cwd();
  const { stat } = await import("node:fs/promises");
  const watchedFiles = await getWatchedRuntimeFiles(root);
  const versions = await Promise.all(
    watchedFiles.map(async (filePath) => {
      try {
        const fileStat = await stat(resolveRuntimePath(root, filePath));
        return `${filePath}:${fileStat.mtimeMs}:${fileStat.size}`;
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
