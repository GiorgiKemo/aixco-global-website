import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StoryMediaReveal, StorySceneReveal } from "./StoryReveal";

describe("StoryReveal", () => {
  it("renders staggered story scene children", () => {
    const { container, getByText, rerender } = render(
      <StorySceneReveal isActive className="flex flex-col gap-4">
        <p>Eyebrow</p>
        <h2>Headline</h2>
      </StorySceneReveal>,
    );

    expect(getByText("Eyebrow")).toBeInTheDocument();
    expect(getByText("Headline")).toBeInTheDocument();
    expect(container.querySelector("[data-story-scene-reveal-active='true']")).toBeInTheDocument();

    rerender(
      <StorySceneReveal isActive={false} className="flex flex-col gap-4">
        <p>Eyebrow</p>
        <h2>Headline</h2>
      </StorySceneReveal>,
    );

    expect(container.querySelector("[data-story-scene-reveal-active='false']")).toBeInTheDocument();
  });

  it("renders cinematic story media reveal wrapper", () => {
    const { container, getByTestId, rerender } = render(
      <StoryMediaReveal isActive className="story-media-panel">
        <div data-testid="story-media">Media frame</div>
      </StoryMediaReveal>,
    );

    expect(getByTestId("story-media")).toBeInTheDocument();
    expect(container.querySelector("[data-story-media-reveal-active='true']")).toBeInTheDocument();

    rerender(
      <StoryMediaReveal isActive={false} className="story-media-panel">
        <div data-testid="story-media">Media frame</div>
      </StoryMediaReveal>,
    );

    expect(container.querySelector("[data-story-media-reveal-active='false']")).toBeInTheDocument();
  });
});
