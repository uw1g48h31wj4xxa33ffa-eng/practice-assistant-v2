const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  let logs = [];
  page.on('console', msg => logs.push('CONSOLE: ' + msg.text()));
  page.on('pageerror', error => logs.push('ERROR: ' + error.message));

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    
    // Inject a new mock case (simulating a newly created case)
    await page.evaluate(() => {
      const badCase = {
        id: 'case_1782955485351',
        title: 'テスト案件',
        clientName: 'テスト会社',
      };
      // keep existing cases if any, just prepend
      const existing = JSON.parse(localStorage.getItem('practice_assistant_v2_cases') || '[]');
      // remove old test case to prevent duplicates
      const filtered = existing.filter(c => c.id !== 'case_1782955485351');
      localStorage.setItem('practice_assistant_v2_cases', JSON.stringify([badCase, ...filtered]));
    });

    logs.push('\n=== TESTING NEW CASE ===');
    await page.goto('http://localhost:3000/cases/case_1782955485351/rule-design', { waitUntil: 'networkidle0' });
    const h1New = await page.evaluate(() => document.querySelector('h1')?.textContent);
    logs.push('H1: ' + h1New);

    logs.push('\n=== TESTING DEMO CASE ===');
    await page.goto('http://localhost:3000/cases/1/rule-design', { waitUntil: 'networkidle0' });
    const h1Demo = await page.evaluate(() => document.querySelector('h1')?.textContent);
    logs.push('H1: ' + h1Demo);
    
    // Verify specific UI elements
    const summaryText = await page.evaluate(() => document.body.innerText.includes('カテゴリ別（AI送信対象）:'));
    logs.push('Summary UI Present: ' + summaryText);

  } catch (e) {
    logs.push('CATCH: ' + e.message);
  }

  fs.writeFileSync('puppeteer_logs_step6.txt', logs.join('\n'));
  await browser.close();
})();
