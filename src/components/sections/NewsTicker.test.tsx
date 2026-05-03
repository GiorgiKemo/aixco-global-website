import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { newsTickerItems } from "@/data/news";
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
});
