/** belt-check.mjs — Trader consumable purchase fills the item belt (submission blocker). */
import { testGame } from "@rarefriends/friendsdk/testing";

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

await testGame("./games/friends-vs-frenemies", {
  timeout: 180_000,
  width: 960,
  check: async ({ game, page }) => {
    const frame = game;
    const child = () => page.frames().find(f => f.url().includes("game.html"));
    const fr0 = child();
    if (!fr0) throw new Error("no game frame");
    await fr0.goto(fr0.url().split("?")[0] + "?fvfRf=400&fvfShop=1");
    const defend = frame.getByRole("button", { name: "DEFEND", exact: true });
    await defend.waitFor({ timeout: 90_000 });
    const plotDlg = frame.getByRole("dialog", { name: "Choose home plot" });
    if ((await plotDlg.count()) > 0) {
      await frame.getByRole("button", { name: /Settle in/ }).first().click();
      await sleep(500);
    }
    const sk = frame.getByRole("button", { name: /Skip tutorial|Got it!/ });
    if ((await sk.count()) > 0) await sk.first().click();
    await defend.click();
    const shop = frame.getByRole("dialog", { name: "Rare Trader" });
    await shop.waitFor({ timeout: 60_000 });
    // Buy the first consumable row (TOOK/PRICE button in a consumable item).
    const items = frame.locator(".fvf-shopitem");
    const n = await items.count();
    let bought = false;
    for (let i = 0; i < n; i++) {
      const txt = (await items.nth(i).innerText().catch(() => "")) ?? "";
      const name = txt.split("\n")[0];
      if (/^(Full Heal|Emergency Shield|Power Tonic|Lucky Token|Magnet Burst|Rare Fury)/i.test(name)) {
        await items.nth(i).getByRole("button").click();
        await sleep(500);
        bought = true;
        console.log("BELT bought:", txt.split("\n")[0]);
        break;
      }
    }
    if (!bought) throw new Error("no consumable row found");
    await frame.getByRole("button", { name: /CONTINUE W/ }).click();
    await sleep(2500);
    // Belt button with a hotkey cap must now exist in the dock.
    const belt = frame.locator(".fvf-dock .fvf-abkey .fvf-key");
    const bn = await belt.count();
    console.log("BELT buttons with hotkeys:", bn);
    if (bn < 4) throw new Error(`expected >=4 hotkeyed dock buttons (3 abilities + belt), got ${bn}`);
    await page.screenshot({ path: "./artifacts/nw-6-belt.png" });
    console.log("BELT SHOT ok");
  },
});
console.log("BELT CHECK COMPLETE");
