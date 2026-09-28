/** Palette check: render garden-oval terrain SVG color vs mono, screenshot both. */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { chromium } from "playwright";

const world = await import("@rarefriends/friendsdk/world");
mkdirSync("/tmp/fvf-ref", { recursive: true });
const preset = world.getWorldPreset("01-garden-oval-complete");
for (const color of [false, true]) {
  const layers = world.renderWorldLayers(world.validateWorld(preset), { color, signals: false });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1200" viewBox="0 0 1600 1200">${layers.terrainSvg}</svg>`;
  writeFileSync(`/tmp/fvf-ref/terrain-${color ? "color" : "mono"}.svg`, svg);
}
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
for (const color of [false, true]) {
  await page.goto(`file:///tmp/fvf-ref/terrain-${color ? "color" : "mono"}.svg`);
  await page.waitForTimeout(800);
  await page.screenshot({ path: `/tmp/fvf-ref/terrain-${color ? "color" : "mono"}.png` });
}
await browser.close();
console.log("PALETTE SHOTS DONE");
