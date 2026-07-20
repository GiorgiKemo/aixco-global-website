import { describe, expect, it } from "vitest";

import { batumiProperties } from "./site";

describe("current Batumi project data", () => {
  it("matches the latest Reverance project deck without the former developer suffix", () => {
    const project = batumiProperties.find((property) => property.id === "current-project");

    expect(project).toMatchObject({
      name: "Reverance",
      metrics: [
        { label: "Floors", value: "17", subtext: "per building" },
        { label: "Apartments", value: "408", subtext: "total units" },
        { label: "Completion", value: "Jun 2028", subtext: "target" },
      ],
    });
    expect(project?.summary).toContain("28 selected apartments");
    expect(project?.summary).toContain("13th and 14th floors");
    expect(project?.summary).toMatch(/^Reverance is a premium residential complex/);
    expect(JSON.stringify(project)).not.toMatch(/by Otium/i);
    expect(project?.highlights).toContainEqual({
      label: "Location",
      value: "59 Adlia Street, with New Boulevard 5 minutes away, shopping and airport access 7 minutes away, and Batumi Medical Center 8 minutes away.",
    });
  });
});
