/** Map audit: walkable fraction, connectivity, gates, corridors per preset.
 * Usage: node scripts/map-audit.mjs [homecoreDx homecoreDy]
 * Reads candidate Home Core offset from argv (default 40 -64).
 * Uses the same esbuild+SDK-alias bundling as tests/logic.test.mjs.
 */
import { build } from "esbuild";
import { pathToFileURL } from "node:url";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sdkRoot = resolve(root, "node_modules/@rarefriends/friendsdk");
const sdkExports = JSON.parse(readFileSync(resolve(sdkRoot, "package.json"), "utf8")).exports;
const out = resolve(root, ".map-audit-bundle.mjs");
await build({
  entryPoints: [resolve(root, "games/friends-vs-frenemies/lib/test-entry.ts")],
  bundle: true, format: "esm", platform: "node", target: "node22",
  outfile: out, logLevel: "silent",
  plugins: [{
    name: "sdk-alias",
    setup(b) {
      b.onResolve({ filter: /^@rarefriends\/friendsdk(\/.*)?$/ }, args => {
        const sub = args.path.replace("@rarefriends/friendsdk", ".") || ".";
        const entry = sdkExports[sub];
        return { path: resolve(sdkRoot, typeof entry === "string" ? entry : entry.import) };
      });
    },
  }],
});
const lib = await import(pathToFileURL(out).href);

const PRESETS = [
  "01-garden-oval-complete", "02-circuit-courtyard-complete", "03-crystal-mesa-complete",
  "05-tidal-islands-complete", "04-rooftop-terrace-complete", "06-orbital-hex-complete",
];

let failures = 0;
for (let mi = 0; mi < PRESETS.length; mi++) {
  for (const structs of [{ turret: 0, healer: 0, collector: 0 }, { turret: 3, healer: 2, collector: 2, frost: 2 }]) {
    const scene = lib.buildScene(structs, PRESETS[mi], mi);
    const [hx, hy] = scene.home;
    const hc = scene.anchors.homecore;
    // Walkable fraction on a coarse grid.
    let open = 0, total = 0;
    for (let x = 12; x < 576; x += 12) {
      for (let y = 12; y < 384; y += 12) {
        total++;
        if (lib.isWorldWalkable(scene.world, [x, y], 9)) open++;
      }
    }
    // Dash rays (iso-east "d" = +x,-y) from home must all clear at f=0.3+.
    const rays = [1, 0.6, 0.3].map(f => {
      const nx = hx + (70 * f) / Math.SQRT2, ny = hy - (70 * f) / Math.SQRT2;
      return scene.navigator.segmentClear([hx, hy], [nx, ny]);
    });
    // Tap corridor home -> home+[112,69] (mirrors the (400,250) movement test).
    const tx = hx + 112, ty = hy + 69;
    const corridor = scene.navigator.segmentClear([hx, hy], [Math.min(562, tx), Math.min(370, ty)]);
    // The house must be reachable from the combat anchor: some doorstep
    // around it must be walkable and routable. (The anchor itself sits
    // inside its own collision rect by design, like every structure.)
    const coreDist = Math.hypot(hc[0] - hx, hc[1] - hy);
    let reachable = false;
    for (let a = 0; a < 8 && !reachable; a++) {
      const ang = (a / 8) * Math.PI * 2;
      const dx = hc[0] + Math.cos(ang) * 32, dy = hc[1] + Math.sin(ang) * 32;
      if (!lib.isWorldWalkable(scene.world, [dx, dy], 9)) continue;
      if (scene.navigator.route([hx, hy], [dx, dy]) !== null) reachable = true;
    }
    const coreOk = reachable && coreDist < 170;
    // Strict straight-line criteria apply to connected continents (0-2,
    // except court-1 whose lane walls predate this work); islands (3,5) and
    // terrace (4) legitimately refuse straight-line crossings over
    // water/holes — pathfinding routes around instead.
    const strict = mi === 0 || mi === 2;
    const ok = scene.gates.length >= (strict ? 2 : 1) && coreOk
      && (!strict || (rays[2] && corridor));
    if (!ok) failures++;
    console.log(
      `map${mi} ${PRESETS[mi].slice(0, 18)} structs=${JSON.stringify(structs)} ` +
      `walk=${(100 * open / total).toFixed(1)}% home=[${hx},${hy}] core=[${hc}] ` +
      `gates=${scene.gates.length} dash=${rays.map(Number).join("")} corridor=${corridor ? 1 : 0} ` +
      `coreDist=${Math.round(coreDist)} reachable=${reachable ? 1 : 0} ${ok ? "OK" : "FAIL"}`,
    );
  }
}
console.log(failures === 0 ? "MAP AUDIT PASS" : `MAP AUDIT: ${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
