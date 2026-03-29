#!/usr/bin/env tsx

/**
 * Icon Generator Script
 *
 * Usage:
 *   pnpm generate-icon <text> <output> [-s 16] [-c red] [-b transparent]
 *
 * Run with --help for full usage information.
 */

import { resolve } from "node:path";
import { Command, InvalidArgumentError } from "commander";
import sharp from "sharp";

// ---------------------------------------------------------------------------
// SVG builder
// ---------------------------------------------------------------------------

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildSvg(
  text: string,
  size: number,
  color: string,
  background: string,
): string {
  const isTwoRows = text.length === 4;

  // Background rectangle (omit for transparent)
  const bgRect =
    background === "transparent"
      ? ""
      : `<rect width="${size}" height="${size}" fill="${background}" rx="0"/>`;

  // Font size: scale relative to icon size.
  // Two-row layout needs smaller glyphs to fit both rows.
  const fontSize = isTwoRows ? Math.round(size * 0.44) : Math.round(size * 0.6);

  let textNodes: string;

  if (isTwoRows) {
    // Split into two lines of 2 characters each
    const line1 = escapeXml(text.slice(0, 2));
    const line2 = escapeXml(text.slice(2, 4));
    const cx = size / 2;
    // Place each line in the vertical center of its half
    const y1 = size * 0.28;
    const y2 = size * 0.72;
    const commonAttrs = `x="${cx}" font-size="${fontSize}" text-anchor="middle" dominant-baseline="middle" fill="${color}" font-family="monospace" font-weight="bold"`;
    textNodes = `
  <text ${commonAttrs} y="${y1}">${line1}</text>
  <text ${commonAttrs} y="${y2}">${line2}</text>`;
  } else {
    // Single row – vertically and horizontally centred
    const cx = size / 2;
    const cy = size / 2;
    const safeText = escapeXml(text);
    textNodes = `
  <text x="${cx}" y="${cy}" font-size="${fontSize}" text-anchor="middle" dominant-baseline="middle" fill="${color}" font-family="monospace" font-weight="bold">${safeText}</text>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${bgRect}${textNodes}
</svg>`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const allowedSizes = [16, 32, 48, 128];

function parseSize(value: string): number {
  const n = Number.parseInt(value, 10);
  if (!allowedSizes.includes(n)) {
    throw new InvalidArgumentError(
      `Must be one of ${allowedSizes.join(", ")}.`,
    );
  }
  return n;
}

const program = new Command();
program
  .name("generate-icon")
  .description("Generate a PNG icon from short text (1–4 characters)")
  .argument("<text>", "Text to render (1–4 characters)")
  .argument("<output>", "Output PNG file path")
  .option(
    "-s, --size <px>",
    "Icon size in pixels (16, 32, 48, 128)",
    parseSize,
    16,
  )
  .option("-c, --color <color>", "Text color (CSS color)", "red")
  .option(
    "-b, --background <color>",
    'Background color or "transparent"',
    "transparent",
  )
  .action(
    async (
      text: string,
      output: string,
      opts: { size: number; color: string; background: string },
    ) => {
      if (text.length === 0 || text.length > 4) {
        program.error("Text must be 1–4 characters.");
      }

      const svg = buildSvg(text, opts.size, opts.color, opts.background);
      const svgBuffer = Buffer.from(svg, "utf-8");

      const resolvedOutput = resolve(output);
      await sharp(svgBuffer, { density: 72 }).png().toFile(resolvedOutput);

      console.log(
        `✓ Icon written to ${resolvedOutput}  (${opts.size}×${opts.size}, text="${text}", color=${opts.color}, background=${opts.background})`,
      );
    },
  );

program.parseAsync().catch((err: unknown) => {
  console.error("Fatal:", err instanceof Error ? err.message : err);
  process.exit(1);
});
