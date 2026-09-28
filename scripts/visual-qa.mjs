/**
 * visual-qa.mjs — deep screenshot checkpoints: home, manual combat, wave types,
 * boss, trader (buy + reroll + continue), charger telegraph, map transition,
 * map 2, debug overlay. Long-lived (~15-20 min).
 * Run: node scripts/pnp-safe.mjs node scripts/visual-qa.mjs
 */
import { testGame } from "@rarefriends/friendsdk/testing";

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

await testGame("./games/friends-vs-frenemies", {
  timeout: 120_000,
  width: Number(process.env.FVF_WIDTH ?? 960),
  screenshot: `./artifacts/qa-${process.env.FVF_WIDTH ? "m-" : ""}final.png`,
  check: async ({ game, page }) => {
    const frame = game;
    const shot = (n) => page.screenshot({ path: `./artifacts/qa-${process.env.FVF_WIDTH ? "m-" : ""}${n}.png` });
    const defend = frame.getByRole("button", { name: "DEFEND", exact: true });
    await defend.waitFor({ timeout: 60_000 });
    const gotIt = frame.getByRole("button", { name: /Got it!|Skip tutorial/ });
    if ((await gotIt.count()) > 0) await gotIt.click();
    // Fresh profiles must choose home land first (base = first map).
    const plotDlg = frame.getByRole("dialog", { name: "Choose home plot" });
    if ((await plotDlg.count()) > 0) {
      await frame.getByRole("button", { name: /Settle in/ }).first().click();
      await sleep(800);
      { const sk = frame.getByRole("button", { name: /Skip tutorial/ }); if ((await sk.count()) > 0) { await sk.click(); } }
      await sleep(1000);
      console.log("QA home plot chosen");
    }
    await sleep(5000);
    await shot("1-home");

    // Manual combat: hold D briefly, then let auto-attacks work.
    await defend.click();
    await frame.getByText(/W1 ·/).first().waitFor({ timeout: 15_000 });
    // Wave 1 opens in prep: launch it from the briefing first.
    const prepDlg0 = frame.getByRole("dialog", { name: "Prepare defense" });
    if ((await prepDlg0.count()) > 0) {
      await frame.getByRole("button", { name: /DEFEND \(\d+\)/ }).click();
      await prepDlg0.waitFor({ state: "hidden", timeout: 15_000 });
      console.log("QA prep briefing launched");
    }
    await page.keyboard.down("d");
    await sleep(1500);
    await page.keyboard.up("d");
    await sleep(9000);
    await shot("2-manual");
    const child = () => page.frames().find(f => f.url().includes("game.html"));
    const hv = async () => {
      try {
        const fr = child();
        return fr ? await fr.evaluate(() => window.__fvf ?? null) : null;
      } catch { return null; }
    };
    const pickOne = async () => {
      const dlg = frame.getByRole("dialog", { name: /Choose an upgrade/ });
      if ((await dlg.count()) === 0) return false;
      const s = await hv();
      const hurt = s && s.hp < s.maxHp * 0.6;
      const offers = frame.locator(".fvf-offer");
      const n = await offers.count();
      const names = [];
      for (let k = 0; k < n; k++) names.push(((await offers.nth(k).innerText().catch(() => "")) ?? "").split("\n")[0]);
      const find = (...words) => names.findIndex(t => words.some(w => t.includes(w)));
      let pick = hurt ? find("Vitality", "Regeneration", "Iron Skin", "Snack") : find("Power", "Rapid", "Multi", "Pierce", "Crit", "Burn");
      if (pick < 0) pick = 0;
      await offers.nth(pick).click();
      await sleep(500);
      return true;
    };
    const clearLevels = async () => {
      for (let i = 0; i < 4; i++) {
        if (!(await pickOne())) break;
      }
    };
    // Long ride on AUTO-pilot (manual standing still would die).
    await clearLevels();
    await frame.getByRole("button", { name: "Toggle auto-pilot" }).click();
    await sleep(2000);
    const modeCheck = await hv();
    console.log("QA auto engaged:", modeCheck && modeCheck.manual === false);
    // Brief manual mouse-aim segment: shots should track the cursor.
    await clearLevels();
    await frame.getByRole("button", { name: "Toggle auto-pilot" }).click();
    const box = await frame.locator(".fvf-canvas").boundingBox();
    if (box) {
      for (let i = 0; i <= 8; i++) {
        await clearLevels();
        const a = (i / 8) * Math.PI * 2;
        await page.mouse.move(box.x + box.width / 2 + Math.cos(a) * box.width * 0.3, box.y + box.height / 2 + Math.sin(a) * box.height * 0.3, { steps: 4 });
        await sleep(700);
      }
      await page.screenshot({ path: `./artifacts/qa-${process.env.FVF_WIDTH ? "m-" : ""}2b-aim.png` });
      console.log("QA mouse-aim segment done");
    }
    await clearLevels();
    await frame.getByRole("button", { name: "Toggle auto-pilot" }).click();
    await sleep(1000);
    const smartTick = async () => {
      await page.keyboard.press(" ");
      const s = await hv();
      if (s && s.hp < s.maxHp * 0.45) {
        const heal = frame.getByRole("button", { name: "Heal with banked RF" });
        if ((await heal.count()) > 0 && await heal.isEnabled().catch(() => false)) await heal.click();
      }
    };
    const deadline = Date.now() + 12 * 60 * 1000;
    let sawBoss = false;
    while (Date.now() < deadline) {
      if (await pickOne()) continue;
      if (await frame.getByText(/DEFENSE OVER/).count() > 0) break;
      await smartTick();
      const chips = (await frame.locator(".fvf-chips").innerText().catch(() => "")) ?? "";
      if (/W5 ·/.test(chips)) {
        await sleep(10000);
        await shot("3-boss");
        sawBoss = true;
        break;
      }
      await sleep(4000);
    }
    console.log("QA boss seen:", sawBoss);

    // Wait for the trader modal OR death (bounded, logged).
    let traderUp = false, died = false;
    const deadlineT = Date.now() + 8 * 60 * 1000;
    while (Date.now() < deadlineT) {
      if (await pickOne()) continue;
      if (await frame.getByText(/DEFENSE OVER/).count() > 0) { died = true; break; }
      if (await frame.getByRole("dialog", { name: "Rare Trader" }).count() > 0) { traderUp = true; break; }
      await smartTick();
      await sleep(3000);
    }
    const st = await hv();
    console.log("QA post-boss: trader=", traderUp, "died=", died, "state=", JSON.stringify(st));
    if (died) {
      await shot("4-died-instead");
      throw new Error("run died on wave 5 before trader");
    }
    if (!traderUp) throw new Error("trader never appeared (stall?)");

    // Trader: screenshot, buy cheapest affordable gear, reroll, continue.
    const trader = frame.getByRole("dialog", { name: "Rare Trader" });
    await sleep(1500);
    await shot("4-trader");
    await clearLevels();
    const buyBtns = frame.locator(".fvf-shopitem button");
    const nb = await buyBtns.count();
    for (let i = 0; i < nb; i++) {
      const b = buyBtns.nth(i);
      const txt = (await b.innerText().catch(() => "")) ?? "";
      if (/^\d+$/.test(txt.trim()) && await b.isEnabled().catch(() => false)) {
        await b.click();
        console.log("QA bought shop item", i, txt);
        break;
      }
    }
    await sleep(1000);
    await shot("5-trader-bought");
    const reroll = frame.getByRole("button", { name: /Reroll/ });
    if ((await reroll.count()) > 0 && await reroll.isEnabled().catch(() => false)) {
      await reroll.click();
      console.log("QA rerolled shop");
      await sleep(1000);
      await shot("6-trader-reroll");
    }
    await frame.getByRole("button", { name: /CONTINUE/ }).click();
    console.log("QA continued past trader");
    await sleep(8000);
    await shot("7-post-trader");

    // Ride toward wave 8+ (charger telegraphs) then wave 10 (boss + map).
    const deadline2 = Date.now() + 12 * 60 * 1000;
    let shotTelegraph = false, shotBoss2 = false;
    while (Date.now() < deadline2) {
      if (await pickOne()) continue;
      if (await frame.getByText(/DEFENSE OVER/).count() > 0) break;
      await smartTick();
      if (await frame.getByRole("dialog", { name: "Rare Trader" }).count() > 0) break;
      const chips = (await frame.locator(".fvf-chips").innerText().catch(() => "")) ?? "";
      if (!shotTelegraph && /W8 ·|W9 ·/.test(chips)) {
        await sleep(6000);
        await shot("8-charger");
        shotTelegraph = true;
      }
      if (/W10 ·/.test(chips)) {
        await sleep(12000);
        await shot("9-boss2");
        shotBoss2 = true;
        break;
      }
      await sleep(4000);
    }
    console.log("QA telegraph shot:", shotTelegraph, "boss2 shot:", shotBoss2);

    // Second trader → continue → map transition to Copper Court.
    const trader2 = frame.getByRole("dialog", { name: "Rare Trader" });
    if ((await trader2.count()) > 0 || await trader2.waitFor({ timeout: 8 * 60 * 1000 }).then(() => true).catch(() => false)) {
      await sleep(1500);
      await shot("10-trader2");
      const cont = frame.getByRole("button", { name: /CONTINUE/ });
      if ((await cont.count()) > 0) await cont.click();
      await sleep(12000);
      await shot("11-map2");
      console.log("QA map transition captured");
    }

    // Debug overlay on the live world.
    await page.keyboard.press("h");
    await sleep(1200);
    await shot("12-debug");
    await page.keyboard.press("h");
  },
});
console.log("VISUAL QA COMPLETE");
