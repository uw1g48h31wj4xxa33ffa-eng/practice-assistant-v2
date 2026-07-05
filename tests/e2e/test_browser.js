const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  let logs = [];
  page.on('console', msg => logs.push('CONSOLE: ' + msg.text()));
  page.on('pageerror', error => logs.push('ERROR: ' + error.message));

  try {
    // Go to cases list first to let it hydrate and set localStorage if needed?
    // No, we need to inject the mock data!
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    
    // Inject a bad case into localStorage!
    await page.evaluate(() => {
      const badCase = {
        id: 'case_1782955485351',
        title: 'テスト案件',
        clientName: 'テスト会社',
        // missing everything else!
      };
      localStorage.setItem('practice_assistant_v2_cases', JSON.stringify([badCase]));
    });

    // Now go to the specific case page
    await page.goto('http://localhost:3000/cases/case_1782955485351', { waitUntil: 'networkidle0' });
    
    const preText = await page.evaluate(() => {
      const pre = document.querySelector('pre');
      return pre ? pre.textContent : 'No pre tag';
    });
    logs.push('PRE TAG: ' + preText);

  } catch (e) {
    logs.push('CATCH: ' + e.message);
  }

  fs.writeFileSync('puppeteer_logs.txt', logs.join('\n'));
  await browser.close();
})();
