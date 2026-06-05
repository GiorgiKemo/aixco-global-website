import { spawn } from "node:child_process";
import net from "node:net";
import { resolve } from "node:path";

const host = process.env.DEV_HOST || "127.0.0.1";
const preferredPort = Number(process.env.DEV_PORT || process.env.PORT || 8081);
const maxAttempts = Number(process.env.DEV_PORT_ATTEMPTS || 20);

function canConnect(port, connectHost) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: connectHost, port });

    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("error", () => resolve(false));
    socket.setTimeout(350, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

function canBind(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen({ host, port, exclusive: true });
  });
}

async function isPortAvailable(port) {
  const hasActiveListener = await Promise.all([
    canConnect(port, "127.0.0.1"),
    canConnect(port, "::1"),
  ]);

  if (hasActiveListener.some(Boolean)) return false;
  return canBind(port);
}

async function servesCurrentApp(port) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1200);

  try {
    const response = await fetch(`http://${host}:${port}`, { signal: controller.signal });
    const html = await response.text();
    return response.ok && html.includes("AIXCO.Global");
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

async function findAvailablePort() {
  for (let offset = 0; offset < maxAttempts; offset += 1) {
    const port = preferredPort + offset;
    if (await isPortAvailable(port)) return { port, reuse: false };
    if (port === preferredPort && await servesCurrentApp(port)) return { port, reuse: true };
  }

  throw new Error(`No free dev port found from ${preferredPort} to ${preferredPort + maxAttempts - 1}.`);
}

const { port, reuse } = await findAvailablePort();
const extraArgs = process.argv.slice(2);
const nextBin = resolve("node_modules", "next", "dist", "bin", "next");

if (reuse) {
  console.log(`[dev] AIXCO is already running on http://${host}:${port}`);
} else {
  console.log(`[dev] Starting Next.js on http://${host}:${port}`);
  if (port !== preferredPort) {
    console.log(`[dev] Port ${preferredPort} is busy, using ${port} instead.`);
  }

  const child = spawn(process.execPath, [nextBin, "dev", "-H", host, "-p", String(port), ...extraArgs], {
    stdio: "inherit",
    shell: false,
  });

  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, () => {
      child.kill(signal);
    });
  }

  child.on("exit", (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    process.exit(code ?? 0);
  });
}
