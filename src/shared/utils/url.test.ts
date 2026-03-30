import { describe, expect, it } from "vitest";
import { toExtUrl } from "./url";

describe("toExtUrl", () => {
  it("wraps a relative path directly", () => {
    expect(toExtUrl("vite.svg")).toBe(
      "chrome-extension://test-extension-id/vite.svg",
    );
  });

  it("strips the leading slash from a root-relative path", () => {
    expect(toExtUrl("/assets/react-CHdo91hT.svg")).toBe(
      "chrome-extension://test-extension-id/assets/react-CHdo91hT.svg",
    );
  });

  it("strips the origin from a http localhost dev URL", () => {
    expect(toExtUrl("http://localhost:5173/src/assets/react.svg")).toBe(
      "chrome-extension://test-extension-id/src/assets/react.svg",
    );
  });

  it("handles localhost dev URLs on non-default ports", () => {
    expect(toExtUrl("http://localhost:3000/assets/logo.svg")).toBe(
      "chrome-extension://test-extension-id/assets/logo.svg",
    );
  });

  it("strips the origin from a https localhost dev URL", () => {
    expect(toExtUrl("https://localhost:5173/src/assets/react.svg")).toBe(
      "chrome-extension://test-extension-id/src/assets/react.svg",
    );
  });

  it("handles localhost root path", () => {
    expect(toExtUrl("http://localhost:5173/")).toBe(
      "chrome-extension://test-extension-id/",
    );
  });

  it("handles localhost with no port", () => {
    expect(toExtUrl("http://localhost/assets/logo.svg")).toBe(
      "chrome-extension://test-extension-id/assets/logo.svg",
    );
  });
});
