const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  let logs = [];
  page.on('console', msg => logs.push('CONSOLE: ' + msg.text()));
  page.on('pageerror', error => logs.push('ERROR: ' + error.message));

  try {
    logs.push('\n=== TESTING NEW SUBSIDY CASE CREATION ===');
    await page.goto('http://localhost:3000/cases/new', { waitUntil: 'networkidle0', timeout: 30000 });
    
    await page.type('input[placeholder="例: 就業規則改訂"]', '補助金テスト案件');
    await page.select('select', 'A社（匿名）'); // clientName

    // The caseType select is the 2nd select
    const selects = await page.$$('select');
    await selects[1].select('補助金支援'); // caseType
    
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle0' })
    ]);

    logs.push('Creation successful, checking detail page');
    
    const detailContent = await page.evaluate(() => document.body.innerText);
    logs.push('Detail shows 案件種別: 補助金支援: ' + detailContent.includes('補助金支援'));
    logs.push('Detail shows 1. ヒアリング: ' + detailContent.includes('1. ヒアリング'));
    logs.push('Detail shows 2. 公募要項整理: ' + detailContent.includes('2. 公募要項整理'));
    logs.push('Detail shows 3. 必要資料整理: ' + detailContent.includes('3. 必要資料整理'));
    logs.push('Detail shows 4. スケジュール管理: ' + detailContent.includes('4. スケジュール管理'));
    logs.push('Detail shows 5. AI検証・エビデンス: ' + detailContent.includes('5. AI検証・エビデンス'));
    logs.push('Detail shows 6. 納品・提出準備: ' + detailContent.includes('6. 納品・提出準備'));

    logs.push('\n=== TESTING REGULAR CASE (DEMO) ===');
    await page.goto('http://localhost:3000/cases/1', { waitUntil: 'networkidle0' });
    const demoContent = await page.evaluate(() => document.body.innerText);
    logs.push('Demo shows 2. 規程設計: ' + demoContent.includes('2. 規程設計'));
    logs.push('Demo DOES NOT show 公募要項整理: ' + !demoContent.includes('公募要項整理'));

    const isError = logs.some(l => l.includes('ERROR:') || l.includes('Maximum update depth exceeded'));
    logs.push('\nHas Error: ' + isError);

  } catch (e) {
    logs.push('CATCH: ' + e.message);
  }

  fs.writeFileSync('puppeteer_logs_subsidy.txt', logs.join('\n'));
  await browser.close();
})();
