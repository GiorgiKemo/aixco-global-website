import { render } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { StoryMediaReveal, StorySceneReveal } from "./StoryReveal";

const storyRevealSource = readFileSync("src/components/StoryReveal.tsx", "utf8");
const css = readFileSync("src/index.css", "utf8").replace(/\r\n/g, "\n");

describe("StoryReveal", () => {
  it("renders scene children with one CSS-driven transform entrance", () => {
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
    const sceneRevealStart = storyRevealSource.indexOf("export function StorySceneReveal");
    const sceneRevealSource = storyRevealSource.slice(sceneRevealStart);
    expect(sceneRevealSource).toContain("<div");
    expect(sceneRevealSource).toContain("<div key={index}>{child}</div>");
    expect(sceneRevealSource).not.toContain("staggerChildren");
    expect(sceneRevealSource).not.toContain("variants={storySceneItem}");
    const keyframesStart = css.indexOf("@keyframes story-copy-settle");
    const keyframesEnd = css.indexOf("body.story-mobile-menu-open", keyframesStart);
    const keyframes = css.slice(keyframesStart, keyframesEnd);
    expect(keyframesStart).toBeGreaterThanOrEqual(0);
    expect(keyframes).toContain("transform: translate3d(0, 1rem, 0);");
    expect(keyframes).not.toContain("opacity:");
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
