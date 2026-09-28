/**
 * submit-shots.mjs — compact pre-submission screenshot sweep.
 * home -> defend+prep -> wave-1 combat -> boss (hook) -> trader (hook),
 * plus a 360px pass. Bounded waits; each shot independent.
 */
import { testGame } from "@rarefriends/friendsdk/testing";

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const W = Number(process.env.FVF_WIDTH ?? 960);
const tag = process.env.FVF_TAG ?? "nw";

await testGame("./games/friends-vs-frenemies", {
  timeout: 180_000,
  width: W,
  screenshot: `./artifacts/${tag}-9-end.png`,
  check: async ({ game, page }) => {
    const frame = game;
    const child = () => page.frames().find(f => f.url().includes("game.html"));
    const settle = async () => {
      const plotDlg = frame.getByRole("dialog", { name: "Choose home plot" });
      if ((await plotDlg.count()) > 0) {
        await frame.getByRole("button", { name: /Settle in/ }).first().click();
        await sleep(600);
      }
      const sk = frame.getByRole("button", { name: /Skip tutorial|Got it!/ });
      if ((await sk.count()) > 0) await sk.first().click();
    };
    const defend = frame.getByRole("button", { name: "DEFEND", exact: true });
    await defend.waitFor({ timeout: 60_000 });
    await sleep(1500);
    await page.screenshot({ path: `./artifacts/${tag}-1-home.png` });
    console.log("SHOT home");
    await settle();
    await defend.click();
    await frame.getByText(/W1 ·/, { exact: false }).first().waitFor({ timeout: 15_000 });
    const prep = frame.getByRole("dialog", { name: "Prepare defense" });
    if ((await prep.count()) > 0) {
      await sleep(600);
      await page.screenshot({ path: `./artifacts/${tag}-2-prep.png` });
      console.log("SHOT prep");
      await frame.getByRole("button", { name: /DEFEND \(\d+\)/ }).click();
    }
    await sleep(12000);
    await page.screenshot({ path: `./artifacts/${tag}-3-combat.png` });
    console.log("SHOT combat");
    // Boss via hook.
    const fr = child();
    if (!fr) throw new Error("no game frame");
    await fr.goto(fr.url().split("?")[0] + "?fvfWave=5&fvfBuild=1");
    await defend.waitFor({ timeout: 90_000 });
    await settle();
    await defend.click();
    await frame.getByText(/W5 ·/, { exact: false }).first().waitFor({ timeout: 20_000 });
    await sleep(9000);
    await page.screenshot({ path: `./artifacts/${tag}-4-boss.png` });
    console.log("SHOT boss");
    // Trader via hook.
    const fr2 = child();
    if (!fr2) throw new Error("no game frame 2");
    await fr2.goto(fr2.url().split("?")[0] + "?fvfRf=400&fvfShop=1");
    await defend.waitFor({ timeout: 90_000 });
    await settle();
    await defend.click();
    const shop = frame.getByRole("dialog", { name: "Rare Trader" });
    await shop.waitFor({ timeout: 60_000 });
    await sleep(1200);
    await page.screenshot({ path: `./artifacts/${tag}-5-trader.png` });
    console.log("SHOT trader");
  },
});
console.log("SUBMIT SHOTS COMPLETE");
