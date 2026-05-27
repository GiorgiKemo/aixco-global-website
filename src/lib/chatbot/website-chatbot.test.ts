import { describe, expect, it } from "vitest";
import { siteContentDefaults } from "@/lib/backend/site-content";
import { answerWebsiteChat } from "./website-chatbot";

function ask(text: string) {
  return answerWebsiteChat([{ role: "visitor", text }], siteContentDefaults);
}

describe("website chatbot", () => {
  it("answers developer partnership questions from the website journey and FAQs", () => {
    const answer = ask("How can AIXCO help developer partners?");

    expect(answer.confidence).toBe("high");
    expect(answer.answer).toContain("Developer");
    expect(answer.answer).toMatch(/project|distribution|sales|visibility/i);
    expect(answer.matchedTopics.length).toBeGreaterThan(0);
  });

  it("answers Batumi ownership and property questions from the website content", () => {
    const answer = ask("Can foreigners buy Batumi apartments and what are the benefits?");

    expect(answer.confidence).toBe("high");
    expect(answer.answer).toMatch(/foreigners can purchase and own real estate/i);
    expect(answer.answer).toContain("Rental income scenarios");
  });

  it("answers minimum investment questions from the FAQ", () => {
    const answer = ask("What is the minimum amount to reserve or buy?");

    expect(answer.answer).toContain("starts from");
    expect(answer.answer).toContain("\u20ac10,000");
    expect(answer.answer).not.toContain("\u00e2");
  });

  it("does not invent answers outside website content", () => {
    const answer = ask("Can you guarantee my personal tax result in Canada?");

    expect(answer.confidence).toBe("low");
    expect(answer.answer).toContain("I do not have enough website content");
  });
});
