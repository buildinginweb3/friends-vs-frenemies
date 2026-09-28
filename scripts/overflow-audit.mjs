/**
 * overflow-audit.mjs — static UI overflow sweep (submission §4-6).
 * Reports any visible element whose content overflows its box or the
 * 960x640 / 360px viewport at home, in combat dock, and in Trader/level-up.
 */
import { testGame } from "@rarefriends/friendsdk/testing";

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const W = Number(process.env.FVF_WIDTH ?? 960);

await testGame("./games/friends-vs-frenemies", {
  timeout: 180_000,
  width: W,
  check: async ({ game, page }) => {
    const frame = game;
    const audit = async (label) => {
      const fr = page.frames().find(f => f.url().includes("game.html"));
      if (!fr) { console.log(`AUDIT ${label}: no frame`); return; }
      const bad = await fr.evaluate(() => {
        const out = [];
        const vw = window.innerWidth, vh = window.innerHeight;
        const els = document.querySelectorAll("button, .fvf-chip, .fvf-hudseg, .fvf-card h2, .fvf-shopitem strong, .fvf-offer strong, .fvf-toast strong");
        const inScroller = (el) => {
          let p = el.parentElement;
          while (p) {
            const s = window.getComputedStyle(p);
            if (s.overflowY === "auto" || s.overflowY === "scroll") return true;
            p = p.parentElement;
          }
          return false;
        };
        els.forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.width === 0 && r.height === 0) return;
          const style = window.getComputedStyle(el);
          if (style.visibility === "hidden" || style.display === "none") return;
          if (inScroller(el)) return; // scroll-container contents are reachable by scrolling
          if (el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 2) {
            out.push(`${el.tagName}.${[...el.classList].join(".")}: box ${Math.round(r.width)}x${Math.round(r.height)} scroll ${el.scrollWidth}x${el.scrollHeight} text=${(el.innerText || "").split("\n")[0].slice(0, 40)}`);
          }
          if (r.right > vw + 1 || r.bottom > vh + 1 || r.left < -1 || r.top < -1) {
            out.push(`VIEWPORT ${el.tagName}.${[...el.classList].join(".")}: rect ${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.right)},${Math.round(r.bottom)} vs ${vw}x${vh}`);
          }
        });
        return out;
      });
      console.log(`AUDIT ${label}: ${bad.length === 0 ? "CLEAN" : bad.length + " issues"}`);
      bad.slice(0, 15).forEach(b => console.log("  -", b));
    };
    const defend = frame.getByRole("button", { name: "DEFEND", exact: true });
    await defend.waitFor({ timeout: 60_000 });
    const plotDlg = frame.getByRole("dialog", { name: "Choose home plot" });
    if ((await plotDlg.count()) > 0) {
      await frame.getByRole("button", { name: /Settle in/ }).first().click();
      await sleep(500);
    }
    const sk = frame.getByRole("button", { name: /Skip tutorial|Got it!/ });
    if ((await sk.count()) > 0) await sk.first().click();
    await audit("home");
    await defend.click();
    await frame.getByText(/W1 ·/, { exact: false }).first().waitFor({ timeout: 15_000 });
    const prep = frame.getByRole("dialog", { name: "Prepare defense" });
    if ((await prep.count()) > 0) {
      await audit("prep");
      await frame.getByRole("button", { name: /DEFEND \(\d+\)/ }).click();
    }
    await sleep(9000);
    await audit("combat+dock");
    // Trader via hook for shop overflow.
    const child = () => page.frames().find(f => f.url().includes("game.html"));
    const fr = child();
    if (!fr) throw new Error("no game frame");
    await fr.goto(fr.url().split("?")[0] + "?fvfRf=400&fvfShop=1");
    await defend.waitFor({ timeout: 90_000 });
    const plotDlg2 = frame.getByRole("dialog", { name: "Choose home plot" });
    if ((await plotDlg2.count()) > 0) {
      await frame.getByRole("button", { name: /Settle in/ }).first().click();
      await sleep(500);
    }
    const sk2 = frame.getByRole("button", { name: /Skip tutorial|Got it!/ });
    if ((await sk2.count()) > 0) await sk2.first().click();
    await defend.click();
    const shop = frame.getByRole("dialog", { name: "Rare Trader" });
    await shop.waitFor({ timeout: 60_000 });
    await sleep(800);
    await audit("trader");
  },
});
console.log("OVERFLOW AUDIT COMPLETE");
