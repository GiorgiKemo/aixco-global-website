import { describe, expect, it } from "vitest";
import { propertyPageTranslations } from "./property-page-translations";

describe("Project Reverance label translations", () => {
  it("provides the approved label in every supported language", () => {
    expect(propertyPageTranslations["Project Reverance"]).toEqual({
      de: "Projekt Reverance",
      ru: "Проект Reverance",
      pl: "Projekt Reverance",
      sl: "Projekt Reverance",
    });
  });
});
