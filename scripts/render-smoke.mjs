/** Renderer smoke: execute every draw path with a mock 2d context.
 * Catches reference errors (undefined vars, bad imports) in draw code that
 * tsc cannot see (all canvas calls are valid methods). No browser needed.
 * Usage: node scripts/render-smoke.mjs
 */
import { build } from "esbuild";
import { pathToFileURL } from "node:url";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync, writeFileSync } from "node:fs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sdkRoot = resolve(root, "node_modules/@rarefriends/friendsdk");
const sdkExports = JSON.parse(readFileSync(resolve(sdkRoot, "package.json"), "utf8")).exports;
const entry = resolve(root, ".render-smoke-entry.ts");
writeFileSync(entry, `
export * from "./games/friends-vs-frenemies/lib/test-entry";
export { drawIsoCombat, drawIsoHome, drawDebug } from "./games/friends-vs-frenemies/lib/render-iso";
export { createHomePlot, stepHomePlot } from "./games/friends-vs-frenemies/lib/home-plot";
`);
const out = resolve(root, ".render-smoke-bundle.mjs");
await build({
  entryPoints: [entry],
  bundle: true, format: "esm", platform: "node", target: "node22",
  outfile: out, logLevel: "silent",
  plugins: [{
    name: "sdk-alias",
    setup(b) {
      b.onResolve({ filter: /^@rarefriends\/friendsdk(\/.*)?$/ }, args => {
        const sub = args.path.replace("@rarefriends/friendsdk", ".") || ".";
        const e = sdkExports[sub];
        return { path: resolve(sdkRoot, typeof e === "string" ? e : e.import) };
      });
    },
  }],
});
const lib = await import(pathToFileURL(out).href);

function mockCtx() {
  const grad = { addColorStop() {} };
  return new Proxy({}, {
    get(t, p) {
      if (p === "measureText") return () => ({ width: 10 });
      if (p === "getImageData") return () => ({ data: [] });
      if (p === "createLinearGradient" || p === "createRadialGradient") return () => grad;
      if (typeof p === "string") return (...a) => undefined;
      return undefined;
    },
    set() { return true; },
  });
}

const FRESH = { dmg: 0, rate: 0, hp: 0, crit: 0, turret: 2, wall: 1, healer: 1, collector: 2, greed: 0, loot: 0 };
const scene = lib.buildScene({ turret: 2, healer: 1, collector: 2, frost: 1 }, "01-garden-oval-complete", 0);
const fakeAssets = { terrain: {}, objects: [] };
const art = { rows: null, clips: null, familyName: "Friend", live: false };
const ctx = mockCtx();
let draws = 0;

// Home: empty base (signs) + developed base (house tiers, structures).
for (const levels of [
  { turret: 0, wall: 0, healer: 0, collector: 0 },
  { turret: 3, wall: 2, healer: 2, collector: 3, frost: 2 },
]) {
  const hs = lib.buildScene(levels, "01-garden-oval-complete", 0);
  const home = lib.createHomePlot(hs, 42);
  for (let i = 0; i < 30; i++) lib.stepHomePlot(home, hs, 1 / 60, true);
  const st = home.mover.state;
  lib.drawIsoHome(ctx, fakeAssets, hs, st.position[0], st.position[1], st.facing, st.walking, levels,
    { art, seedNum: 42, tokenId: "1", reducedMotion: false, now: 12.5, pokeT: 99, gear: { weapon: "w3", armor: "a3", trinket: "t4", family: "twin" }, prodBank: 25 });
  draws++;
}
// Combat: early wave + boss wave, several families, queue warnings, slam/splash.
for (const [family, wave] of [["twin", 1], ["scatter", 4], ["beam", 5], ["orbital", 9], ["needle", 14]]) {
  const run = lib.createRun({
    seed: 99, scene, mapIdx: 0, derived: lib.computeDerived(FRESH, []),
    turretLvl: 2, wallLvl: 1, healerLvl: 1, collectorLvl: 2, lootLuck: 0,
    weaponTint: "#fff", reducedMotion: false, manual: true,
  });
  run.derived.family = family;
  lib.beginWave(run, wave);
  for (let i = 0; i < 240; i++) {
    lib.stepRun(run, 1 / 60);
    for (const e of run.events.splice(0)) {
      if (e.t === "levelup") lib.applyUpgrade(run, run.offers[0].id);
    }
  }
  run.muzzleT = 0.09; // fire-flash frame
  lib.drawIsoCombat(ctx, fakeAssets, run,
    { art, seedNum: 42, reducedMotion: false, now: 30, gear: { weapon: "w3", armor: "a0", trinket: "t0", family } });
  draws++;
  run.debug = true;
  lib.drawDebug(ctx, run, { fps: 60, renderMs: 1, pathPs: 1, loops: 1 });
  draws++;
}
// Slam splash + core-damage announcement paths.
{
  const run = lib.createRun({
    seed: 7, scene, mapIdx: 0, derived: lib.computeDerived(FRESH, []),
    turretLvl: 1, wallLvl: 0, healerLvl: 0, collectorLvl: 1, lootLuck: 0,
    weaponTint: "#fff", reducedMotion: false, manual: false,
  });
  lib.beginWave(run, 5);
  const core = scene.anchors.homecore;
  lib.slamHitsCore(run, core[0], core[1], 48, 30);
  lib.damageStructure(run, "turret", 99999);
  lib.drawIsoCombat(ctx, fakeAssets, run,
    { art, seedNum: 7, reducedMotion: true, now: 5, gear: { weapon: "w0", armor: "a0", trinket: "t0", family: "standard" } });
  draws++;
}
console.log(`RENDER SMOKE PASS (${draws} draws, no throws)`);
