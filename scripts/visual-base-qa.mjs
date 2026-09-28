/**
 * visual-base-qa.mjs — upgraded-base screenshots: AUTO ride to wave 5, trader,
 * rotate, deliberate death on the new map, results, then spend earnings on
 * turret + collector and capture the developed home (2.5D close-up).
 * Run: node scripts/pnp-safe.mjs node scripts/visual-base-qa.mjs
 */
import { testGame } from "@rarefriends/friendsdk/testing";

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

await testGame("./games/friends-vs-frenemies", {
  timeout: 120_000,
  width: 960,
  screenshot: "./artifacts/v2-final-base.png",
  check: async ({ game, page }) => {
    const frame = game;
    const shot = (n) => page.screenshot({ path: `./artifacts/v2-${n}.png` });
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
    await defend.click();
    await frame.getByText(/W1 ·/, { exact: false }).first().waitFor({ timeout: 15_000 });
    const prepDlg = frame.getByRole("dialog", { name: "Prepare defense" });
    if ((await prepDlg.count()) > 0) {
      await frame.getByRole("button", { name: /DEFEND \(\d+\)/ }).click();
      await prepDlg.waitFor({ state: "hidden", timeout: 15_000 });
    }
    const pickOne = async () => {
      const dlg = frame.getByRole("dialog", { name: /Choose an upgrade/ });
      if ((await dlg.count()) === 0) return false;
      const offers = frame.locator(".fvf-offer");
      if ((await offers.count()) > 0) await offers.first().click();
      await sleep(400);
      return true;
    };
    for (let i = 0; i < 5; i++) { if (!(await pickOne())) break; }
    await frame.getByRole("button", { name: "Toggle auto-pilot" }).click();
    console.log("AUTO engaged, riding until the run ends or trader appears");
    // Ride: clear dialogs, heal under 45%. Ends at trader (boss down) or
    // DEFENSE OVER (overwhelmed) — either way the profile banks RF to spend.
    const deadline = Date.now() + 12 * 60 * 1000;
    let traderUp = false, over = false;
    while (Date.now() < deadline) {
      if (await pickOne()) continue;
      if (await frame.getByText(/DEFENSE OVER/).count() > 0) { over = true; break; }
      if (await frame.getByRole("dialog", { name: "Rare Trader" }).count() > 0) { traderUp = true; break; }
      await page.keyboard.press(" ");
      const s = await hv();
      if (s && s.hp < s.maxHp * 0.45) {
        const heal = frame.getByRole("button", { name: "Heal with banked RF" });
        if ((await heal.count()) > 0 && await heal.isEnabled().catch(() => false)) await heal.click();
      }
      await sleep(2500);
    }
    console.log("trader up:", traderUp, "over:", over);
    if (traderUp) {
      await sleep(1000);
      await shot("base-trader");
      console.log("SHOT base-trader");
      // Spend bank RF on the cheapest gear, then continue rotating.
      const buyBtns = frame.locator(".fvf-shopitem button");
      for (let i = 0; i < (await buyBtns.count()); i++) {
        const b = buyBtns.nth(i);
        const txt = ((await b.innerText().catch(() => "")) ?? "").trim();
        if (/^\d+$/.test(txt) && await b.isEnabled().catch(() => false)) { await b.click(); break; }
      }
      await frame.getByRole("button", { name: /CONTINUE/ }).click();
      console.log("rotated; standing still on MANUAL to fall");
      await sleep(6000);
      const modeBtn = frame.getByRole("button", { name: "Toggle auto-pilot" });
      const modeTxt = ((await modeBtn.innerText().catch(() => "")) ?? "").trim();
      if (modeTxt === "AUTO") await modeBtn.click(); // back to MANUAL
      const deadlineD = Date.now() + 10 * 60 * 1000;
      while (Date.now() < deadlineD) {
        if (await pickOne()) continue;
        if (await frame.getByText(/DEFENSE OVER/).count() > 0) { over = true; break; }
        await sleep(3000);
      }
    }
    console.log("defense over:", over);
    if (!over) { await shot("base-survived"); return; }
    await sleep(1000);
    await shot("11-results");
    console.log("SHOT 11-results");
    // Results → BUILD → home with earnings.
    await frame.getByRole("button", { name: "BUILD", exact: true }).click();
    await sleep(2000);
    // Open BASE sheet and buy turret + collector.
    await frame.getByLabel("Base", { exact: true }).click();
    await sleep(1500);
    await shot("12-base-sheet");
    console.log("SHOT 12-base-sheet");
    // Buy first two affordable structures (turret 40, collector 45).
    for (let round = 0; round < 2; round++) {
      const btns = frame.locator(".fvf-up button");
      const n = await btns.count();
      let bought = false;
      for (let i = 0; i < n; i++) {
        const b = btns.nth(i);
        const label = ((await b.getAttribute("aria-label").catch(() => "")) ?? "");
        if (/Build (Friend Turret|RF Collector) for/.test(label) && await b.isEnabled().catch(() => false)) {
          await b.click();
          console.log("bought:", label.slice(0, 40));
          bought = true;
          await sleep(800);
          break;
        }
      }
      if (!bought) break;
    }
    await frame.getByRole("button", { name: "Close panel" }).click();
    await sleep(6000);
    await shot("13-upgraded-home");
    console.log("SHOT 13-upgraded-home");
  },
});
console.log("BASE VISUAL QA COMPLETE");
