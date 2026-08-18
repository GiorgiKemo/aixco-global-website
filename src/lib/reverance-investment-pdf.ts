import "server-only";

import fs from "node:fs/promises";
import path from "node:path";
import fontkit from "@pdf-lib/fontkit";
import {
  clip,
  closePath,
  endPath,
  lineTo,
  moveTo,
  PDFDocument,
  popGraphicsState,
  pushGraphicsState,
  rgb,
  type PDFFont,
  type PDFPage,
  type RGB,
} from "pdf-lib";
import type { Lang } from "@/i18n/languages";
import { translateReveranceCalculatorText } from "@/i18n/reverance-calculator-translations";
import type { InvestmentCalculation } from "@/lib/reverance-investment-calculator";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 48;

const colors = {
  paper: rgb(0.953, 0.929, 0.882),
  white: rgb(1, 1, 1),
  ink: rgb(0.086, 0.086, 0.086),
  navy: rgb(0, 0.129, 0.278),
  gold: rgb(0.902, 0.78, 0.404),
  deepGold: rgb(0.49, 0.36, 0.09),
  muted: rgb(0.38, 0.37, 0.34),
  line: rgb(0.76, 0.74, 0.69),
  paleGold: rgb(0.91, 0.86, 0.75),
} as const;

type FontFace = {
  pdf: PDFFont;
  hasGlyph: (codePoint: number) => boolean;
};

type FontPack = {
  regular: FontFace;
  bold: FontFace;
  latinExt: FontFace;
  latinExtBold: FontFace;
  cyrillic: FontFace;
  cyrillicBold: FontFace;
};

type TextOptions = {
  x: number;
  top: number;
  size: number;
  color: RGB;
  bold?: boolean;
  maxWidth?: number;
  lineHeight?: number;
};

type EmbeddedImage = Parameters<PDFPage["drawImage"]>[0];

function textValue(value: string, lang: Lang) {
  return translateReveranceCalculatorText(value, lang);
}

function topY(top: number, size = 0) {
  return PAGE_HEIGHT - top - size;
}

function drawTopText(page: PDFPage, text: string, options: TextOptions, fonts: FontPack) {
  const runs = splitRuns(text, fonts, Boolean(options.bold));
  let x = options.x;
  for (const run of runs) {
    for (const character of Array.from(run.text)) {
      page.drawText(character, {
        x,
        y: topY(options.top, options.size),
        size: options.size,
        font: run.font.pdf,
        color: options.color,
      });
      x += run.font.pdf.widthOfTextAtSize(character, options.size);
    }
  }
  return x;
}

function supports(source: ReturnType<typeof fontkit.create>, codePoint: number) {
  return source.glyphForCodePoint(codePoint).id !== 0;
}

function chooseFont(fonts: FontPack, character: string, bold: boolean) {
  const codePoint = character.codePointAt(0) ?? 32;
  const primary = bold ? fonts.bold : fonts.regular;
  const ext = bold ? fonts.latinExtBold : fonts.latinExt;
  const cyrillic = bold ? fonts.cyrillicBold : fonts.cyrillic;
  if (primary.hasGlyph(codePoint)) return primary;
  if (ext.hasGlyph(codePoint)) return ext;
  if (cyrillic.hasGlyph(codePoint)) return cyrillic;
  return primary;
}

function splitRuns(text: string, fonts: FontPack, bold: boolean) {
  const runs: Array<{ text: string; font: FontFace }> = [];
  for (const character of text) {
    const font = chooseFont(fonts, character, bold);
    const last = runs[runs.length - 1];
    if (last?.font === font) last.text += character;
    else runs.push({ text: character, font });
  }
  return runs;
}

function mixedWidth(text: string, size: number, fonts: FontPack, bold = false) {
  return splitRuns(text, fonts, bold).reduce(
    (width, run) => width + Array.from(run.text).reduce(
      (runWidth, character) => runWidth + run.font.pdf.widthOfTextAtSize(character, size),
      0,
    ),
    0,
  );
}

function wrapText(text: string, maxWidth: number, size: number, fonts: FontPack, bold = false) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (!current || mixedWidth(candidate, size, fonts, bold) <= maxWidth) {
      current = candidate;
      continue;
    }
    lines.push(current);
    current = word;
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function drawWrapped(page: PDFPage, text: string, options: TextOptions, fonts: FontPack) {
  const maxWidth = options.maxWidth ?? PAGE_WIDTH - options.x - MARGIN;
  const lineHeight = options.lineHeight ?? options.size * 1.35;
  const lines = wrapText(text, maxWidth, options.size, fonts, Boolean(options.bold));
  lines.forEach((line, index) => drawTopText(page, line, {
    ...options,
    top: options.top + index * lineHeight,
  }, fonts));
  return options.top + lines.length * lineHeight;
}

function drawRectTop(page: PDFPage, x: number, top: number, width: number, height: number, color: RGB, opacity = 1) {
  page.drawRectangle({ x, y: PAGE_HEIGHT - top - height, width, height, color, opacity });
}

function drawLineTop(page: PDFPage, x: number, top: number, width: number, color = colors.line, thickness = 0.7) {
  page.drawLine({ start: { x, y: topY(top) }, end: { x: x + width, y: topY(top) }, color, thickness });
}

function drawImageCover(page: PDFPage, image: { width: number; height: number }, imageObject: Parameters<PDFPage["drawImage"]>[0], x: number, top: number, width: number, height: number) {
  const targetRatio = width / height;
  const imageRatio = image.width / image.height;
  let drawWidth = width;
  let drawHeight = height;
  let offsetX = 0;
  let offsetY = 0;
  if (imageRatio > targetRatio) {
    drawWidth = height * imageRatio;
    offsetX = (width - drawWidth) / 2;
  } else {
    drawHeight = width / imageRatio;
    offsetY = (height - drawHeight) / 2;
  }
  const bottom = PAGE_HEIGHT - top - height;
  const topEdge = PAGE_HEIGHT - top;
  page.pushOperators(
    pushGraphicsState(),
    moveTo(x, bottom),
    lineTo(x + width, bottom),
    lineTo(x + width, topEdge),
    lineTo(x, topEdge),
    closePath(),
    clip(),
    endPath(),
  );
  page.drawImage(imageObject, {
    x: x + offsetX,
    y: bottom + offsetY,
    width: drawWidth,
    height: drawHeight,
  });
  page.pushOperators(popGraphicsState());
}

function drawEyebrow(page: PDFPage, text: string, x: number, top: number, fonts: FontPack, color = colors.deepGold) {
  drawLineTop(page, x, top + 5, 28, color, 1);
  drawTopText(page, text.toUpperCase(), { x: x + 38, top, size: 8, color, bold: true }, fonts);
}

function drawBrandLogo(page: PDFPage, logo: EmbeddedImage, x: number, top: number, height: number) {
  const width = height * (logo.width / logo.height);
  page.drawImage(logo, {
    x,
    y: PAGE_HEIGHT - top - height,
    width,
    height,
  });
}

function drawPageHeader(page: PDFPage, pageNumber: number, lang: Lang, fonts: FontPack, logo: EmbeddedImage | null) {
  if (logo) drawBrandLogo(page, logo, MARGIN, 20, 17);
  else drawTopText(page, "AIXCO.GLOBAL", { x: MARGIN, top: 28, size: 11, color: colors.ink, bold: true }, fonts);
  drawTopText(page, `REVERANCE · ${String(pageNumber).padStart(2, "0")} / 05`, {
    x: PAGE_WIDTH - MARGIN - 94,
    top: 29,
    size: 7,
    color: colors.deepGold,
    bold: true,
  }, fonts);
  drawLineTop(page, MARGIN, 52, PAGE_WIDTH - MARGIN * 2, colors.line, 0.6);
  drawTopText(page, textValue("Illustrative only", lang).toUpperCase(), {
    x: PAGE_WIDTH - MARGIN - 94,
    top: 807,
    size: 6.5,
    color: colors.muted,
    bold: true,
  }, fonts);
}

async function embedFont(doc: PDFDocument, filePath: string) {
  const bytes = new Uint8Array(await fs.readFile(filePath));
  const source = fontkit.create(bytes);
  // Keep the pre-converted subset font files whole. pdf-lib/fontkit subsetting
  // can fail asynchronously for Cyrillic/extended-Latin glyphs, while whole
  // TrueType embedding keeps the output readable in browser and desktop PDF
  // viewers.
  const pdf = await doc.embedFont(bytes, { subset: false });
  return { pdf, hasGlyph: (codePoint: number) => supports(source, codePoint) } satisfies FontFace;
}

async function loadFonts(doc: PDFDocument): Promise<FontPack> {
  doc.registerFontkit(fontkit);
  const fontDirectory = path.join(process.cwd(), "public", "aixco-global-op2", "fonts", "reverance-pdf");
  return {
    regular: await embedFont(doc, path.join(fontDirectory, "noto-sans-latin-400-normal.ttf")),
    bold: await embedFont(doc, path.join(fontDirectory, "noto-sans-latin-700-normal.ttf")),
    latinExt: await embedFont(doc, path.join(fontDirectory, "noto-sans-latin-ext-400-normal.ttf")),
    latinExtBold: await embedFont(doc, path.join(fontDirectory, "noto-sans-latin-ext-700-normal.ttf")),
    cyrillic: await embedFont(doc, path.join(fontDirectory, "noto-sans-cyrillic-400-normal.ttf")),
    cyrillicBold: await embedFont(doc, path.join(fontDirectory, "noto-sans-cyrillic-700-normal.ttf")),
  };
}

function formatCurrency(value: number, lang: Lang) {
  return new Intl.NumberFormat(lang === "sl" ? "sl-SI" : lang, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number, lang: Lang) {
  return new Intl.NumberFormat(lang === "sl" ? "sl-SI" : lang, {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value / 100);
}

function formatNumber(value: number, lang: Lang, maximumFractionDigits = 1) {
  return new Intl.NumberFormat(lang === "sl" ? "sl-SI" : lang, { maximumFractionDigits }).format(value);
}

function labelForUnit(calculation: InvestmentCalculation, lang: Lang) {
  return `${calculation.unit.code} · ${textValue(calculation.unit.type, lang)} · ${formatNumber(calculation.unit.area, lang, 1)} m²`;
}

function drawMetricCard(page: PDFPage, label: string, value: string, x: number, top: number, width: number, fonts: FontPack, dark = false) {
  drawRectTop(page, x, top, width, 82, dark ? colors.navy : colors.white);
  drawTopText(page, label.toUpperCase(), { x: x + 14, top: top + 15, size: 7, color: dark ? colors.gold : colors.muted, bold: true }, fonts);
  drawTopText(page, value, { x: x + 14, top: top + 39, size: 20, color: dark ? colors.white : colors.ink, bold: true }, fonts);
}

function drawTableRow(page: PDFPage, label: string, value: string, top: number, fonts: FontPack, valueColor = colors.ink) {
  drawLineTop(page, MARGIN, top, PAGE_WIDTH - MARGIN * 2, colors.line, 0.5);
  drawTopText(page, label, { x: MARGIN, top: top + 13, size: 9.5, color: colors.muted }, fonts);
  drawTopText(page, value, { x: PAGE_WIDTH - MARGIN - mixedWidth(value, 9.5, fonts, true), top: top + 13, size: 9.5, color: valueColor, bold: true }, fonts);
}

export type GenerateReverancePdfOptions = {
  calculation: InvestmentCalculation;
  lang: Lang;
  clientName?: string;
};

export async function generateReveranceInvestmentPdf({ calculation, lang, clientName }: GenerateReverancePdfOptions) {
  const doc = await PDFDocument.create();
  doc.setTitle(textValue("Project Reverance investment calculator | AIXCO.Global", lang));
  doc.setAuthor("AIXCO.Global");
  doc.setSubject(textValue("Illustrative investment brief", lang));
  const fonts = await loadFonts(doc);
  const logoDirectory = path.join(process.cwd(), "public", "aixco-global-op2", "images");
  let darkLogo: Awaited<ReturnType<PDFDocument["embedPng"]>> | null = null;
  let lightLogo: Awaited<ReturnType<PDFDocument["embedPng"]>> | null = null;
  try {
    darkLogo = await doc.embedPng(await fs.readFile(path.join(logoDirectory, "AIXCOGlobal-horizontal-dark.png")));
    lightLogo = await doc.embedPng(await fs.readFile(path.join(logoDirectory, "AIXCOGlobal-horizontal-light.png")));
  } catch {
    darkLogo = null;
    lightLogo = null;
  }
  const imagePath = path.join(process.cwd(), "public", "aixco-global-op2", "images", "project-gallery-2026", "01-hero-exterior-2048.jpg");
  let heroImage: Awaited<ReturnType<PDFDocument["embedJpg"]>> | null = null;
  try {
    heroImage = await doc.embedJpg(await fs.readFile(imagePath));
  } catch {
    heroImage = null;
  }

  // Cover
  {
    const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    drawRectTop(page, 0, 0, PAGE_WIDTH, PAGE_HEIGHT, colors.paper);
    if (heroImage) {
      drawImageCover(page, heroImage, heroImage, 0, 0, PAGE_WIDTH, 286);
      drawRectTop(page, 0, 0, PAGE_WIDTH, 286, colors.navy, 0.53);
    } else {
      drawRectTop(page, 0, 0, PAGE_WIDTH, 286, colors.navy);
    }
    if (lightLogo) drawBrandLogo(page, lightLogo, MARGIN, 29, 21);
    else drawTopText(page, "AIXCO.GLOBAL", { x: MARGIN, top: 36, size: 14, color: colors.white, bold: true }, fonts);
    drawTopText(page, textValue("Illustrative only", lang).toUpperCase(), { x: PAGE_WIDTH - MARGIN - 110, top: 40, size: 7, color: colors.gold, bold: true }, fonts);
    drawLineTop(page, MARGIN, 154, 34, colors.gold, 1.2);
    drawTopText(page, textValue("Project Reverance · Batumi", lang).toUpperCase(), { x: MARGIN, top: 173, size: 8, color: colors.gold, bold: true }, fonts);
    drawWrapped(page, textValue("Reverance investment model", lang), { x: MARGIN, top: 329, size: 34, color: colors.navy, bold: true, maxWidth: 390, lineHeight: 38 }, fonts);
    drawWrapped(page, textValue("A clear view of the numbers before you decide.", lang), { x: MARGIN, top: 421, size: 13, color: colors.muted, maxWidth: 330, lineHeight: 19 }, fonts);
    if (clientName?.trim()) {
      drawTopText(page, clientName.trim().slice(0, 80), { x: MARGIN, top: 501, size: 10, color: colors.ink, bold: true }, fonts);
    }
    drawTopText(page, labelForUnit(calculation, lang), { x: MARGIN, top: 532, size: 10, color: colors.deepGold, bold: true }, fonts);
    drawMetricCard(page, textValue("Invested equity", lang), formatCurrency(calculation.investedEquity, lang), MARGIN, 624, 158, fonts, true);
    drawMetricCard(page, textValue("Monthly surplus", lang), `${calculation.monthlySurplus >= 0 ? "+" : "−"}${formatCurrency(Math.abs(calculation.monthlySurplus), lang)}`, MARGIN + 170, 624, 158, fonts);
    drawMetricCard(page, `${textValue("Net worth after", lang)} ${calculation.inputs.holdingYears} ${textValue(calculation.inputs.holdingYears === 1 ? "year" : "years", lang)}`, formatCurrency(calculation.holdingProjection.netWorth, lang), MARGIN + 340, 624, 159, fonts);
    drawWrapped(page, textValue("The figures are illustrative and depend on unit selection, financing, occupancy, market conditions and delivery.", lang), { x: MARGIN, top: 754, size: 7.6, color: colors.muted, maxWidth: PAGE_WIDTH - MARGIN * 2, lineHeight: 11 }, fonts);
  }

  // The asset
  {
    const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    drawRectTop(page, 0, 0, PAGE_WIDTH, PAGE_HEIGHT, colors.paper);
    drawPageHeader(page, 2, lang, fonts, darkLogo);
    drawEyebrow(page, textValue("The asset", lang), MARGIN, 82, fonts);
    const assetTitleBottom = drawWrapped(page, textValue("Project Reverance · Batumi", lang), { x: MARGIN, top: 119, size: 29, color: colors.ink, bold: true, maxWidth: 400, lineHeight: 34 }, fonts);
    const assetIntroTop = Math.max(177, assetTitleBottom + 16);
    const assetIntroBottom = drawWrapped(page, textValue("A clear view of the numbers before you decide.", lang), { x: MARGIN, top: assetIntroTop, size: 11, color: colors.muted, maxWidth: 340, lineHeight: 16 }, fonts);
    const assetBoxTop = Math.max(235, assetIntroBottom + 24);
    drawRectTop(page, MARGIN, assetBoxTop, PAGE_WIDTH - MARGIN * 2, 125, colors.white);
    const col = (PAGE_WIDTH - MARGIN * 2) / 3;
    const assetItems = [
      [textValue("Unit", lang), calculation.unit.code],
      [textValue("Area", lang), `${formatNumber(calculation.unit.area, lang)} m²`],
      [textValue("Orientation", lang), textValue(calculation.unit.orientation, lang)],
      [textValue("Building", lang), calculation.unit.building],
      [textValue("Floor", lang), formatNumber(calculation.unit.floor, lang, 0)],
      [textValue("Apartment", lang), textValue(calculation.unit.type, lang)],
    ];
    assetItems.forEach(([label, value], index) => {
      const x = MARGIN + (index % 3) * col + 16;
      const top = assetBoxTop + 23 + Math.floor(index / 3) * 52;
      drawTopText(page, label.toUpperCase(), { x, top, size: 6.5, color: colors.deepGold, bold: true }, fonts);
      drawTopText(page, value, { x, top: top + 17, size: 11, color: colors.ink, bold: true }, fonts);
    });
    const scenarioTop = assetBoxTop + 179;
    drawEyebrow(page, textValue("Your scenario", lang), MARGIN, scenarioTop, fonts);
    const scenarioDescriptionBottom = drawWrapped(page, textValue("The model translates your inputs into purchase price, financing, net monthly rent and a projected net worth.", lang), { x: MARGIN, top: scenarioTop + 38, size: 12, color: colors.ink, maxWidth: 450, lineHeight: 18 }, fonts);
    const firstScenarioRowTop = Math.max(526, scenarioDescriptionBottom + 34);
    drawTableRow(page, textValue("Price per m²", lang), formatCurrency(calculation.inputs.pricePerSquareMetre, lang), firstScenarioRowTop, fonts, colors.deepGold);
    drawTableRow(page, textValue("Gross rental yield", lang), formatPercent(calculation.inputs.grossYieldPercent, lang), firstScenarioRowTop + 45, fonts);
    drawTableRow(page, textValue("Financing", lang), formatPercent(calculation.inputs.financingPercent, lang), firstScenarioRowTop + 90, fonts);
    drawTableRow(page, textValue("Annual value growth", lang), formatPercent(calculation.inputs.annualGrowthPercent, lang), firstScenarioRowTop + 135, fonts);
    drawTableRow(page, textValue("Holding period", lang), `${calculation.inputs.holdingYears} ${textValue("years", lang)}`, firstScenarioRowTop + 180, fonts);
  }

  // Price and funding
  {
    const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    drawRectTop(page, 0, 0, PAGE_WIDTH, PAGE_HEIGHT, colors.paper);
    drawPageHeader(page, 3, lang, fonts, darkLogo);
    drawEyebrow(page, textValue("Price & funding", lang), MARGIN, 82, fonts);
    drawWrapped(page, textValue("Price & funding", lang), { x: MARGIN, top: 119, size: 30, color: colors.ink, bold: true }, fonts);
    drawWrapped(page, textValue("The model keeps the purchase, construction payments and financing visible in one place.", lang), { x: MARGIN, top: 174, size: 11, color: colors.muted, maxWidth: 410, lineHeight: 16 }, fonts);
    drawTableRow(page, textValue("Purchase price", lang), formatCurrency(calculation.listPrice, lang), 254, fonts, colors.deepGold);
    drawTableRow(page, textValue("Down payment", lang), `− ${formatCurrency(calculation.downPayment, lang)}`, 304, fonts);
    drawTableRow(page, textValue("Construction installments", lang), formatCurrency(calculation.constructionInstallments, lang), 354, fonts);
    drawTableRow(page, textValue("Financing amount", lang), formatCurrency(calculation.loanAmount, lang), 404, fonts);
    drawRectTop(page, MARGIN, 468, PAGE_WIDTH - MARGIN * 2, 96, colors.navy);
    drawTopText(page, textValue("Invested equity", lang).toUpperCase(), { x: MARGIN + 18, top: 488, size: 7, color: colors.gold, bold: true }, fonts);
    drawTopText(page, formatCurrency(calculation.investedEquity, lang), { x: MARGIN + 18, top: 510, size: 25, color: colors.white, bold: true }, fonts);
    drawTopText(page, `${textValue("Installment period", lang)} · ${calculation.assumptions.constructionInstallmentMonths} ${textValue("months", lang)}`, { x: PAGE_WIDTH - MARGIN - 175, top: 510, size: 8, color: colors.white }, fonts);
    drawEyebrow(page, textValue("At completion", lang), MARGIN, 622, fonts);
    drawTableRow(page, textValue("Completion value", lang), formatCurrency(calculation.completionValue, lang), 662, fonts, colors.deepGold);
    drawTableRow(page, textValue("Gross rental yield", lang), formatPercent(calculation.inputs.grossYieldPercent, lang), 707, fonts);
    drawTableRow(page, textValue("Net monthly rent", lang), formatCurrency(calculation.netMonthlyRent, lang), 752, fonts);
  }

  // Projection
  {
    const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    drawRectTop(page, 0, 0, PAGE_WIDTH, PAGE_HEIGHT, colors.paper);
    drawPageHeader(page, 4, lang, fonts, darkLogo);
    drawEyebrow(page, textValue("Projection", lang), MARGIN, 82, fonts);
    drawWrapped(page, textValue("Net worth over time", lang), { x: MARGIN, top: 119, size: 30, color: colors.ink, bold: true }, fonts);
    drawTopText(page, `${textValue("At your horizon", lang)} · ${calculation.inputs.holdingYears} ${textValue(calculation.inputs.holdingYears === 1 ? "year" : "years", lang)}`, { x: MARGIN, top: 178, size: 10, color: colors.muted }, fonts);
    drawTopText(page, formatCurrency(calculation.holdingProjection.netWorth, lang), { x: MARGIN, top: 207, size: 33, color: colors.deepGold, bold: true }, fonts);
    drawTopText(page, `${formatNumber(calculation.holdingProjection.multiple, lang, 2)}× ${textValue("Equity multiple", lang).toLowerCase()}`, { x: MARGIN, top: 251, size: 9, color: colors.muted, bold: true }, fonts);
    drawEyebrow(page, textValue("Milestones", lang), MARGIN, 322, fonts);
    const chartTop = 367;
    const chartHeight = 214;
    const chartWidth = PAGE_WIDTH - MARGIN * 2;
    const maxValue = Math.max(...calculation.milestones.map((item) => item.netWorth), 1);
    const barGap = 14;
    const barWidth = (chartWidth - barGap * (calculation.milestones.length - 1)) / calculation.milestones.length;
    calculation.milestones.forEach((milestone, index) => {
      const height = Math.max(3, chartHeight * (milestone.netWorth / maxValue));
      const x = MARGIN + index * (barWidth + barGap);
      drawRectTop(page, x, chartTop + chartHeight - height, barWidth, height, index === calculation.milestones.length - 1 ? colors.navy : colors.gold);
      drawTopText(page, formatCurrency(milestone.netWorth, lang), { x, top: chartTop + chartHeight - height - 19, size: 7.5, color: colors.ink, bold: true }, fonts);
      drawTopText(page, `${milestone.year} ${textValue("year", lang)}`, { x, top: chartTop + chartHeight + 15, size: 7, color: colors.muted, bold: true }, fonts);
    });
    drawEyebrow(page, textValue("At your horizon", lang), MARGIN, 650, fonts);
    drawTableRow(page, textValue("Property value", lang), formatCurrency(calculation.holdingProjection.propertyValue, lang), 689, fonts);
    drawTableRow(page, textValue("Remaining debt", lang), formatCurrency(calculation.holdingProjection.remainingDebt, lang), 734, fonts);
    drawTableRow(page, textValue("Accumulated cash flow", lang), formatCurrency(calculation.holdingProjection.accumulatedCash, lang), 779, fonts);
  }

  // Assumptions and methodology
  {
    const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    drawRectTop(page, 0, 0, PAGE_WIDTH, PAGE_HEIGHT, colors.paper);
    drawPageHeader(page, 5, lang, fonts, darkLogo);
    drawEyebrow(page, textValue("Assumptions", lang), MARGIN, 82, fonts);
    drawWrapped(page, textValue("How the model works", lang), { x: MARGIN, top: 119, size: 29, color: colors.ink, bold: true }, fonts);
    drawWrapped(page, textValue("AIXCO models the reference scenario transparently so you can change the assumptions and see the effect.", lang), { x: MARGIN, top: 174, size: 11, color: colors.muted, maxWidth: 420, lineHeight: 16 }, fonts);
    const assumptionRows: Array<[string, string]> = [
      [textValue("Down payment", lang), formatPercent(calculation.assumptions.downPaymentPercent, lang)],
      [textValue("Construction payment period", lang), `${calculation.assumptions.constructionInstallmentMonths} ${textValue("months", lang)}`],
      [textValue("Interest rate", lang), formatPercent(calculation.assumptions.interestPercent, lang)],
      [textValue("Loan term", lang), `${calculation.assumptions.loanYears} ${textValue("years", lang)}`],
      [textValue("Value uplift to completion", lang), formatPercent(calculation.assumptions.completionUpliftPercent, lang)],
      [textValue("Rental income tax", lang), formatPercent(calculation.assumptions.rentalTaxPercent, lang)],
      [textValue("Operating / vacancy reserve", lang), formatPercent(calculation.assumptions.operatingAndVoidPercent, lang)],
    ];
    assumptionRows.forEach(([label, value], index) => drawTableRow(page, label, value, 264 + index * 44, fonts, index === 0 ? colors.deepGold : colors.ink));
    drawRectTop(page, MARGIN, 610, PAGE_WIDTH - MARGIN * 2, 104, colors.paleGold);
    drawTopText(page, textValue("This is not financial, legal or tax advice.", lang), { x: MARGIN + 16, top: 629, size: 9.5, color: colors.ink, bold: true }, fonts);
    drawWrapped(page, textValue("The figures are illustrative and depend on unit selection, financing, occupancy, market conditions and delivery.", lang), { x: MARGIN + 16, top: 653, size: 8.5, color: colors.muted, maxWidth: PAGE_WIDTH - MARGIN * 2 - 32, lineHeight: 12 }, fonts);
    drawTopText(page, "AIXCO.GLOBAL · Reverance Living Batumi", { x: MARGIN, top: 785, size: 8, color: colors.deepGold, bold: true }, fonts);
  }

  return doc.save();
}
