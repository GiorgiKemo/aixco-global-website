import { describe, expect, it } from "vitest";
import { slovenianClientRevisions } from "./slovenian-client-revisions";

describe("client-reviewed Slovenian revisions", () => {
  it("contains every highlighted bilingual-document revision", () => {
    expect(slovenianClientRevisions).toMatchObject({
      "Global Real Estate": { sl: "Global Real Estate" },
      "Gross Development Value (GDV)": { sl: "Skupna razvojna vrednost (GDV)" },
      "Total Transactions": { sl: "Skupno število transakcij" },
      "In Business Since": { sl: "Poslujemo od leta" },
      "Current gross development value": { sl: "Trenutna skupna razvojna vrednost" },
      "From Switzerland to Dubai to Batumi": { sl: "Od Švice do Dubaja do Batumija" },
      "Swiss real estate heritage": { sl: "Švicarska nepremičninska dediščina" },
      "CHF 1.1 billion": { sl: "CHF 1,1 milijarde" },
      "Gulf developments delivered": { sl: "Zaključeni razvojni projekti v Zalivu" },
      "Current focus in Georgia": { sl: "Trenutni fokus v Gruziji" },
      "Selected apartments from €45,000": { sl: "Izbrana stanovanja že od €45.000" },
      "Legacy portfolio — realized": { sl: "Portfelj — zaključeno" },
      "Legacy portfolio — in progress": { sl: "Portfelj — v izvajanju" },
      "USD 350m mixed-use program": { sl: "$350M, večnamenski program" },
      "ACQUIRE.PARTNER.CREATE VALUE.": {
        sl: "KUPITE. SODELUJTE. USTVARITE VREDNOST.",
      },
    });
  });

  it("uses the exact client-approved long-form copy", () => {
    expect(
      slovenianClientRevisions[
        "Rather than offering a one-size-fits-all solution, we begin by understanding what matters most to you."
      ].sl,
    ).toBe(
      "Namesto da bi ponudili univerzalno rešitev, začnemo tako, da najprej razumemo, kaj je za vas najpomembnejše.",
    );

    expect(
      slovenianClientRevisions[
        "Customers sign up, review selected apartments, book a private tour, and move through reservation and purchase with the AIXCO team."
      ].sl,
    ).toBe(
      "Stranke se registrirajo, si ogledajo izbrana stanovanja, rezervirajo zasebni ogled ter skupaj z ekipo AIXCO opravijo rezervacijo in nakup.",
    );

    expect(
      slovenianClientRevisions[
        "Typically, buyers contribute 40% equity, with financing available for up to 60% of the property value. Depending on your financial profile and financing structure, the required equity contribution may be lower."
      ].sl,
    ).toContain("financiranje od minimalno 60 % vrednosti nepremičnine");
  });
});
