import { beforeEach, describe, expect, it } from "vitest";
import {
  grantDownloadAccess,
  hasDownloadAccess,
  resetDownloadAccessForTests,
} from "./download-access";

describe("download access", () => {
  beforeEach(() => {
    resetDownloadAccessForTests();
  });

  it("persists one successful unlock without storing contact details", () => {
    expect(hasDownloadAccess()).toBe(false);

    grantDownloadAccess();

    expect(hasDownloadAccess()).toBe(true);
    expect(Object.keys(window.localStorage)).toEqual(["aixco-download-access-v1"]);
    expect(window.localStorage.getItem("aixco-download-access-v1")).toBe("granted");
  });
});
