import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import { Team, getTeamPortraitLoading } from "./Team";

function renderedImageSrc(image: HTMLElement) {
  return image.getAttribute("src") ?? "";
}

vi.mock("../ui-state", () => ({
  useUI: () => ({
    openTeam: vi.fn(),
  }),
}));

describe("Team", () => {
  it("centers the section heading and card grid as one composition", () => {
    const { container } = render(
      <I18nProvider>
        <Team />
      </I18nProvider>,
    );

    const heading = screen.getByRole("heading", { name: "Our Team" });
    const profileGrid = container.querySelector("[data-layout='team-profile-grid']");

    expect(heading.parentElement?.className).toContain("mx-auto");
    expect(heading.parentElement?.className).toContain("text-center");
    expect(profileGrid).toBeInTheDocument();
    expect(profileGrid?.className).toContain("w-full");
    expect(profileGrid?.className).toContain("max-w-[65rem]");
    expect(profileGrid?.className).toContain("mx-auto");
  });

  it("uses a valid targeted transition for photo hover treatment", () => {
    render(
      <I18nProvider>
        <Team />
      </I18nProvider>,
    );

    const image = screen.getByAltText("Benjamin Fischer");

    expect(image.className).toContain("transition-[filter,transform]");
    expect(image.className).toContain("[transition-duration:400ms]");
    expect(image.className).not.toContain("transition-all");
    expect(image.className).not.toContain("duration-400");
  });

  it("keeps the middle portrait framed consistently on tablet", () => {
    render(
      <I18nProvider>
        <Team />
      </I18nProvider>,
    );

    const middleImage = screen.getByAltText("Owais Shaikh");
    expect(middleImage.className).toContain("md:object-[center_20%]");
  });

  it("serves visible team portraits directly from optimized static files", () => {
    render(
      <I18nProvider>
        <Team />
      </I18nProvider>,
    );

    const image = screen.getByAltText("Benjamin Fischer");
    const src = renderedImageSrc(image);

    expect(src).toContain("/aixco-global-op2/images/optimized/benjamin.webp");
    expect(src).not.toContain("/_next/image");
    expect(image).toHaveAttribute("loading", "eager");
    expect(image).toHaveAttribute("fetchpriority", "high");
  });

  it("does not prioritize team portraits before the team section is close to the viewport", () => {
    expect(getTeamPortraitLoading({ isTeamInView: false, index: 0 })).toMatchObject({
      fetchPriority: "auto",
      loading: "lazy",
    });
    expect(getTeamPortraitLoading({ isTeamInView: true, index: 0 })).toMatchObject({
      fetchPriority: "high",
      loading: "eager",
    });
  });
});
