import { describe, expect, it } from "vitest";

import { formatMetricValue } from "./dubai-data";

describe("formatMetricValue", () => {
  it("formats Dubai USD millions with the shared dollar treatment and uppercase M", () => {
    expect(formatMetricValue("USD 462m")).toEqual({
      prefix: "",
      value: "$462M",
      subtext: "",
      preserveLocalizedValue: true,
    });

    expect(formatMetricValue("USD 350m mixed-use program")).toEqual({
      prefix: "",
      value: "$350M mixed-use program",
      subtext: "",
      preserveLocalizedValue: true,
    });
  });

  it("keeps non-currency metric formatting unchanged", () => {
    expect(formatMetricValue("600+")).toEqual({
      prefix: "",
      value: "600",
      subtext: "+",
      preserveLocalizedValue: false,
    });

    expect(formatMetricValue("~20% developed")).toEqual({
      prefix: "",
      value: "~20% developed",
      subtext: "",
      preserveLocalizedValue: false,
    });
  });
});
