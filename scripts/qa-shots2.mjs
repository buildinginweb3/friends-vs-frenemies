/**
 * qa-shots2.mjs — fresh screenshots of overhauled level-up + trader UI.
 * Minimal flow: settle -> DEFEND -> prep launch -> AUTO grind to level-up
 * (screenshot) -> ?fvfShop hook -> trader screenshot. Generous logging.
 */
import { testGame } from "@rarefriends/friendsdk/testing";

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

await testGame("./games/friends-vs-frenemies", {
  timeout: 420_000,
  width: 960,
  screenshot: "./artifacts/qa-shots2-end.png",
  check: async ({ game, page }) => {
    const frame = game;
    const child = () => page.frames().find(f => f.url().includes("game.html"));
    const defend = frame.getByRole("button", { name: "DEFEND", exact: true });
    await defend.waitFor({ timeout: 60_000 });
    console.log("STEP defend visible");
    const plotDlg = frame.getByRole("dialog", { name: "Choose home plot" });
    if ((await plotDlg.count()) > 0) {
      await frame.getByRole("button", { name: /Settle in/ }).first().click();
      await sleep(800);
      console.log("STEP settled");
    }
    { const sk = frame.getByRole("button", { name: /Skip tutorial/ }); if ((await sk.count()) > 0) { await sk.click(); console.log("STEP tutorial skipped"); } }
    await defend.click();
    console.log("STEP defend clicked");
    await frame.getByText(/W1 ·/, { exact: false }).first().waitFor({ timeout: 15_000 });
    const prep = frame.getByRole("dialog", { name: "Prepare defense" });
    if ((await prep.count()) > 0) {
      await frame.getByRole("button", { name: /DEFEND \(\d+\)/ }).click();
      console.log("STEP wave launched");
    }
    // AUTO grind until a level-up dialog appears (up to ~3 min).
    await frame.getByRole("button", { name: "Toggle auto-pilot" }).click();
    console.log("STEP auto on, grinding to level-up");
    const dlg = frame.getByRole("dialog", { name: /Choose an upgrade/ });
    await dlg.waitFor({ timeout: 200_000 });
    await sleep(800);
    await page.screenshot({ path: "./artifacts/nw-2-levelup.png" });
    console.log("SHOT nw-2 levelup");
    await frame.locator(".fvf-offer").first().click();
    // Trader via hook reload (fresh session -> settle -> DEFEND -> run starts
    // with debugShop open).
    const fr = child();
    if (!fr) throw new Error("no game frame");
    await fr.goto(fr.url().split("?")[0] + "?fvfRf=400&fvfShop=1");
    await defend.waitFor({ timeout: 90_000 });
    console.log("STEP reloaded, defend visible");
    const plotDlg2 = frame.getByRole("dialog", { name: "Choose home plot" });
    if ((await plotDlg2.count()) > 0) {
      await frame.getByRole("button", { name: /Settle in/ }).first().click();
      await sleep(800);
    }
    { const sk2 = frame.getByRole("button", { name: /Skip tutorial/ }); if ((await sk2.count()) > 0) await sk2.click(); }
    await defend.click();
    console.log("STEP defend 2 clicked");
    const shop = frame.getByRole("dialog", { name: "Rare Trader" });
    await shop.waitFor({ timeout: 90_000 });
    await sleep(1000);
    await page.screenshot({ path: "./artifacts/nw-3-trader.png" });
    console.log("SHOT nw-3 trader");
  },
});
console.log("QA SHOTS2 COMPLETE");
