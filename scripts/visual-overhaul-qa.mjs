/**
 * visual-overhaul-qa.mjs — targeted screenshot sweep for the art-direction
 * overhaul (~12-15 min): home, level-up, combat, boss, trader (+buy/reroll),
 * map rotation, upgraded base, mobile home. Bounded waits, stage logs.
 * Run: node scripts/pnp-safe.mjs node scripts/visual-overhaul-qa.mjs
 * Width override: FVF_WIDTH=360 (mobile pass: home + combat only).
 */
import { testGame } from "@rarefriends/friendsdk/testing";

const W = Number(process.env.FVF_WIDTH ?? 960);
const MOBILE = W < 500;
const P = MOBILE ? "m-" : "";
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

await testGame("./games/friends-vs-frenemies", {
  timeout: 120_000,
  width: W,
  screenshot: `./artifacts/v2-${P}final.png`,
  check: async ({ game, page }) => {
    const frame = game;
    const shot = (n) => page.screenshot({ path: `./artifacts/v2-${P}${n}.png` });
    const child = () => page.frames().find(f => f.url().includes("game.html"));
    const hv = async () => {
      try { const fr = child(); return fr ? await fr.evaluate(() => window.__fvf ?? null) : null; }
      catch { return null; }
    };
    const defend = frame.getByRole("button", { name: "DEFEND", exact: true });
    await defend.waitFor({ timeout: 60_000 });
    const gotIt = frame.getByRole("button", { name: /Got it!|Skip tutorial/ });
    if ((await gotIt.count()) > 0) await gotIt.click();
    const plotDlg = frame.getByRole("dialog", { name: "Choose home plot" });
    if ((await plotDlg.count()) > 0) {
      await frame.getByRole("button", { name: /Settle in/ }).first().click();
      await sleep(800);
      { const sk = frame.getByRole("button", { name: /Skip tutorial/ }); if ((await sk.count()) > 0) { await sk.click(); } }
      await sleep(1000);
    }
    await sleep(5000);
    await shot("1-home");
    console.log("SHOT 1-home");

    await defend.click();
    await frame.getByText(/W1 ·/, { exact: false }).first().waitFor({ timeout: 15_000 });
    const prepDlg = frame.getByRole("dialog", { name: "Prepare defense" });
    if ((await prepDlg.count()) > 0) {
      await sleep(1500);
      await shot("2-prep");
      console.log("SHOT 2-prep");
      await frame.getByRole("button", { name: /DEFEND \(\d+\)/ }).click();
      await prepDlg.waitFor({ state: "hidden", timeout: 15_000 });
    }
    if (MOBILE) {
      await page.keyboard.down("d");
      await sleep(1200);
      await page.keyboard.up("d");
      await sleep(6000);
      await shot("2-combat");
      console.log("SHOT mobile combat — done");
      return;
    }
    // Manual moment, then AUTO for the long ride.
    await page.keyboard.down("d");
    await sleep(1200);
    await page.keyboard.up("d");
    await sleep(8000);
    await shot("3-combat");
    console.log("SHOT 3-combat");
    const pickOne = async (shotIt = false) => {
      const dlg = frame.getByRole("dialog", { name: /Choose an upgrade/ });
      if ((await dlg.count()) === 0) return false;
      if (shotIt) { await sleep(800); await shot("4-levelup"); console.log("SHOT 4-levelup"); }
      const offers = frame.locator(".fvf-offer");
      if ((await offers.count()) > 0) await offers.first().click();
      await sleep(400);
      return true;
    };
    let leveledShot = false;
    const smartTick = async () => {
      await page.keyboard.press(" ");
      const s = await hv();
      if (s && s.hp < s.maxHp * 0.45) {
        const heal = frame.getByRole("button", { name: "Heal with banked RF" });
        if ((await heal.count()) > 0 && await heal.isEnabled().catch(() => false)) await heal.click();
      }
    };
    // A level-up dialog may already be open from the manual phase: clear
    // dialogs BEFORE touching HUD buttons (modals intercept pointer events).
    for (let i = 0; i < 5; i++) {
      if (!(await pickOne(i === 0))) break;
      leveledShot = true;
    }
    await frame.getByRole("button", { name: "Toggle auto-pilot" }).click();
    // Ride to the wave-5 boss.
    const deadline = Date.now() + 10 * 60 * 1000;
    let sawBoss = false;
    while (Date.now() < deadline) {
      if (await pickOne(!leveledShot)) { leveledShot = true; continue; }
      if (await frame.getByText(/DEFENSE OVER/).count() > 0) break;
      await smartTick();
      const chips = (await frame.locator(".fvf-chips").innerText().catch(() => "")) ?? "";
      if (/W5 ·/.test(chips)) {
        await sleep(14000);
        await shot("5-boss");
        sawBoss = true;
        console.log("SHOT 5-boss");
        break;
      }
      await sleep(3000);
    }
    console.log("boss seen:", sawBoss);
    // Trader after boss.
    const deadlineT = Date.now() + 8 * 60 * 1000;
    let traderUp = false;
    while (Date.now() < deadlineT) {
      if (await pickOne()) continue;
      if (await frame.getByText(/DEFENSE OVER/).count() > 0) break;
      if (await frame.getByRole("dialog", { name: "Rare Trader" }).count() > 0) { traderUp = true; break; }
      await smartTick();
      await sleep(2500);
    }
    console.log("trader up:", traderUp);
    if (!traderUp) { await shot("6-notrader"); return; }
    await sleep(1500);
    await shot("6-trader");
    console.log("SHOT 6-trader");
    const buyBtns = frame.locator(".fvf-shopitem button");
    for (let i = 0; i < (await buyBtns.count()); i++) {
      const b = buyBtns.nth(i);
      const txt = ((await b.innerText().catch(() => "")) ?? "").trim();
      if (/^\d+$/.test(txt) && await b.isEnabled().catch(() => false)) {
        await b.click();
        console.log("bought item", i, txt);
        break;
      }
    }
    await sleep(1000);
    await shot("7-trader-bought");
    console.log("SHOT 7-trader-bought");
    const reroll = frame.getByRole("button", { name: /Reroll/ });
    if ((await reroll.count()) > 0 && await reroll.isEnabled().catch(() => false)) {
      await reroll.click();
      await sleep(1000);
      await shot("8-trader-reroll");
      console.log("SHOT 8-trader-reroll");
    }
    // Continue → map rotation to the next map.
    await frame.getByRole("button", { name: /CONTINUE/ }).click();
    console.log("continued past trader (rotation)");
    await sleep(12000);
    await shot("9-rotated-map");
    console.log("SHOT 9-rotated-map");
    // Ride a bit on the new map for the later-map shot.
    await sleep(20000);
    await shot("10-later-map");
    console.log("SHOT 10-later-map");
  },
});
console.log("OVERHAUL VISUAL QA COMPLETE");
