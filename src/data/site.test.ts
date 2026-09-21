import fs from "node:fs";
import path from "node:path";
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
        { label: "Completion", value: "Jul 2028", subtext: "target" },
      ],
    });
    expect(project?.summary).toContain("regular and Golden Premium apartments");
    expect(project?.summary).toContain("both buildings");
    expect(project?.summary).not.toMatch(/28-apartment|24 are|4 are reserved|13th and 14th/);
    expect(project?.summary).toContain("July 2028");
    expect(project?.summary).toMatch(/^Selected residences in one of Batumi's most dynamic coastal districts/);
    expect(JSON.stringify(project)).not.toMatch(/by Otium/i);
    expect(project?.highlights).toContainEqual({
      label: "Location",
      value: "59 Adlia Street, with New Boulevard 5 minutes away, shopping and airport access 7 minutes away, and Batumi Medical Center 8 minutes away.",
    });
    expect(project?.highlights).toContainEqual({
      label: "Current availability",
      value: "Available regular and Golden Premium apartments across both buildings.",
    });
  });

  it("keeps the database-backed content aligned with the brochure date", () => {
    const migration = fs.readFileSync(
      path.join(
        process.cwd(),
        "supabase",
        "migrations",
        "20260721101730_update_current_project_completion_july_2028.sql",
      ),
      "utf8",
    );

    expect(migration).toContain("completion targeted for July 2028");
    expect(migration).toContain("jsonb_build_object('value', 'Jul 2028')");
    expect(migration).not.toMatch(/June 2028|Jun 2028/);
  });
});
