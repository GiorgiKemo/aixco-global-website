import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";
import { siteContentDefaults } from "@/lib/backend/site-content";
import {
  aixcoBatumiGalleryVideos,
  aixcoDubaiEdenHouseCanalGallery,
  aixcoDubaiEdenHouseParkGallery,
  aixcoDubaiHealthcareGallery,
} from "@/lib/aixco-live-assets";
import { LANGS, hasTextTranslation } from "./I18nProvider";

const SOURCE_EXTENSIONS = new Set([".ts", ".tsx"]);

function walkSourceFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return walkSourceFiles(fullPath);
    }

    if (!SOURCE_EXTENSIONS.has(path.extname(entry.name)) || /\.(test|spec)\.tsx?$/.test(entry.name)) {
      return [];
    }

    return [fullPath];
  });
}

function collectStringLiterals(node: ts.Node): string[] {
  if (ts.isStringLiteralLike(node)) {
    return [node.text];
  }

  return node.getChildren().flatMap(collectStringLiterals);
}

function collectTranslatedLiterals() {
  const root = process.cwd();
  const files = walkSourceFiles(path.join(root, "src"));
  const literals: Array<{ file: string; line: number; text: string }> = [];

  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    const sourceFile = ts.createSourceFile(
      file,
      source,
      ts.ScriptTarget.Latest,
      true,
      file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );

    function visit(node: ts.Node) {
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "tx") {
        const firstArgument = node.arguments[0];

        if (firstArgument) {
          for (const text of collectStringLiterals(firstArgument)) {
            const position = sourceFile.getLineAndCharacterOfPosition(firstArgument.getStart(sourceFile));
            literals.push({
              file: path.relative(root, file),
              line: position.line + 1,
              text,
            });
          }
        }
      }

      ts.forEachChild(node, visit);
    }

    visit(sourceFile);
  }

  return literals;
}

function splitFundDetail(detail: string) {
  const separatorIndex = detail.indexOf(":");
  return separatorIndex === -1
    ? [detail]
    : [detail.slice(0, separatorIndex).trim(), detail.slice(separatorIndex + 1).trim()];
}

function collectRenderedSiteContentStrings() {
  const copy = new Set<string>();
  const add = (value: string | undefined) => {
    if (value && /[A-Za-z]/.test(value)) copy.add(value);
  };

  siteContentDefaults.metrics.forEach((metric) => add(metric.label));
  siteContentDefaults.dubaiFunds.forEach((fund) => {
    add(fund.name);
    fund.details.flatMap(splitFundDetail).forEach(add);
  });
  ["USD", "m USD", "Projected"].forEach(add);

  siteContentDefaults.batumiBenefits.forEach(add);
  siteContentDefaults.batumiProperties.forEach((property) => {
    add(property.name);
    property.metrics.forEach((metric) => {
      add(metric.label);
      add(metric.value);
      add(metric.subtext);
    });
    property.highlights.forEach((highlight) => {
      add(highlight.label);
      add(highlight.value);
    });
  });

  siteContentDefaults.participationRoutes.forEach((route) => {
    add(route.title);
    add(route.body);
    add(route.cta);
  });

  siteContentDefaults.journeys.forEach((journey) => {
    add(journey.tag);
    add(journey.role);
    add(journey.summary);
    add(journey.intro);
    journey.steps.forEach((step) => {
      add(step.title);
      add(step.text);
    });
  });

  siteContentDefaults.team.forEach((member) => {
    add(member.role);
    add(member.summary);
    add(member.bio);
    member.points.forEach((point) => {
      add(point.title);
      add(point.text);
    });
  });

  siteContentDefaults.partners.forEach((partner) => {
    add(partner.group);
    add(partner.modalLabel);
    add(partner.summary);
    partner.featuredDetail?.forEach(add);
    partner.detail?.forEach(add);
    partner.facts?.forEach((fact) => {
      add(fact.title);
      add(fact.text);
    });
    partner.leaders?.forEach((leader) => add(leader.role));
  });

  siteContentDefaults.faqGroups.forEach((group) => {
    add(group.group);
    add(group.description);
    group.items.forEach((item) => {
      add(item.q);
      add(item.a);
    });
  });

  siteContentDefaults.newsTickerItems.forEach((item) => {
    add(item.title);
    add(item.source);
  });

  return Array.from(copy).map((text) => ({ file: "siteContentDefaults", line: 0, text }));
}

function collectRenderedAssetStrings() {
  const copy = new Set<string>();
  const add = (value: string | undefined) => {
    if (value && /[A-Za-z]/.test(value)) copy.add(value);
  };

  [
    "Play video",
    "Close video",
    "Expanded video",
    "expanded player",
    "Expand image",
    "Close image",
    "Expanded image",
    "Close",
    "images",
    "Eden House legacy asset gallery",
    "Dubai Healthcare City legacy gallery",
    "Eden House The Canal",
    "Eden House The Park",
    "Dubai Healthcare City",
  ].forEach(add);

  [
    ...aixcoBatumiGalleryVideos,
    ...aixcoDubaiEdenHouseCanalGallery,
    ...aixcoDubaiEdenHouseParkGallery,
    ...aixcoDubaiHealthcareGallery,
  ].forEach((asset) => add(asset.title));

  return Array.from(copy).map((text) => ({ file: "aixco-live-assets", line: 0, text }));
}

describe("translation coverage", () => {
  it("has catalog entries for literal tx() copy in every non-English language", async () => {
    const languages = LANGS.map((language) => language.code).filter((language) => language !== "en");
    const missing: string[] = [];

    for (const literal of collectTranslatedLiterals()) {
      for (const language of languages) {
        if (!(await hasTextTranslation(literal.text, language))) {
          missing.push(`${literal.file}:${literal.line} [${language}] ${literal.text}`);
        }
      }
    }

    expect(missing).toEqual([]);
  });

  it("has catalog entries for rendered site-content copy in every non-English language", async () => {
    const languages = LANGS.map((language) => language.code).filter((language) => language !== "en");
    const missing: string[] = [];

    for (const literal of collectRenderedSiteContentStrings()) {
      for (const language of languages) {
        if (!(await hasTextTranslation(literal.text, language))) {
          missing.push(`${literal.file} [${language}] ${literal.text}`);
        }
      }
    }

    expect(missing).toEqual([]);
  });

  it("has catalog entries for media and gallery copy in every non-English language", async () => {
    const languages = LANGS.map((language) => language.code).filter((language) => language !== "en");
    const missing: string[] = [];

    for (const literal of collectRenderedAssetStrings()) {
      for (const language of languages) {
        if (!(await hasTextTranslation(literal.text, language))) {
          missing.push(`${literal.file} [${language}] ${literal.text}`);
        }
      }
    }

    expect(missing).toEqual([]);
  });
});
