const { chromium } = require('playwright');
(async ()=>{
  const b=await chromium.launch({channel:'chrome'});
  const p=await b.newPage({viewport:{width:390,height:844}});
  await p.goto('http://localhost:3000/',{waitUntil:'domcontentloaded'});
  await p.waitForTimeout(1000);
  const chips = await p.eval('button', btns=>btns.filter(b=>/الألعاب الجماعية/.test(b.innerText||b.textContent||'')).length);
  console.log(chips);
  await b.close();
})().catch(()=>{});
