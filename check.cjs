const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ bypassCSP: true });
  const page = await ctx.newPage();

  // Hard refresh - bypass cache
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://localhost:3001", { waitUntil: "networkidle", timeout: 20000 });
  
  // Check what's actually on the page
  const heroText = await page.$eval("h1", el => el.textContent).catch(() => "no h1");
  const gamesSection = await page.$("#games-section").then(el => el ? "found" : "not found").catch(() => "error");
  const doorCards = await page.$$(".game-door").then(els => els.length).catch(() => 0);
  const archSvgs = await page.$$(".arch-svg").then(els => els.length).catch(() => 0);
  
  console.log("h1:", heroText);
  console.log("games-section:", gamesSection);
  console.log(".game-door cards:", doorCards);
  console.log(".arch-svg:", archSvgs);
  
  await page.screenshot({ path: "C:/Users/walid/AppData/Local/Temp/pm-fresh.png" });
  await browser.close();
})();
