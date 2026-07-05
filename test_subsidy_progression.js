const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  let logs = [];
  page.on('console', msg => logs.push('CONSOLE: ' + msg.text()));
  page.on('pageerror', error => logs.push('ERROR: ' + error.message));

  try {
    logs.push('\n=== TESTING SUBSIDY PROGRESSION ===');
    await page.goto('http://localhost:3000/cases/new', { waitUntil: 'networkidle0' });
    await page.type('input[placeholder="例: 就業規則改訂"]', '補助金進行テスト案件');
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
    logs.push('Initial state 1. ヒアリング is current: ' + detailContent.includes('現在の工程'));

    const steps = ['guideline_review', 'document_prep', 'schedule_management', 'ai_review', 'delivery_prep'];
    
    for (const step of steps) {
        // Let's just navigate to the placeholder directly since we can't 'complete' the real hearing page yet.
        // Wait, the user said "1. 補助金案件を開く 2. 公募要項整理の「開く」を押す"
        // But initial status is 'hearing'. If I click "開く" on 'guideline_review', it will just open it.
        // Let's do that!
        logs.push(`Navigating to ${step} placeholder...`);
        await page.goto(`http://localhost:3000/cases/${caseId}/workflow/${step}`, { waitUntil: 'networkidle0' });
        
        let placeholderContent = await page.evaluate(() => document.body.innerText);
        const hasCompleteButton = placeholderContent.includes('完了して次工程へ進む') || placeholderContent.includes('すべての工程を完了する');
        logs.push(`Shows complete button for ${step}: ${hasCompleteButton}`);

        if (hasCompleteButton) {
            logs.push(`Clicking complete for ${step}`);
            await Promise.all([
                page.evaluate(() => {
                    const buttons = Array.from(document.querySelectorAll('button'));
                    const target = buttons.find(b => b.innerText.includes('完了して次工程へ進む') || b.innerText.includes('すべての工程を完了する'));
                    if (target) target.click();
                }),
                page.waitForNavigation({ waitUntil: 'networkidle0' })
            ]);
            
            detailContent = await page.evaluate(() => document.body.innerText);
            logs.push(`Returned to detail page after ${step}. Status text: ` + detailContent.substring(0, 100).replace(/\n/g, ' '));
        } else {
            // It might be a real page like ai-evidence, in which case we don't have a complete button yet.
            // Oh right, step 5 `ai_review` points to `/cases/[id]/ai-evidence` which does NOT have a complete button!
            // The user's flow says "同様にスケジュール管理、納品・提出準備まで進める"
            // Wait, how can they progress past ai-evidence if it has no complete button?
            // "5. 案件詳細へ戻る 6. 必要資料整理が「現在の工程」になる 7. 同様にスケジュール管理、納品・提出準備まで進める"
            // Let's just force progress to the next step via updateCase or URL manipulation if needed.
            // But let's see what happens.
        }
    }

    logs.push('Final check for completed status: ' + detailContent.includes('全工程完了'));

    const isError = logs.some(l => l.includes('ERROR:') || l.includes('Maximum update depth exceeded'));
    logs.push('\nHas Error: ' + isError);

  } catch (e) {
    logs.push('CATCH: ' + e.message);
  }

  fs.writeFileSync('puppeteer_logs_subsidy.txt', logs.join('\n'));
  await browser.close();
})();
