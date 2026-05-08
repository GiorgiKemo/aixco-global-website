import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteContentContext } from "@/data/site-content-context";
import { newsTickerItems } from "@/data/news";
import { siteContentDefaults } from "@/lib/backend/site-content";
import { NewsTicker } from "./NewsTicker";

describe("NewsTicker", () => {
  it("renders mock agency news as a seamless horizontal banner under the hero", () => {
    render(<NewsTicker />);

    const region = screen.getByRole("region", { name: /latest news/i });
    const tickerSets = within(region).getAllByTestId("news-ticker-set");
    const primaryLinks = within(tickerSets[0]).getAllByRole("link");
    const cloneLinks = tickerSets[1].querySelectorAll("a");

    expect(region).toHaveAttribute("data-section", "news-ticker");
    expect(region.className).toContain("news-ticker");
    expect(region.className).toContain("overflow-hidden");
    expect(screen.getByText("Latest")).toBeInTheDocument();
    expect(screen.getByText("Agency feed")).toBeInTheDocument();
    expect(tickerSets).toHaveLength(2);
    expect(tickerSets[1]).toHaveAttribute("aria-hidden", "true");
    expect(primaryLinks).toHaveLength(newsTickerItems.length);
    expect(cloneLinks).toHaveLength(newsTickerItems.length);
    expect(primaryLinks[0]).toHaveAttribute("target", "_blank");
    expect(primaryLinks[0]).toHaveAttribute("rel", "noreferrer");
    cloneLinks.forEach((link) => expect(link).toHaveAttribute("tabindex", "-1"));
  });

  it("does not render CMS news links outside AIXCO", () => {
    render(
      <SiteContentContext.Provider
        value={{
          ...siteContentDefaults,
          newsTickerItems: [
            {
              ...siteContentDefaults.newsTickerItems[0],
              href: "https://evil.example/op2/annual-property-growth-batumi.html",
            },
          ],
        }}
      >
        <NewsTicker />
      </SiteContentContext.Provider>,
    );

    const link = screen.getAllByRole("link")[0];

    expect(link).toHaveAttribute("href", "https://www.aixco.global/op2/");
  });
});
