const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  let logs = [];
  page.on('console', msg => logs.push('CONSOLE: ' + msg.text()));
  page.on('pageerror', error => logs.push('ERROR: ' + error.message));

  try {
    logs.push('\n=== TESTING NEW CASE CREATION ===');
    await page.goto('http://localhost:3000/cases/new', { waitUntil: 'networkidle0', timeout: 30000 });
    
    await page.type('input[placeholder="例: 就業規則改訂"]', '自動テスト案件');
    await page.select('select', 'A社（匿名）'); // clientName

    // Wait for employeeCount and industry selects to be interactable
    // employeeCount is the 5th select, industry is the 6th
    const selects = await page.$$('select');
    await selects[4].select('100〜299名'); // employeeCount
    await selects[5].select('製造業'); // industry
    
    await page.type('input[placeholder="例: 総務部 田中様"]', '自動テスト担当者'); // clientContactPerson
    
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle0' })
    ]);

    logs.push('Creation successful, checking detail page');
    
    const detailContent = await page.evaluate(() => document.body.innerText);
    logs.push('Detail shows 業種: ' + detailContent.includes('業種: 製造業'));
    logs.push('Detail shows 従業員数: ' + detailContent.includes('従業員数: 100〜299名'));
    logs.push('Detail shows 担当者: ' + detailContent.includes('担当者: 自動テスト担当者'));

    logs.push('\n=== TESTING CASES LIST ===');
    await page.goto('http://localhost:3000/cases', { waitUntil: 'networkidle0' });
    const listContent = await page.evaluate(() => document.body.innerText);
    logs.push('List shows (製造業 / 100〜299名): ' + listContent.includes('(製造業 / 100〜299名)'));

    logs.push('\n=== TESTING DEMO CASE ===');
    await page.goto('http://localhost:3000/cases/1', { waitUntil: 'networkidle0' });
    const demoContent = await page.evaluate(() => document.body.innerText);
    logs.push('Demo shows 業種: ' + demoContent.includes('業種: その他'));
    logs.push('Demo shows 従業員数: ' + demoContent.includes('従業員数: 100〜299名'));

    const isError = logs.some(l => l.includes('ERROR:') || l.includes('Maximum update depth exceeded'));
    logs.push('\nHas Error: ' + isError);

  } catch (e) {
    logs.push('CATCH: ' + e.message);
  }

  fs.writeFileSync('puppeteer_logs_add_fields.txt', logs.join('\n'));
  await browser.close();
})();
