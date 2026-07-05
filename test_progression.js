const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  let logs = [];
  page.on('console', msg => logs.push('CONSOLE: ' + msg.text()));
  page.on('pageerror', error => logs.push('ERROR: ' + error.message));

  try {
    logs.push('\n=== TESTING PROGRESSION ===');
    await page.goto('http://localhost:3000/cases/new', { waitUntil: 'networkidle0' });
    await page.type('input[placeholder="例: 就業規則改訂"]', '進行テスト案件');
    await page.select('select', 'A社（匿名）'); // clientName
    const selects = await page.$$('select');
    await selects[1].select('補助金支援'); // caseType
    
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle0' })
    ]);

    const urlParts = page.url().split('/');
    const caseId = urlParts[urlParts.length - 1];
    logs.push('Created case: ' + caseId);

    // Initial state: hearing is current
    let detailContent = await page.evaluate(() => document.body.innerText);
    logs.push('Initial state 1. ヒアリング is current: ' + (detailContent.includes('1. ヒアリング\n現在の工程') || detailContent.includes('現在の工程\n1. ヒアリング')));

    // We can't advance hearing yet because hearing is an implemented page.
    // Let's force progressStatus to guideline_review so we can test the placeholder progression.
    // Or, we can just navigate to the placeholder for guideline_review directly and click complete!
    logs.push('Navigating to guideline_review placeholder');
    await page.goto(`http://localhost:3000/cases/${caseId}/workflow/guideline_review`, { waitUntil: 'networkidle0' });
    
    const placeholderContent = await page.evaluate(() => document.body.innerText);
    logs.push('Shows "完了して次工程へ進む": ' + placeholderContent.includes('完了して次工程へ進む'));

    logs.push('Clicking 完了');
    await Promise.all([
      page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const target = buttons.find(b => b.innerText.includes('完了して次工程へ進む'));
        if (target) target.click();
      }),
      page.waitForNavigation({ waitUntil: 'networkidle0' })
    ]);

    // Back to details page
    detailContent = await page.evaluate(() => document.body.innerText);
    logs.push('Back to detail page URL: ' + page.url());
    
    // Now document_prep should be current
    logs.push('Now 3. 必要資料整理 is current: ' + (detailContent.includes('3. 必要資料整理\n現在の工程') || detailContent.includes('現在の工程\n3. 必要資料整理')));
    
    const stepsHtml = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.rounded-lg.border')).map(el => el.innerText.replace(/\n/g, ' ')).join(' | ');
    });
    logs.push('Steps HTML:\n' + stepsHtml);

    const isError = logs.some(l => l.includes('ERROR:') || l.includes('Maximum update depth exceeded'));
    logs.push('\nHas Error: ' + isError);

  } catch (e) {
    logs.push('CATCH: ' + e.message);
  }

  fs.writeFileSync('puppeteer_logs_progression.txt', logs.join('\n'));
  await browser.close();
})();
