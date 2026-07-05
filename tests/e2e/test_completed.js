const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  let logs = [];
  page.on('console', msg => logs.push('CONSOLE: ' + msg.text()));
  page.on('pageerror', error => logs.push('ERROR: ' + error.message));

  try {
    logs.push('\n=== TESTING COMPLETED STATE ===');
    await page.goto('http://localhost:3000/cases/new', { waitUntil: 'networkidle0' });
    await page.type('input[placeholder="例: 就業規則改訂"]', '完了テスト案件');
    await page.select('select', 'A社（匿名）'); // clientName
    const selects = await page.$$('select');
    await selects[1].select('就業規則改訂'); // caseType labor rules
    
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle0' })
    ]);

    const urlParts = page.url().split('/');
    const caseId = urlParts[urlParts.length - 1];
    logs.push('Created case: ' + caseId);

    // Let's go straight to the delivery_prep step to complete it
    await page.goto(`http://localhost:3000/cases/${caseId}/workflow/delivery_prep`, { waitUntil: 'networkidle0' });
    
    let placeholderContent = await page.evaluate(() => document.body.innerText);
    logs.push('Shows "すべての工程を完了する": ' + placeholderContent.includes('すべての工程を完了する'));

    await Promise.all([
      page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const target = buttons.find(b => b.innerText.includes('すべての工程を完了する'));
        if (target) target.click();
      }),
      page.waitForNavigation({ waitUntil: 'networkidle0' })
    ]);

    // Back to details page
    let detailContent = await page.evaluate(() => document.body.innerText);
    logs.push('Shows "全工程完了": ' + detailContent.includes('全工程完了'));
    logs.push('Shows "この案件はすべての工程が完了しました。": ' + detailContent.includes('この案件はすべての工程が完了しました。'));

    // Verify all steps have completed badge
    const completedCount = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('span.bg-slate-200.text-slate-600')).filter(el => el.innerText === '完了').length;
    });
    logs.push('Completed badges count: ' + completedCount + ' (expected 4 for labor rules)');

    const isError = logs.some(l => l.includes('ERROR:') || l.includes('Maximum update depth exceeded'));
    logs.push('\nHas Error: ' + isError);

  } catch (e) {
    logs.push('CATCH: ' + e.message);
  }

  fs.writeFileSync('puppeteer_logs_completed.txt', logs.join('\n'));
  await browser.close();
})();
