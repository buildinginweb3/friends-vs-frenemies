/**
 * pnp-safe.mjs — run a command with stray Yarn PnP manifests moved aside.
 * Restores on success, failure, AND signals (Ctrl+C / SIGTERM / SIGHUP), so a
 * long-running `dev` server can also use it safely. If this process is hard-
 * killed (SIGKILL), run `npm run pnp:restore` to put everything back.
 */
import { spawn } from "node:child_process";
import { existsSync, renameSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const projectRoot = resolve(process.cwd());
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node scripts/pnp-safe.mjs <command...>");
  process.exit(2);
}

const hidden = [];
function hide() {
  let dir = dirname(projectRoot);
  while (dir && dir !== dirname(dir)) {
    for (const name of [".pnp.cjs", ".pnp.js", ".pnp.mjs"]) {
      const candidate = join(dir, name);
      if (existsSync(candidate)) {
        const stash = `${candidate}.fvf-hidden-${process.pid}`;
        renameSync(candidate, stash);
        hidden.push({ candidate, stash });
        console.log(`[pnp-safe] temporarily moved aside ${candidate}`);
      }
    }
    dir = dirname(dir);
  }
}

function restore() {
  for (const { candidate, stash } of hidden.reverse()) {
    try {
      if (existsSync(stash) && !existsSync(candidate)) {
        renameSync(stash, candidate);
        console.log(`[pnp-safe] restored ${candidate}`);
      }
    } catch (cause) {
      console.error(`[pnp-safe] FAILED to restore ${candidate} from ${stash}:`, cause);
      process.exitCode = 1;
    }
  }
  hidden.length = 0;
}

hide();
const [cmd, ...rest] = args;
const child = spawn(cmd, rest, { stdio: "inherit", shell: process.platform === "win32" });
const forward = signal => {
  restore();
  try {
    child.kill(signal);
  } catch { /* already gone */ }
};
for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(signal, () => forward(signal));
}
child.on("exit", code => {
  restore();
  process.exit(code ?? 1);
});
child.on("error", cause => {
  console.error("[pnp-safe] failed to start command:", cause);
  restore();
  process.exit(1);
});
