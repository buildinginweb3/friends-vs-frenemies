/**
 * telegraph-qa.mjs — catch charger telegraphs + map-2 roster visuals.
 * Uses localhost-only dev hooks (?fvfWave / ?fvfMap / ?fvfBuild).
 */
import { testGame } from "@rarefriends/friendsdk/testing";

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

await testGame("./games/friends-vs-frenemies", {
  timeout: 120_000,
  check: async ({ game, page }) => {
    const frame = game;
    const jump = async (query) => {
      const child = page.frames().find(f => f.url().includes("game.html"));
      await child.goto(child.url().split("?")[0] + query);
      await frame.getByRole("button", { name: "DEFEND", exact: true }).waitFor({ timeout: 60_000 });
      const gotIt = frame.getByRole("button", { name: /Got it!|Skip tutorial/ });
      if ((await gotIt.count()) > 0) await gotIt.click();
      const plotDlg = frame.getByRole("dialog", { name: "Choose home plot" });
      if ((await plotDlg.count()) > 0) await frame.getByRole("button", { name: /Settle in/ }).first().click();
      await sleep(800);
      { const sk = frame.getByRole("button", { name: /Skip tutorial/ }); if ((await sk.count()) > 0) { await sk.click(); } }
      await frame.getByRole("button", { name: "DEFEND", exact: true }).click();
      await page.waitForTimeout(4000);
      await frame.getByRole("button", { name: "Toggle auto-pilot" }).click();
    };
    const clearLevels = async () => {
      const dlg = frame.getByRole("dialog", { name: /Choose an upgrade/ });
      if ((await dlg.count()) > 0) {
        await frame.locator(".fvf-offer").first().click();
      }
    };
    // Wave 8 chargers on the garden.
    await frame.getByRole("button", { name: "DEFEND", exact: true }).waitFor({ timeout: 60_000 });
    await jump("?fvfWave=8&fvfBuild=1");
    for (let i = 0; i < 8; i++) {
      await clearLevels();
      await page.keyboard.press(" ");
      await page.screenshot({ path: `./artifacts/qa-tele-${i}.png` });
      await sleep(3000);
    }
    console.log("QA charger sweep done");
    // Wave 14 roster (splitter/support/shield/summoner) on Copper Court.
    await jump("?fvfMap=1&fvfWave=14&fvfBuild=1");
    for (let i = 0; i < 8; i++) {
      await clearLevels();
      await page.keyboard.press(" ");
      await page.screenshot({ path: `./artifacts/qa-roster-${i}.png` });
      await sleep(3000);
    }
    console.log("QA roster sweep done");
  },
});
console.log("TELEGRAPH QA COMPLETE");
