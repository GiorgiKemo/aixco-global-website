import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/i18n/I18nProvider";
import { Team } from "./Team";

vi.mock("../ui-state", () => ({
  useUI: () => ({
    openTeam: vi.fn(),
  }),
}));

describe("Team", () => {
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
});
