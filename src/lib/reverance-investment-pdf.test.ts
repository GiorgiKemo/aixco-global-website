import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { calculateReveranceInvestment } from "./reverance-investment-calculator";
import { generateReveranceInvestmentPdf } from "./reverance-investment-pdf";

describe("Reverance localized PDF brief", () => {
  it.each(["en", "de", "pl", "sl", "ru"] as const)("generates a five-page %s brief", async (lang) => {
    const bytes = await generateReveranceInvestmentPdf({
      calculation: calculateReveranceInvestment(),
      lang,
      clientName: "AIXCO client",
      clientAddress: "Musterstraße 12 · Łódź · Ljubljana · Москва",
    });
    const document = await PDFDocument.load(bytes);

    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe("%PDF-");
    expect(document.getPageCount()).toBe(5);
    expect(document.getTitle()).toContain(lang === "en" ? "Project Reverance" : "AIXCO");
  });

  it("renders maximum-length client details without dropping the document", async () => {
    const bytes = await generateReveranceInvestmentPdf({
      calculation: calculateReveranceInvestment({ unitCode: "A1401", holdingYears: 15 }),
      lang: "ru",
      clientName: "Ж".repeat(100),
      clientAddress: "Ж".repeat(300),
    });
    expect((await PDFDocument.load(bytes)).getPageCount()).toBe(5);
  });
});
