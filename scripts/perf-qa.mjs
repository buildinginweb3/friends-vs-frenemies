/**
 * perf-qa.mjs — map-transition stress test (Phase 51/7).
 * Jumps to maps 1..5 at a fixed wave (11) with a mid-game build and records
 * stepMs/renderMs/fps/entities — isolates per-map cost from wave scaling and
 * flags cumulative degradation across transitions.
 */
import { testGame } from "@rarefriends/friendsdk/testing";

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const med = (a) => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];

await testGame("./games/friends-vs-frenemies", {
  timeout: 120_000,
  check: async ({ game, page }) => {
    const frame = game;
    const results = [];
    await frame.getByRole("button", { name: "DEFEND", exact: true }).waitFor({ timeout: 60_000 });
    for (let m = 0; m < 5; m++) {
      const child = page.frames().find(f => f.url().includes("game.html"));
      await child.goto(child.url().split("?")[0] + `?fvfMap=${m}&fvfWave=11&fvfBuild=1`);
      await frame.getByRole("button", { name: "DEFEND", exact: true }).waitFor({ timeout: 60_000 });
      const gotIt = frame.getByRole("button", { name: /Got it!|Skip tutorial/ });
      if ((await gotIt.count()) > 0) await gotIt.click();
      // Fresh profile per reload: choose land (base = first map) before DEFEND.
      const plotDlg = frame.getByRole("dialog", { name: "Choose home plot" });
      if ((await plotDlg.count()) > 0) await frame.getByRole("button", { name: /Settle in/ }).first().click();
      await sleep(800);
      { const sk = frame.getByRole("button", { name: /Skip tutorial/ }); if ((await sk.count()) > 0) { await sk.click(); } }
      await frame.getByRole("button", { name: "DEFEND", exact: true }).click();
      await page.waitForTimeout(4000);
      const dlg0 = frame.getByRole("dialog", { name: /Choose an upgrade/ });
      if ((await dlg0.count()) > 0) await frame.locator(".fvf-offer").first().click();
      await frame.getByRole("button", { name: "Toggle auto-pilot" }).click();
      // Sample ~20s of combat.
      const samples = [];
      for (let i = 0; i < 10; i++) {
        const dlg = frame.getByRole("dialog", { name: /Choose an upgrade/ });
        if ((await dlg.count()) > 0) await frame.locator(".fvf-offer").first().click();
        await page.waitForTimeout(2000);
        const s = await childSnapshot(page);
        if (s) samples.push(s);
      }
      if (samples.length === 0) throw new Error(`no samples on map ${m}`);
      const row = {
        map: m,
        stepMs: med(samples.map(s => s.stepMs)),
        renderMs: med(samples.map(s => s.renderMs)),
        fps: med(samples.map(s => s.fps)),
        foes: med(samples.map(s => s.enemies)),
        shots: med(samples.map(s => s.shots)),
        pathPs: med(samples.map(s => s.pathPs)),
        loops: samples[samples.length - 1].loops,
        loopsActive: samples[samples.length - 1].loopsActive,
      };
      results.push(row);
      console.log(`PERF map ${m}: step=${row.stepMs}ms render=${row.renderMs}ms fps=${row.fps} foes=${row.foes} shots=${row.shots} path/s=${row.pathPs} loops=${row.loops} active=${row.loopsActive}`);
      if (row.loopsActive !== 1) throw new Error(`expected exactly 1 combat loop, found ${row.loopsActive}`);
    }
    const s0 = results[0];
    for (const r of results.slice(1)) {
      const growth = r.stepMs / Math.max(0.01, s0.stepMs);
      console.log(`PERF map ${r.map} vs map 0: step x${growth.toFixed(2)} render ${s0.renderMs}->${r.renderMs}ms`);
      if (growth > 2) throw new Error(`cumulative step-time growth on map ${r.map}: x${growth.toFixed(2)}`);
    }
    console.log("PERF QA COMPLETE");
  },
});

async function childSnapshot(page) {
  try {
    const fr = page.frames().find(f => f.url().includes("game.html"));
    return fr ? await fr.evaluate(() => window.__fvf ?? null) : null;
  } catch {
    return null;
  }
}
