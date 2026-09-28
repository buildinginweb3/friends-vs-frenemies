/** Probe map presets: walkable blob analysis for HOME + gates. */
import { build } from "esbuild";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sdkRoot = resolve(root, "node_modules/@rarefriends/friendsdk");
const sdkExports = JSON.parse(readFileSync(resolve(sdkRoot, "package.json"), "utf8")).exports;
await build({
  entryPoints: [resolve(root, "games/friends-vs-frenemies/lib/test-entry.ts")],
  bundle: true, format: "esm", platform: "node", target: "node22",
  outfile: resolve(root, ".probe-bundle.mjs"), logLevel: "silent",
  plugins: [{
    name: "sdk-alias",
    setup(builder) {
      builder.onResolve({ filter: /^@rarefriends\/friendsdk(\/.*)?$/ }, args => {
        const sub = args.path.replace("@rarefriends/friendsdk", ".") || ".";
        const entry = sdkExports[sub];
        if (!entry) return { errors: [{ text: `Unknown SDK export: ${args.path}` }] };
        return { path: resolve(sdkRoot, typeof entry === "string" ? entry : entry.import) };
      });
    },
  }],
});
const lib = await import(resolve(root, ".probe-bundle.mjs"));
const presets = ["01-garden-oval-complete", "02-circuit-courtyard-complete", "03-crystal-mesa-complete", "05-tidal-islands-complete", "04-rooftop-terrace-complete", "06-orbital-hex-complete"];
for (const preset of presets) {
  const base = lib.getWorldPreset(preset);
  const world = lib.buildScene ? null : null;
  void world;
  // Flood fill walkable blobs on a coarse grid.
  const step = 12;
  const cols = Math.floor(576 / step), rows = Math.floor(384 / step);
  const open = [];
  for (let gy = 0; gy < rows; gy++) {
    open.push([]);
    for (let gx = 0; gx < cols; gx++) {
      open[gy].push(lib.isWorldWalkable(base, [gx * step + 6, gy * step + 6], 9));
    }
  }
  const seen = open.map(r => r.map(() => false));
  const blobs = [];
  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      if (!open[gy][gx] || seen[gy][gx]) continue;
      let sx = 0, sy = 0, n = 0;
      const stack = [[gx, gy]];
      seen[gy][gx] = true;
      while (stack.length) {
        const [cx, cy] = stack.pop();
        sx += cx; sy += cy; n++;
        for (const [nx, ny] of [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]]) {
          if (nx >= 0 && ny >= 0 && nx < cols && ny < rows && open[ny][nx] && !seen[ny][nx]) {
            seen[ny][nx] = true;
            stack.push([nx, ny]);
          }
        }
      }
      blobs.push({ n, cx: Math.round((sx / n) * step), cy: Math.round((sy / n) * step) });
    }
  }
  blobs.sort((a, b) => b.n - a.n);
  console.log(preset, "blobs:", blobs.slice(0, 4).map(b => `${b.n}@(${b.cx},${b.cy})`).join(" "));
}
