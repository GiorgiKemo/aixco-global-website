import { afterEach, describe, expect, it } from "vitest";
import { replaceLocationHash } from "./section-hash";

describe("section hash sync", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    window.history.replaceState({}, "", "/");
  });

  it("replaces the current hash without dropping the query string", () => {
    window.history.replaceState({}, "", "/?heroWall=1#batumi");

    replaceLocationHash("#dubai");

    expect(window.location.pathname).toBe("/");
    expect(window.location.search).toBe("?heroWall=1");
    expect(window.location.hash).toBe("#dubai");
  });

  it("removes the current hash without dropping the query string", () => {
    window.history.replaceState({}, "", "/?heroWall=1#batumi");

    replaceLocationHash("");

    expect(window.location.pathname).toBe("/");
    expect(window.location.search).toBe("?heroWall=1");
    expect(window.location.hash).toBe("");
  });
});
