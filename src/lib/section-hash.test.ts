import { afterEach, describe, expect, it } from "vitest";
import { getActiveSectionHash, syncLocationHashToActiveSection } from "./section-hash";

const sectionIds = ["about", "dubai", "batumi"] as const;

function mockSection(id: string, rect: Partial<DOMRect>) {
  const section = document.createElement("section");
  section.id = id;
  section.getBoundingClientRect = () =>
    ({
      top: rect.top ?? 0,
      bottom: rect.bottom ?? 0,
      left: rect.left ?? 0,
      right: rect.right ?? 0,
      width: rect.width ?? 0,
      height: rect.height ?? 0,
      x: rect.x ?? 0,
      y: rect.y ?? 0,
      toJSON: () => ({}),
    }) as DOMRect;
  document.body.append(section);
  return section;
}

describe("section hash sync", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    window.history.replaceState({}, "", "/");
  });

  it("finds the section crossing the active marker", () => {
    mockSection("about", { top: -500, bottom: -100 });
    mockSection("dubai", { top: -40, bottom: 400 });
    mockSection("batumi", { top: 700, bottom: 1400 });

    expect(getActiveSectionHash(sectionIds)).toBe("#dubai");
  });

  it("replaces a stale section hash after manual scrolling", () => {
    window.history.replaceState({}, "", "/?heroWall=1#batumi");
    mockSection("about", { top: -500, bottom: -100 });
    mockSection("dubai", { top: -40, bottom: 400 });
    mockSection("batumi", { top: 700, bottom: 1400 });

    expect(syncLocationHashToActiveSection(sectionIds)).toBe("#dubai");
    expect(window.location.pathname).toBe("/");
    expect(window.location.search).toBe("?heroWall=1");
    expect(window.location.hash).toBe("#dubai");
  });

  it("removes a stale hash when no tracked section is active", () => {
    window.history.replaceState({}, "", "/?heroWall=1#batumi");
    mockSection("about", { top: 300, bottom: 900 });
    mockSection("dubai", { top: 1000, bottom: 1500 });
    mockSection("batumi", { top: 1700, bottom: 2300 });

    expect(syncLocationHashToActiveSection(sectionIds)).toBe("");
    expect(window.location.pathname).toBe("/");
    expect(window.location.search).toBe("?heroWall=1");
    expect(window.location.hash).toBe("");
  });
});
