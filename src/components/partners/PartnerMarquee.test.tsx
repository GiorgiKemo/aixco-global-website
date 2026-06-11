import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PartnerMarquee } from "./PartnerMarquee";

const partners = [
  {
    name: "Workwise",
    group: "Group companies",
    modalLabel: "Group company",
    logo: "workwise",
    summary: "Enterprise SaaS and fintech operating platform.",
    detail: [],
  },
];

describe("PartnerMarquee", () => {
  it("eager-loads story logos and keeps fallback text inside every card", async () => {
    const { container } = render(
      <PartnerMarquee
        partners={partners}
        openPartner={vi.fn()}
        tx={(copy) => copy}
        variant="story"
      />,
    );

    const logos = container.querySelectorAll(".partner-marquee-item__logo");
    expect(logos).toHaveLength(2);
    logos.forEach((logo) => {
      expect(logo).toHaveAttribute("loading", "eager");
      expect(logo).toHaveAttribute("fetchpriority", "high");
      expect(logo).toHaveAttribute("decoding", "sync");
    });

    expect(container.querySelectorAll(".partner-marquee-item__fallback")).toHaveLength(2);
    expect(container.querySelector(".partner-marquee-item__fallback")).toHaveAttribute("data-logo-state", "pending");
    expect(screen.getAllByText("Workwise")).toHaveLength(4);

    const firstLogo = logos[0];
    fireEvent.load(firstLogo);
    await waitFor(() => {
      expect(container.querySelector(".partner-marquee-item__fallback")).toHaveAttribute("data-logo-state", "loaded");
    });
  });

  it("keeps story marquees running continuously", () => {
    const { container } = render(
      <PartnerMarquee
        partners={partners}
        openPartner={vi.fn()}
        tx={(copy) => copy}
        variant="story"
      />,
    );

    expect(container.querySelector(".partner-marquee-track-paused")).toBeNull();
    expect(container.querySelector('[data-marquee-paused="false"]')).toBeInTheDocument();
  });

  it("keeps non-story logos lazy-loaded", () => {
    const { container } = render(
      <PartnerMarquee
        partners={partners}
        openPartner={vi.fn()}
        tx={(copy) => copy}
      />,
    );

    const logos = container.querySelectorAll(".partner-marquee-item__logo");
    expect(logos).toHaveLength(2);
    logos.forEach((logo) => {
      expect(logo).toHaveAttribute("loading", "lazy");
      expect(logo).toHaveAttribute("fetchpriority", "auto");
      expect(logo).toHaveAttribute("decoding", "async");
    });
  });
});
