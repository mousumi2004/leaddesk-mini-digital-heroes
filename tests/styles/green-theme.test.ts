import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");

describe("green visual system", () => {
  it("defines the approved Digital Heroes-inspired palette", () => {
    expect(css).toContain("--sage-500: #6fa37a");
    expect(css).toContain("--forest-700: #3f6b54");
    expect(css).toContain("--sage-300: #a1c4ab");
  });

  it("provides subtle motion and the accessible detail pane styling", () => {
    expect(css).toContain("@keyframes grid-drift");
    expect(css).toContain("@keyframes glow-breathe");
    expect(css).toContain(".lead-dialog-backdrop");
    expect(css).toContain(".lead-dialog");
    expect(css).toContain("backdrop-filter: blur(6px)");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
  });
});
