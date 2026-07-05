const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  let logs = [];
  page.on('console', msg => logs.push('CONSOLE: ' + msg.text()));
  page.on('pageerror', error => logs.push('ERROR: ' + error.message));

  try {
    logs.push('\n=== TESTING REGULAR CASE (DEMO) ===');
    await page.goto('http://localhost:3000/cases/1', { waitUntil: 'networkidle0', timeout: 30000 });
    const demoContent = await page.evaluate(() => document.body.innerText);
    logs.push('Demo shows 2. 規程設計: ' + demoContent.includes('2. 規程設計'));
    logs.push('Demo DOES NOT show 公募要項整理: ' + !demoContent.includes('公募要項整理'));
    // Since progressStatus is 'rule_design' in mockCase 1, step 1 should have ✓, step 2 should be current, etc.
    const stepsHtml = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.rounded-lg.border')).map(el => el.innerText).join('\n');
    });
    logs.push('Steps HTML:\n' + stepsHtml);

    logs.push('\n=== TESTING SUBSIDY CASE (NEW) ===');
    await page.goto('http://localhost:3000/cases/new', { waitUntil: 'networkidle0' });
    await page.type('input[placeholder="例: 就業規則改訂"]', '補助金テスト案件');
    await page.select('select', 'A社（匿名）'); // clientName
    const selects = await page.$$('select');
    await selects[1].select('補助金支援'); // caseType
    
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle0' })
    ]);

    const detailContent = await page.evaluate(() => document.body.innerText);
    logs.push('Detail shows 案件種別: 補助金支援: ' + detailContent.includes('補助金支援'));
    logs.push('Detail shows 1. ヒアリング: ' + detailContent.includes('1. ヒアリング'));
    logs.push('Detail shows 2. 公募要項整理: ' + detailContent.includes('2. 公募要項整理'));

    const isError = logs.some(l => l.includes('ERROR:') || l.includes('Maximum update depth exceeded'));
    logs.push('\nHas Error: ' + isError);

  } catch (e) {
    logs.push('CATCH: ' + e.message);
  }

  fs.writeFileSync('puppeteer_logs_workflow.txt', logs.join('\n'));
  await browser.close();
})();
