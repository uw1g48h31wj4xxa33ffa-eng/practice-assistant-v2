const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  let logs = [];
  page.on('console', msg => logs.push('CONSOLE: ' + msg.text()));
  page.on('pageerror', error => logs.push('ERROR: ' + error.message));

  try {
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

    logs.push('Detail loaded. Clicking "公募要項整理" (step 2) which should lead to placeholder.');
    
    // Find the link for 公募要項整理
    const links = await page.$$('a');
    let targetUrl = '';
    for (let link of links) {
        const text = await link.evaluate(el => el.innerText);
        const href = await link.evaluate(el => el.href);
        if (href && href.includes('/workflow/guideline_review')) {
            targetUrl = href;
            break;
        }
    }

    if (targetUrl) {
        logs.push('Found URL: ' + targetUrl);
        await page.goto(targetUrl, { waitUntil: 'networkidle0' });
        const placeholderContent = await page.evaluate(() => document.body.innerText);
        logs.push('Placeholder shows "準備中": ' + placeholderContent.includes('準備中です'));
        logs.push('Placeholder shows "公募要項整理": ' + placeholderContent.includes('公募要項整理'));
    } else {
        logs.push('URL not found for guideline_review');
    }

    const isError = logs.some(l => l.includes('ERROR:') || l.includes('Maximum update depth exceeded'));
    logs.push('\nHas Error: ' + isError);

  } catch (e) {
    logs.push('CATCH: ' + e.message);
  }

  fs.writeFileSync('puppeteer_logs_animations.txt', logs.join('\n'));
  await browser.close();
})();
