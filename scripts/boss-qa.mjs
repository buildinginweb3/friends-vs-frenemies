/**
 * boss-qa.mjs — new boss pattern visuals via localhost dev hooks.
 * Jumps to waves 20/25/30 (artillerist/warden/blink) with a mid-game build.
 */
import { testGame } from "@rarefriends/friendsdk/testing";

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

await testGame("./games/friends-vs-frenemies", {
  timeout: 120_000,
  check: async ({ game, page }) => {
    const frame = game;
    const jump = async (query, tag) => {
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
      await page.waitForTimeout(3000);
      await frame.getByRole("button", { name: "Toggle auto-pilot" }).click();
      for (let i = 0; i < 7; i++) {
        const dlg = frame.getByRole("dialog", { name: /Choose an upgrade/ });
        if ((await dlg.count()) > 0) await frame.locator(".fvf-offer").first().click();
        await page.keyboard.press(" ");
        await page.screenshot({ path: `./artifacts/qa-${tag}-${i}.png` });
        await sleep(4000);
        if (await frame.getByText(/DEFENSE OVER/).count() > 0) break;
      }
      console.log("QA boss", tag, "done");
    };
    await frame.getByRole("button", { name: "DEFEND", exact: true }).waitFor({ timeout: 60_000 });
    await jump("?fvfWave=20&fvfBuild=1", "artillerist");
    await jump("?fvfWave=25&fvfBuild=1", "warden");
    await jump("?fvfWave=30&fvfBuild=1", "blink");
  },
});
console.log("BOSS QA COMPLETE");
