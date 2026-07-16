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
  it("lazy-loads story logos and keeps fallback text inside every card", async () => {
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

    expect(container.querySelectorAll(".partner-marquee-item__fallback")).toHaveLength(2);
    expect(container.querySelector(".partner-marquee-item__fallback")).toHaveAttribute("data-logo-state", "pending");
    expect(screen.getAllByText("Workwise")).toHaveLength(4);

    const firstLogo = logos[0];
    fireEvent.load(firstLogo);
    await waitFor(() => {
      expect(container.querySelector(".partner-marquee-item__fallback")).toHaveAttribute("data-logo-state", "loaded");
    });
  });

  it("keeps story marquees running continuously without a motion toggle", () => {
    const { container } = render(
      <PartnerMarquee
        partners={partners}
        openPartner={vi.fn()}
        tx={(copy) => copy}
      />,
    );

    expect(container.querySelector(".partner-marquee-track")).toBeInTheDocument();
    expect(container.querySelector(".partner-marquee-motion-toggle")).toBeNull();
    expect(screen.queryByLabelText("Pause partner movement")).toBeNull();
  });

});
