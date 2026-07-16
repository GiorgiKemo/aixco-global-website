import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function readSource(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8").replace(/\r\n/g, "\n");
}

describe("client recovery surfaces", () => {
  const routeError = readSource("src/app/error.tsx");
  const globalError = readSource("src/app/global-error.tsx");
  const notFound = readSource("src/views/NotFoundView.tsx");

  it("reports bounded render metadata without sending exception text or stacks", () => {
    for (const source of [routeError, globalError]) {
      expect(source).toContain('fetch("/api/client-errors"');
      expect(source).toContain("/^[a-zA-Z0-9._-]{1,128}$/");
      expect(source).not.toContain("error.message");
      expect(source).not.toContain("error.stack");
    }
  });

  it("provides localized recovery copy for every supported language", () => {
    for (const lang of ["en", "de", "ru", "ka", "tr", "ar", "pl"]) {
      expect(routeError).toContain(`${lang}: {`);
      expect(globalError).toContain(`${lang}: {`);
    }
  });

  it("gives the not-found page a localized, directly skippable main region", () => {
    expect(notFound).toContain("<I18nProvider>");
    expect(notFound).toContain('id="main-content"');
    expect(notFound).toContain('tx("This page is not available.")');
    expect(notFound).toContain('tx("Return to Home")');
  });
});
