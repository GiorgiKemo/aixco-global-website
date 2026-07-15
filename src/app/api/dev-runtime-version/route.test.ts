import { describe, expect, it } from "vitest";
import { GET, getDevRuntimeVersion, getWatchedRuntimeFiles, isRuntimeSourceFile } from "./route";

describe("dev runtime version", () => {
  it("is not exposed outside development", async () => {
    expect((await GET()).status).toBe(404);
  });

  it("tracks runtime component files that affect the open localhost page", async () => {
    const watchedFiles = await getWatchedRuntimeFiles(process.cwd());

    expect(watchedFiles).toContain("src/components/partners/PartnerMarquee.tsx");
    expect(watchedFiles).toContain("src/components/sections/dubai/DubaiImageMarquee.tsx");
    expect(watchedFiles).toContain("src/index.css");
    expect(watchedFiles).not.toContain("src/components/sections/Dubai.test.tsx");
  });

  it("filters tests and type declarations out of runtime source detection", () => {
    expect(isRuntimeSourceFile("src/components/partners/PartnerMarquee.tsx")).toBe(true);
    expect(isRuntimeSourceFile("src/components/sections/Dubai.test.tsx")).toBe(false);
    expect(isRuntimeSourceFile("src/components/example.stories.tsx")).toBe(false);
    expect(isRuntimeSourceFile("src/app/next-env.d.ts")).toBe(false);
  });

  it("changes development runtime version based on watched source metadata", async () => {
    const version = await getDevRuntimeVersion({ nodeEnv: "development" });

    expect(version).toContain("src/components/partners/PartnerMarquee.tsx:");
    expect(version).toContain("src/components/sections/dubai/DubaiImageMarquee.tsx:");
  });
});
