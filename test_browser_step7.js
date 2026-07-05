const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  let logs = [];
  page.on('console', msg => logs.push('CONSOLE: ' + msg.text()));
  page.on('pageerror', error => logs.push('ERROR: ' + error.message));

  try {
    logs.push('\n=== TESTING NEW CASE (Empty validationRecord) ===');
    await page.goto('http://localhost:3000/cases/case_1782955485351/ai-evidence', { waitUntil: 'networkidle0', timeout: 30000 });
    const h1New = await page.evaluate(() => document.querySelector('h1')?.textContent);
    logs.push('H1: ' + h1New);

    logs.push('\n=== TESTING DEMO CASE (Mock case) ===');
    await page.goto('http://localhost:3000/cases/1/ai-evidence', { waitUntil: 'networkidle0', timeout: 30000 });
    const h1Demo = await page.evaluate(() => document.querySelector('h1')?.textContent);
    logs.push('H1: ' + h1Demo);
    
    const isError = logs.some(l => l.includes('ERROR:') || l.includes('Maximum update depth exceeded'));
    logs.push('Has Error: ' + isError);

  } catch (e) {
    logs.push('CATCH: ' + e.message);
  }

  fs.writeFileSync('puppeteer_logs_step7.txt', logs.join('\n'));
  await browser.close();
})();
