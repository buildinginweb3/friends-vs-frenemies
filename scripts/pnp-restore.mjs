/** pnp-restore.mjs — recovery: restore any manifests stashed by pnp-safe. */
import { existsSync, renameSync, readdirSync } from "node:fs";
import { join } from "node:path";

const roots = ["/mnt/c/Users/Timothy", process.env.USERPROFILE ?? ""].filter(Boolean);
let restored = 0;
for (const root of new Set(roots)) {
  let entries = [];
  try {
    entries = readdirSync(root);
  } catch { continue; }
  for (const entry of entries) {
    const marker = ".fvf-hidden-";
    const idx = entry.indexOf(marker);
    if (idx > 0) {
      const stash = join(root, entry);
      const candidate = join(root, entry.slice(0, idx));
      try {
        if (!existsSync(candidate)) {
          renameSync(stash, candidate);
          console.log(`[pnp-restore] restored ${candidate}`);
          restored++;
        }
      } catch (cause) {
        console.error(`[pnp-restore] FAILED for ${stash}:`, cause);
      }
    }
  }
}
console.log(restored === 0 ? "[pnp-restore] nothing to restore" : `[pnp-restore] restored ${restored} file(s)`);
