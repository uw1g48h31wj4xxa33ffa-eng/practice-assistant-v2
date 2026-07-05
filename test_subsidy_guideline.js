const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  let logs = [];
  page.on('console', msg => logs.push('CONSOLE: ' + msg.text()));
  page.on('pageerror', error => logs.push('ERROR: ' + error.message));

  try {
    logs.push('\n=== TESTING SUBSIDY GUIDELINE REVIEW ===');
    await page.goto('http://localhost:3000/cases/new', { waitUntil: 'networkidle0' });
    await page.type('input[placeholder="例: 就業規則改訂"]', '補助金ガイドラインテスト');
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

    // Navigate to subsidy-guideline
    logs.push('Navigating to subsidy-guideline...');
    await page.goto(`http://localhost:3000/cases/${caseId}/subsidy-guideline`, { waitUntil: 'networkidle0' });
    
    let pageContent = await page.evaluate(() => document.body.innerText);
    logs.push('Is guideline page rendered: ' + pageContent.includes('AI抽出項目'));

    // Try to click complete before everything is verified
    let isCompleteButtonDisabled = await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('公募要項整理を完了して必要資料整理へ進む'));
        return btn ? btn.disabled : true;
    });
    logs.push('Is complete button disabled initially: ' + isCompleteButtonDisabled);

    // Verify all items
    logs.push('Clicking verify for all items...');
    await page.evaluate(() => {
        const verifyButtons = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.includes('確認する'));
        verifyButtons.forEach(btn => btn.click());
    });

    // Check again
    isCompleteButtonDisabled = await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('公募要項整理を完了して必要資料整理へ進む'));
        return btn ? btn.disabled : true;
    });
    logs.push('Is complete button disabled after verification: ' + isCompleteButtonDisabled);

    // Click save & next
    logs.push('Clicking Save & Next...');
    await Promise.all([
        page.evaluate(() => {
            const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('公募要項整理を完了して必要資料整理へ進む'));
            if (btn) btn.click();
        }),
        page.waitForNavigation({ waitUntil: 'networkidle0' })
    ]);

    let detailContent = await page.evaluate(() => document.body.innerText);
    logs.push('Returned to detail page. Includes "3. 必要資料整理" as current: ' + detailContent.includes('現在の工程'));
    // Make sure we see progressStatus is document_prep by checking if "現在の工程" is under "3. 必要資料整理"
    // Wait, in our page, the "現在の工程" badge will be next to the step title.

    const isError = logs.some(l => l.includes('ERROR:') || l.includes('Maximum update depth exceeded'));
    logs.push('\nHas Error: ' + isError);

  } catch (e) {
    logs.push('CATCH: ' + e.message);
  }

  fs.writeFileSync('puppeteer_logs_guideline.txt', logs.join('\n'));
  await browser.close();
})();
