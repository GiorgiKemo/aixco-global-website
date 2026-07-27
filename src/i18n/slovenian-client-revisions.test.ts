import { describe, expect, it } from "vitest";
import { slovenianClientRevisions } from "./slovenian-client-revisions";

describe("client-approved Slovenian document catalog", () => {
  it("covers the complete website brief rather than only highlighted rows", () => {
    expect(Object.keys(slovenianClientRevisions).length).toBeGreaterThanOrEqual(150);
  });

  it("matches the approved hero, positioning, and client copy", () => {
    expect(slovenianClientRevisions).toMatchObject({
      "Wise selection. Recurring income generation.": {
        sl: "Modra izbira. Ponavljajoči se prihodki.",
      },
      "Global Real Estate": { sl: "Global Real Estate" },
      "Emerging Market Opportunities": {
        sl: "Priložnosti na razvijajočih se trgih",
      },
      "Since 2009, AIXCO has bought, sold, and brokered real estate across Europe and the Gulf - today focused on selected emerging-market opportunities, with a legacy track record in Switzerland and Dubai.": {
        sl: "Od leta 2009 je podjetje AIXCO kupovalo, prodajalo in posredovalo pri prodaji nepremičnin po Evropi in Zalivu - danes se osredotoča na izbrane priložnosti na razvijajočih se trgih, z bogato tradicijo v Švici in Dubaju.",
      },
      "Rather than offering a one-size-fits-all solution, we begin by understanding what matters most to you.": {
        sl: "Namesto da bi ponudili univerzalno rešitev, začnemo tako, da najprej razumemo, kaj je za vas najpomembnejše.",
      },
    });
  });

  it("matches every document-defined commercial value and Batumi label", () => {
    expect(slovenianClientRevisions).toMatchObject({
      "5,000+": { sl: "5.000+" },
      "$400M": { sl: "€400M" },
      "$400M+": { sl: "€400M+" },
      "2,000+": { sl: "2.000+" },
      "$4.2B+": { sl: "€4.2B+" },
      "USD 800m+ development volume": { sl: "$800M+ vrednost razvojnega obsega projektov" },
      "USD 462m": { sl: "$462M" },
      "USD 350m mixed-use program": { sl: "$350M, večnamenski program" },
      "€5k": { sl: "€5k" },
      "€45k": { sl: "€45k" },
      "60%+": { sl: "60 %+" },
      "12%": { sl: "12 %" },
      "Project Reverance": { sl: "Projekt Reverance" },
    });
  });

  it("matches the approved materials, journeys, FAQ, and footer wording", () => {
    expect(slovenianClientRevisions).toMatchObject({
      "Download Materials": { sl: "Prenos gradiv" },
      "ACQUIRE.PARTNER.CREATE VALUE.": {
        sl: "KUPITE. SODELUJTE. USTVARITE VREDNOST.",
      },
      "Journey 01": { sl: "Pot 01" },
      "Customer Real Estate Buyer": { sl: "Kupec nepremičnine" },
      "FAQ essentials": { sl: "Osnovna pogosta vprašanja" },
      "The minimum investment amount is €5,000.": {
        sl: "Minimalni znesek naložbe je €5.000.",
      },
      "Start with AIXCO": { sl: "Začnite z AIXCO" },
      "Terms & Conditions": { sl: "Splošni pogoji poslovanja" },
      "Privacy Policy": { sl: "Politika zasebnosti" },
    });
  });
});
