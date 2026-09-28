/**
 * interaction-test.mjs — full-loop browser verification via the SDK mock harness.
 * Home plot → DEFEND → auto-combat kills → level-up choice → blast → combat continues.
 * Run: node scripts/pnp-safe.mjs node scripts/interaction-test.mjs
 * Width override: FVF_WIDTH=360
 */
import { testGame } from "@rarefriends/friendsdk/testing";

const shot = (n) => `./artifacts/interaction-${n}.png`;

await testGame("./games/friends-vs-frenemies", {
  timeout: 120_000,
  width: Number(process.env.FVF_WIDTH ?? 960),
  screenshot: shot(process.env.FVF_WIDTH ? `end-${process.env.FVF_WIDTH}` : "end"),
  check: async ({ game, page }) => {
    const frame = game;
    const child = () => page.frames().find(f => f.url().includes("game.html"));
    const snap = async () => {
      for (let i = 0; i < 10; i++) {
        try {
          const fr = child();
          if (fr) {
            const v = await fr.evaluate(() => window.__fvf ?? null);
            if (v) return v;
          }
        } catch { /* frame transiently unavailable */ }
        await page.waitForTimeout(500);
      }
      return null;
    };
    const defend = frame.getByRole("button", { name: "DEFEND", exact: true });
    await defend.waitFor({ timeout: 60_000 });
    console.log("PASS home plot with DEFEND button");

    // Fresh profiles must choose home land first (base = first map).
    // NOTE: the multi-step tutorial opens AFTER the land choice (modals never
    // stack), so dismiss it here too before touching the home bar.
    const dismissTutorial = async () => {
      const skip = frame.getByRole("button", { name: /Got it!|Skip tutorial/ });
      if ((await skip.count()) > 0) {
        await skip.click();
        for (let i = 0; i < 5; i++) {
          const nxt = frame.getByRole("button", { name: /^Next$/ });
          if ((await nxt.count()) === 0) break;
          await nxt.click();
        }
        const start = frame.getByRole("button", { name: /Start building/ });
        if ((await start.count()) > 0) await start.click();
      }
    };
    const plotDlg = frame.getByRole("dialog", { name: "Choose home plot" });
    if ((await plotDlg.count()) > 0) {
      await frame.getByRole("button", { name: /Settle in/ }).first().click();
      console.log("PASS home plot chosen (base = first map)");
    }
    await dismissTutorial();
    console.log("PASS intro onboarding dismisses");
    const soundBtn = frame.getByRole("button", { name: "Toggle sound" });
    await soundBtn.click();
    await soundBtn.click();
    await frame.getByRole("button", { name: "Upgrades" }).click();
    const calm = frame.getByLabel("Calm");
    await calm.check();
    await calm.uncheck();
    // Default control mode is MANUAL; flip to AUTO and back (persisted).
    await frame.getByRole("button", { name: "AUTO", exact: true }).click();
    await frame.getByRole("button", { name: "MANUAL", exact: true }).click();
    await frame.getByRole("button", { name: "Close panel" }).click();
    console.log("PASS upgrades sheet + calm + mode preference");

    await frame.getByRole("button", { name: "Gear" }).click();
    await frame.getByText("Trader and boss gear").waitFor({ timeout: 10_000 });
    await frame.getByRole("button", { name: "Close panel" }).click();
    console.log("PASS gear sheet");

    // Base sheet with specializations/synergies must render without crashing.
    // NOTE: the homebar button's accessible name is "Base" (aria-label wins
    // over the "BASE" visual text); the sheet tab shares it once open.
    await frame.getByRole("button", { name: "Base", exact: true }).first().click();
    await frame.getByText(/Base Lv/).first().waitFor({ timeout: 10_000 });
    await page.screenshot({ path: "./artifacts/interaction-base.png" });
    await frame.getByRole("button", { name: "Close panel" }).click();
    console.log("PASS base sheet (specs/synergies render)");

    await defend.click();
    await frame.getByText(/W1 ·/, { exact: false }).first().waitFor({ timeout: 15_000 });
    console.log("PASS combat starts (compact HUD)");
    // Wave 1 opens in prep: launch it from the briefing, then move.
    const prepDlg = frame.getByRole("dialog", { name: "Prepare defense" });
    if ((await prepDlg.count()) > 0) {
      await frame.getByRole("button", { name: /DEFEND \(\d+\)/ }).click();
      await prepDlg.waitFor({ state: "hidden", timeout: 15_000 });
      console.log("PASS prep briefing launches wave 1");
    }

    // MANUAL default: WASD moves the Friend (read back via __fvf hook).
    const pos0 = await snap();
    if (!pos0 || pos0.manual !== true) throw new Error("expected manual mode default, got " + JSON.stringify(pos0));
    await page.keyboard.down("d");
    await page.waitForTimeout(1200);
    await page.keyboard.up("d");
    const pos1 = await snap();
    if (!(pos1 && pos1.x > pos0.x + 20)) throw new Error(`WASD did not move friend: ${JSON.stringify(pos0)} -> ${JSON.stringify(pos1)}`);
    console.log("PASS manual WASD movement");
    // Tap-to-move: click ahead of the Friend.
    const canvasBox = await frame.locator(".fvf-canvas").boundingBox();
    if (!canvasBox) throw new Error("no canvas box");
    await frame.locator(".fvf-canvas").click({ position: { x: canvasBox.width * 0.78, y: canvasBox.height * 0.47 } });
    await page.waitForTimeout(1500);
    const pos2 = await snap();
    if (!(pos2 && (Math.abs(pos2.x - pos1.x) + Math.abs(pos2.y - pos1.y)) > 10)) throw new Error("tap-to-move did not move friend");
    console.log("PASS tap-to-move");
    // AUTO toggle mid-combat and back.
    await frame.getByRole("button", { name: "Toggle auto-pilot" }).click();
    await page.waitForTimeout(500);
    const posA = await snap();
    if (!posA || posA.manual !== false) throw new Error("auto toggle failed: " + JSON.stringify(posA));
    await frame.getByRole("button", { name: "Toggle auto-pilot" }).click();
    await page.waitForTimeout(500);
    const posM = await snap();
    if (!posM || posM.manual !== true) throw new Error("manual toggle-back failed");
    console.log("PASS manual/auto switching");
    // Ride out the early waves on AUTO (kiting survives); back to manual after.
    await frame.getByRole("button", { name: "Toggle auto-pilot" }).click();

    const sawLevel = await page_wait_kills(frame, 3, 120_000);
    console.log("PASS automatic kills happening (level-up seen:", sawLevel + ")");
    // Stay on AUTO for the choice/ability steps (a stationary manual Friend dies).
    // Wait for a fresh level-up dialog to exercise the choice UI.
    const dialog = frame.getByRole("dialog", { name: /Choose an upgrade/ });
    await dialog.waitFor({ timeout: 180_000 });
    const offers = frame.locator(".fvf-offer");
    if ((await offers.count()) !== 3) throw new Error(`expected 3 offers, got ${await offers.count()}`);
    await frame.getByRole("button", { name: /Reroll/ }).waitFor({ timeout: 10_000 });
    await offers.first().click();
    console.log("PASS level-up choice applied");

    for (let i = 0; i < 6; i++) {
      const dlg = frame.getByRole("dialog", { name: /Choose an upgrade/ });
      if ((await dlg.count()) === 0) break;
      await frame.locator(".fvf-offer").first().click();
    }
    const blastBtn = frame.locator(".fvf-blast");
    try {
      await blastBtn.waitFor({ state: "visible", timeout: 15_000 });
    } catch (cause) {
      const buttons = frame.getByRole("button");
      const n = await buttons.count();
      console.log("DIAG button count:", n);
      for (let i = 0; i < n; i++) {
        const b = buttons.nth(i);
        console.log(`DIAG - "${await b.innerText().catch(() => "?")}" visible=${await b.isVisible().catch(() => "?")}`);
      }
      console.log("DIAG dialogs:", await frame.getByRole("dialog").count());
      throw cause;
    }
    await blastBtn.click();
    console.log("PASS blast control present + fired");

    for (let i = 0; i < 4; i++) {
      const dlg = frame.getByRole("dialog", { name: /Choose an upgrade/ });
      if ((await dlg.count()) === 0) break;
      await frame.locator(".fvf-offer").first().click();
    }
    await frame.getByRole("button", { name: "Inspect build" }).click();
    await frame.getByRole("dialog", { name: "Build inspector" }).waitFor({ timeout: 10_000 });
    await frame.getByRole("button", { name: "Back", exact: true }).click();
    console.log("PASS build inspector");

    // H toggles the collision debug overlay (dev-only, canvas-drawn).
    await page.keyboard.press("h");
    await page.waitForTimeout(800);
    console.log("PASS debug overlay toggle (no crash)");

    await frame.getByText(/W\d+ ·/).first().waitFor({ timeout: 30_000 });
    console.log("PASS combat continues after upgrade");
  },
});

async function page_wait_kills(frame, minKills, timeout) {
  const start = Date.now();
  const hud = frame.locator(".fvf-hud, .fvf-chips");
  let sawLevel = false;
  while (Date.now() - start < timeout) {
    const dlg = frame.getByRole("dialog", { name: /Choose an upgrade/ });
    if ((await dlg.count()) > 0) {
      sawLevel = true;
      await frame.locator(".fvf-offer").first().click();
      continue;
    }
    const text = (await hud.innerText().catch(() => "")) ?? "";
    const m = text.match(/(\d+) down/);
    if (m && Number(m[1]) >= minKills) return sawLevel;
    await new Promise(r => setTimeout(r, 2000));
  }
  throw new Error(`kills did not reach ${minKills} in time`);
}

console.log("INTERACTION TEST COMPLETE");
