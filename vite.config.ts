import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { existsSync, rmSync } from "fs";

const legacySourceVideos = [
  "aixco-global-op2/images/batumi2.mp4",
  "aixco-global-op2/images/batumibuy.mp4",
  "aixco-global-op2/images/bonds.mp4",
  "aixco-global-op2/images/guru.mp4",
  "aixco-global-op2/images/tempo.mp4",
  "aixco-global-op2/images/fund/fund1.mp4",
  "aixco-global-op2/images/fund/fund2.mp4",
  "aixco-global-op2/images/fund/fund3.mp4",
];

function dropLegacySourceVideosFromBuild() {
  let outDir = "dist";

  return {
    name: "drop-legacy-source-videos-from-build",
    configResolved(config: { build: { outDir: string } }) {
      outDir = config.build.outDir;
    },
    closeBundle() {
      for (const videoPath of legacySourceVideos) {
        const resolvedPath = path.resolve(__dirname, outDir, videoPath);
        if (existsSync(resolvedPath)) {
          rmSync(resolvedPath);
        }
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), dropLegacySourceVideosFromBuild()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
