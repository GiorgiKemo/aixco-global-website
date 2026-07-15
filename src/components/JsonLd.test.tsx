import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JsonLd, serializeJsonLd } from "./JsonLd";

describe("JsonLd", () => {
  it("serializes structured data without allowing a closing script tag", () => {
    expect(serializeJsonLd({ name: "</script><script>alert(1)</script>" })).not.toContain("</script>");
  });

  it("renders a machine-readable JSON-LD script", () => {
    const { container } = render(<JsonLd data={{ "@context": "https://schema.org", "@type": "WebSite" }} />);
    const script = container.querySelector('script[type="application/ld+json"]');

    expect(script).toBeInTheDocument();
    expect(JSON.parse(script?.textContent ?? "{}")).toMatchObject({ "@type": "WebSite" });
  });
});
