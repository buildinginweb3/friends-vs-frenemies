import { testGame } from "@rarefriends/friendsdk/testing";
process.on("unhandledRejection", () => {});
await testGame("./games/friends-vs-frenemies", {
  timeout: 45_000,
  check: async ({ game, page }) => {
    await page.waitForTimeout(20000);
    const errs = await page.evaluate(() => (window.__fvf_errors ?? []).length);
    console.log("captured errors:", errs);
  },
}).catch(e => {
  console.log("=== FULL ERROR START ===");
  console.log(String(e).slice(0, 4000));
  console.log("=== FULL ERROR END ===");
});
