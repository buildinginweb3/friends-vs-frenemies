/**
 * map2-qa.mjs — map-transition visuals via the localhost-only dev hook.
 * Reloads the sandboxed child with ?fvfMap=1 (Copper Court) and screenshots
 * combat, trader-stall area, and the H debug overlay.
 */
import { testGame } from "@rarefriends/friendsdk/testing";

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

await testGame("./games/friends-vs-frenemies", {
  timeout: 120_000,
  screenshot: "./artifacts/qa-map2-final.png",
  check: async ({ game, page }) => {
    const frame = game;
    const shot = (n) => page.screenshot({ path: `./artifacts/qa-map2-${n}.png` });
    await frame.getByRole("button", { name: "DEFEND", exact: true }).waitFor({ timeout: 60_000 });
    const gotIt = frame.getByRole("button", { name: /Got it!|Skip tutorial/ });
    if ((await gotIt.count()) > 0) await gotIt.click();
    const child = page.frames().find(f => f.url().includes("game.html"));
    if (!child) throw new Error("no game frame");
    await child.goto(child.url() + "?fvfMap=1&fvfBuild=1");
    await frame.getByRole("button", { name: "DEFEND", exact: true }).waitFor({ timeout: 60_000 });
    const gotIt2 = frame.getByRole("button", { name: /Got it!|Skip tutorial/ });
    if ((await gotIt2.count()) > 0) await gotIt2.click();
    const plotDlg2 = frame.getByRole("dialog", { name: "Choose home plot" });
    if ((await plotDlg2.count()) > 0) await frame.getByRole("button", { name: /Settle in/ }).first().click();
    await sleep(800);
    { const sk = frame.getByRole("button", { name: /Skip tutorial/ }); if ((await sk.count()) > 0) { await sk.click(); } }
    await frame.getByRole("button", { name: "DEFEND", exact: true }).click();
    // ?fvfMap without ?fvfWave still opens the prep briefing: launch it.
    const prepDlg = frame.getByRole("dialog", { name: "Prepare defense" });
    if ((await prepDlg.count()) > 0) {
      await frame.getByRole("button", { name: /DEFEND \(\d+\)/ }).click();
      await prepDlg.waitFor({ state: "hidden", timeout: 15_000 });
    }
    await page.waitForTimeout(3000);
    for (let i = 0; i < 3; i++) {
      const dlg0 = frame.getByRole("dialog", { name: /Choose an upgrade/ });
      if ((await dlg0.count()) === 0) break;
      await frame.locator(".fvf-offer").first().click();
    }
    await frame.getByRole("button", { name: "Toggle auto-pilot" }).click();
    const child2 = page.frames().find(f => f.url().includes("game.html"));
    const hv2 = async () => {
      try { return child2 ? await child2.evaluate(() => window.__fvf ?? null) : null; } catch { return null; }
    };
    for (let i = 0; i < 20; i++) {
      await page.waitForTimeout(3000);
      const dlg = frame.getByRole("dialog", { name: /Choose an upgrade/ });
      if ((await dlg.count()) > 0) {
        await frame.locator(".fvf-offer").first().click();
        continue;
      }
      const s = await hv2();
      console.log("MAP2 T+", (i + 1) * 3 + "s", JSON.stringify(s));
      if (!s || s.phase !== "combat") break;
      if (await frame.getByText(/DEFENSE OVER/).count() > 0) break;
    }
    const body = await frame.locator("body").innerText().catch(() => "NOBODY");
    console.log("MAP2 BODY:", JSON.stringify(body.slice(0, 200)));
    await page.screenshot({ path: "./artifacts/qa-map2-state.png" });
    const chips = await frame.locator(".fvf-chips").innerText().catch(e => "NOCHIPS");
    console.log("MAP2 CHIPS:", JSON.stringify(chips));
    await frame.getByText(/W1[1-9] ·/).first().waitFor({ timeout: 30_000 });
    await frame.getByRole("button", { name: "Toggle auto-pilot" }).click();
    await sleep(15000);
    await shot("combat");
    // Level-ups + blast while observing.
    for (let i = 0; i < 6; i++) {
      const dlg = frame.getByRole("dialog", { name: /Choose an upgrade/ });
      if ((await dlg.count()) > 0) {
        await frame.locator(".fvf-offer").first().click();
      }
      await page.keyboard.press(" ");
      await sleep(5000);
    }
    await shot("combat2");
    await page.keyboard.press("h");
    await sleep(1000);
    await shot("debug");
    await page.keyboard.press("h");
    console.log("MAP2 QA COMPLETE");
  },
});
