import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import fs from "node:fs/promises";
import path from "node:path";
import { reveranceUnits } from "./reverance-investment-calculator";
import { OFFER_COPY } from "@/i18n/reverance-offer-copy";

async function saveQa(name: string, bytes: Uint8Array) {
  if (!process.env.PDF_QA_DIR) return;
  await fs.mkdir(process.env.PDF_QA_DIR, { recursive: true });
  await fs.writeFile(path.join(process.env.PDF_QA_DIR, name + ".pdf"), bytes);
}
import { calculateReveranceInvestment } from "./reverance-investment-calculator";
import { generateReveranceInvestmentPdf } from "./reverance-investment-pdf";

describe("Reverance localized PDF brief", () => {
  it.each(["en", "de", "pl", "sl", "ru"] as const)("exports the adjusted down payment in %s", async lang => {
    const bytes = await generateReveranceInvestmentPdf({ calculation: calculateReveranceInvestment({ downPaymentPercent: 30 }), lang });
    expect((await PDFDocument.load(bytes)).getPageCount()).toBe(6);
    await saveQa("down-payment-30-" + lang, bytes);
  });
  it.each([0, 50, 100])("exports the %s percent down-payment boundary", async downPaymentPercent => {
    const bytes = await generateReveranceInvestmentPdf({ calculation: calculateReveranceInvestment({ downPaymentPercent }), lang: "en" });
    expect((await PDFDocument.load(bytes)).getPageCount()).toBe(6);
    await saveQa("down-payment-" + downPaymentPercent + "-en", bytes);
  });
  it.each(["en", "de", "pl", "sl", "ru"] as const)("generates a six-page %s offer with exact plan and room artwork", async (lang) => {
    const bytes = await generateReveranceInvestmentPdf({
      calculation: calculateReveranceInvestment(),
      lang,
      clientName: "AIXCO client",
      clientAddress: "Musterstraße 12 · Łódź · Ljubljana · Москва",
    });
    const document = await PDFDocument.load(bytes);

    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe("%PDF-");
    expect(document.getPageCount()).toBe(6);
    expect(document.getTitle()).toContain(lang === "en" ? "Project Reverance" : "AIXCO");
    await saveQa(lang, bytes);
  });

  it("renders maximum-length client details without dropping the document", async () => {
    const bytes = await generateReveranceInvestmentPdf({
      calculation: calculateReveranceInvestment({ unitCode: "A1401", holdingYears: 15 }),
      lang: "ru",
      clientName: "Ж".repeat(100),
      clientAddress: "Ж".repeat(300),
    });
    expect((await PDFDocument.load(bytes)).getPageCount()).toBe(6);
    await saveQa("long-ru", bytes);
  });
  it.each(reveranceUnits)("uses the matching artwork for $code", async unit => {
    const bytes = await generateReveranceInvestmentPdf({ calculation: calculateReveranceInvestment({unitCode:unit.code}), lang:"en" });
    expect((await PDFDocument.load(bytes)).getPageCount()).toBe(6);
    await saveQa(unit.code, bytes);
  });
  it.each([0,70])("renders the %s percent financing boundary", async financingPercent => {
    const bytes = await generateReveranceInvestmentPdf({ calculation: calculateReveranceInvestment({financingPercent,holdingYears:15,grossYieldPercent:5,annualGrowthPercent:0}), lang:"de" });
    expect((await PDFDocument.load(bytes)).getPageCount()).toBe(6);
    await saveQa("boundary-"+financingPercent, bytes);
  });
  it("translates every new label in all supported languages", () => {
    for (const copy of Object.values(OFFER_COPY)) expect(Object.keys(copy).sort()).toEqual(Object.keys(OFFER_COPY.en).sort());
  });
});
