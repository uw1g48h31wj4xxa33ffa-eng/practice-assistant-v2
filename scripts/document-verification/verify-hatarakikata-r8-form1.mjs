import fs from 'node:fs';
import path from 'node:path';
import { WordDocument } from './core/word-document.mjs';
import { VersionGuard } from './core/version-guard.mjs';
import { FieldLocator } from './core/field-locator.mjs';
import { WordFiller } from './core/word-filler.mjs';
import { OutputVerifier } from './core/output-verifier.mjs';
import { DomSerializationVerifier } from './core/dom-serialization-verifier.mjs';
import { ArrayFiller } from './core/array-filler.mjs';
import { hatarakikataR8Form1Mapping } from './config/hatarakikata-r8-form1.mapping.mjs';

const inputPath = process.env.INPUT_PATH || '/Users/to/Documents/practice-assistant-input/001687895.docx';
const outputDir = process.env.OUTPUT_DIR || '/Users/to/Documents/practice-assistant-output/';

async function verify(scenario, outputsMap) {
  console.log(`\n=== Running scenario: ${scenario} ===`);
  const outputPath = path.join(outputDir, `001687895_${scenario}.docx`);

  VersionGuard.verifyPaths(inputPath, outputPath);

  const doc = WordDocument.fromFile(inputPath);
  const originalBuffer = doc.getOriginalBuffer();

  VersionGuard.verifyHash(originalBuffer, hatarakikataR8Form1Mapping.template.expectedSha256);

  const documentDom = doc.getDocumentDom();
  const originalDomClone = documentDom.cloneNode(true);

  const inputsToFill = {};

  for (const [key, val] of Object.entries(outputsMap)) {
    const f = hatarakikataR8Form1Mapping.fields.find(field => field.fieldId === key);
    if (!f) {
      console.warn(`Field ${key} not found in mapping`);
      continue;
    }
    const config = { ...f, status: 'confirmed' };
    
    if (config.inputMode === 'sdt-checkbox') {
      const { SdtCheckboxLocator } = await import('./core/sdt-checkbox-locator.mjs');
      const { SdtCheckboxFiller } = await import('./core/sdt-checkbox-filler.mjs');
      const groupInfo = SdtCheckboxLocator.locateGroup(documentDom, config.locator, config.selection);
      SdtCheckboxFiller.fillGroup(groupInfo, val, config.selection, 'confirmed');
    } else if (config.inputMode === 'fixed-row-table') {
      ArrayFiller.fillFixedRowTable(documentDom, val, config);
    } else {
      let targetNode;
      if (config.locator.type === 'paragraph-exact-text') {
        const origNode = FieldLocator.locateParagraphByExactText(originalDomClone, config.labelText, config.locator);
        const origParagraphs = Array.from(originalDomClone.getElementsByTagName('w:p'));
        const origIndex = origParagraphs.indexOf(origNode);
        targetNode = documentDom.getElementsByTagName('w:p')[origIndex];
      } else if (config.locator.type === 'adjacent-cell') {
        const origCell = FieldLocator.locateAdjacentCell(originalDomClone, config.labelText, config.locator);
        const origCells = Array.from(originalDomClone.getElementsByTagName('w:tc'));
        const origIndex = origCells.indexOf(origCell);
        targetNode = documentDom.getElementsByTagName('w:tc')[origIndex];
      } else if (config.locator.type === 'distributed-cells' || config.locator.type === 'multi-row-distributed-cells') {
        let locatorRes;
        if (config.locator.type === 'distributed-cells') {
          locatorRes = FieldLocator.locateDistributedCells(documentDom, config.labelText, config.locator.pattern);
        } else {
          locatorRes = FieldLocator.locateMultiRowDistributedCells(documentDom, config.labelText, config.locator);
        }
        WordFiller.fillDistributedField(locatorRes, String(val), config);
        targetNode = null; // Distributed fields handle their own filling
      } else {
        throw new Error(`Unsupported locator type: ${config.locator.type}`);
      }

      if (targetNode) {
        if (config.inputMode === 'date-preserve-tokens') {
          WordFiller.fillDateFieldPreservingTokens(targetNode, String(val), config);
        } else if (config.inputMode === 'numeric-preserve-affix') {
          try { WordFiller.fillNumericFieldPreservingAffix(targetNode, String(val), config); } catch (e) { console.error("Error in field", key, e); throw e; }
        } else {
          WordFiller.fillField(targetNode, val, config);
        }
      }
    }
    inputsToFill[key] = val;
  }

  DomSerializationVerifier.verify(originalDomClone, documentDom);
  console.log('[Legacy Hatarakikata] Dom serialization passed');

  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }
  doc.save(outputPath);
  console.log(`Saved output to ${outputPath}`);

  await OutputVerifier.verify(originalBuffer, outputPath, hatarakikataR8Form1Mapping.template.expectedSha256, inputsToFill, hatarakikataR8Form1Mapping);
  console.log(`Output verification passed for ${scenario}`);
}

async function run() {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    const level4aData = {
      plan_start_date: '2026-07-15',
      capital: 10000000,
      employee_count: 25,
      corporate_number: '1234567890123',
      labor_insurance_number: '12345678901-234',
      bank_account_number: '1234567',
      bank_name: 'テスト銀行',
      branch_name: '新宿支店',
      bank_account_holder: 'カブシキガイシャテスト',
      sdt_group_14: ['①時間外労働の上限設定', '③時間単位年休及び特別休暇の導入'],
      cooperate_checkbox: '協力する',
      designated_workplaces: [
        { number: 1, name: '東京本社', address: '東京都新宿区', employee_count: 15 },
        { number: 2, name: '大阪支社', address: '大阪府大阪市', employee_count: 10 }
      ],
      wage_increase_workers: [
        { number: 1, name: '山田太郎', hire_date: '2020-04-01', current_wage: 1000, planned_wage: 1050, increase_date: '2026-08-01' },
        { number: 2, name: '佐藤花子', hire_date: '2021-04-01', current_wage: 1100, planned_wage: 1150, increase_date: '2026-08-01' }
      ],
      bank_account_type: '普通',
      field_16: 'これはテストです。\n改行もサポートします。\n\r\nさらに改行します。'
    };
    
    await verify('level4a_final_verification', level4aData);

    console.log('\nAll scenarios completed successfully.');
  } catch (err) {
    console.error('\nVerification failed:', err.message);
    process.exit(1);
  }
}

run();
