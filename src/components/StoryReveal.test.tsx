import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MotionReveal, StoryMediaReveal, StorySceneReveal } from "./StoryReveal";

describe("StoryReveal", () => {
  it("renders motion reveal wrappers for native scroll", () => {
    const { getByText } = render(
      <MotionReveal>
        <p>Editorial copy</p>
      </MotionReveal>,
    );

    expect(getByText("Editorial copy")).toBeInTheDocument();
  });

  it("renders staggered story scene children", () => {
    const { getByText } = render(
      <StorySceneReveal isActive className="flex flex-col gap-4">
        <p>Eyebrow</p>
        <h2>Headline</h2>
      </StorySceneReveal>,
    );

    expect(getByText("Eyebrow")).toBeInTheDocument();
    expect(getByText("Headline")).toBeInTheDocument();
  });

  it("renders cinematic story media reveal wrapper", () => {
    const { getByTestId } = render(
      <StoryMediaReveal isActive className="story-media-panel">
        <div data-testid="story-media">Media frame</div>
      </StoryMediaReveal>,
    );

    expect(getByTestId("story-media")).toBeInTheDocument();
  });
});
