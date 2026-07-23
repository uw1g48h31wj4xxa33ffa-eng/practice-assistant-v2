import fs from 'node:fs';
import path from 'node:path';
import { WordDocument } from './core/word-document.mjs';
import { VersionGuard } from './core/version-guard.mjs';
import { FieldLocator } from './core/field-locator.mjs';
import { WordFiller } from './core/word-filler.mjs';
import { OutputVerifier } from './core/output-verifier.mjs';
import { DomSerializationVerifier } from './core/dom-serialization-verifier.mjs';
import { ArrayFiller } from './core/array-filler.mjs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const hatarakikataFieldsPath = path.join(__dirname, 'config', 'hatarakikata-r8-form1-fields.json');
const hatarakikataFields = JSON.parse(fs.readFileSync(hatarakikataFieldsPath, 'utf8'));

import { JsonProfileAdapter } from '../../src/profiles/resolution/json-profile-adapter.js';
import { ProfileRegistry } from '../../src/profiles/registry/profile-registry.js';
import { CareerUpAdapter } from '../../src/profiles/resolution/adapter.js';

const inputPath = process.env.INPUT_PATH || '/Users/to/Documents/practice-assistant-input/001687895.docx';
const outputDir = process.env.OUTPUT_DIR || '/Users/to/Documents/practice-assistant-output/';

function setupRegistry() {
  const registry = new ProfileRegistry();
  const adapter = new JsonProfileAdapter();
  const { formProfile, mappingProfile } = adapter.adapt(hatarakikataFields);
  registry.register(formProfile);
  registry.register(mappingProfile);
  return registry;
}

export async function orchestrateProfileGeneration(registry, config, startWordGeneration, runVerifier) {
  const { ProfileVerificationRunner } = await import('../../src/profiles/runner/profile-verification-runner.js');
  const runner = new ProfileVerificationRunner({
    registry,
    startWordGeneration,
    runVerifier
  });
  return await runner.run(config);
}

async function verify(scenario, outputsMap) {
  console.log(`\n=== Running scenario: ${scenario} ===`);
  const outputPath = path.join(outputDir, `001687895_${scenario}_profile_test.docx`);

  VersionGuard.verifyPaths(inputPath, outputPath);

  const registry = setupRegistry();
  const config = {
    formProfileId: 'hatarakikata-r8-form1',
    mappingProfileId: 'hatarakikata-r8-form1-map1',
    effectiveDate: new Date('2024-05-01T00:00:00Z'),
    inputData: outputsMap,
    outputPath: outputPath
  };

  const startWordGenerationCb = async (context, inputData, outPath) => {
    // We can reuse CareerUpAdapter because it just converts ExecutionContext back to LegacyMappingFormat
    const adapter = new CareerUpAdapter();
    const mapping = adapter.adapt(context, config.formProfileId, config.mappingProfileId);

    const doc = WordDocument.fromFile(inputPath);
    const originalBuffer = doc.getOriginalBuffer();

    VersionGuard.verifyHash(originalBuffer, mapping.template.expectedSha256);

    const documentDom = doc.getDocumentDom();
    const originalDomClone = documentDom.cloneNode(true);

    const inputsToFill = {};

    for (const [key, val] of Object.entries(inputData)) {
      const f = mapping.fields.find(field => field.fieldId === key);
      if (!f) {
        console.warn(`Field ${key} not found in mapping`);
        continue;
      }
      const fieldConfig = { ...f, status: 'confirmed' };
      
      if (fieldConfig.inputMode === 'sdt-checkbox') {
        const { SdtCheckboxLocator } = await import('./core/sdt-checkbox-locator.mjs');
        const { SdtCheckboxFiller } = await import('./core/sdt-checkbox-filler.mjs');
        const groupInfo = SdtCheckboxLocator.locateGroup(documentDom, fieldConfig.locator, fieldConfig.selection);
        SdtCheckboxFiller.fillGroup(groupInfo, val, fieldConfig.selection, 'confirmed');
      } else if (fieldConfig.inputMode === 'fixed-row-table') {
        ArrayFiller.fillFixedRowTable(documentDom, val, fieldConfig);
      } else {
        let targetNode;
        if (fieldConfig.locator.type === 'paragraph-exact-text') {
          const origNode = FieldLocator.locateParagraphByExactText(originalDomClone, fieldConfig.labelText, fieldConfig.locator);
          const origParagraphs = Array.from(originalDomClone.getElementsByTagName('w:p'));
          const origIndex = origParagraphs.indexOf(origNode);
          targetNode = documentDom.getElementsByTagName('w:p')[origIndex];
        } else if (fieldConfig.locator.type === 'adjacent-cell') {
          const origCell = FieldLocator.locateAdjacentCell(originalDomClone, fieldConfig.labelText, fieldConfig.locator);
          const origCells = Array.from(originalDomClone.getElementsByTagName('w:tc'));
          const origIndex = origCells.indexOf(origCell);
          targetNode = documentDom.getElementsByTagName('w:tc')[origIndex];
        } else if (fieldConfig.locator.type === 'distributed-cells' || fieldConfig.locator.type === 'multi-row-distributed-cells') {
          let locatorRes;
          if (fieldConfig.locator.type === 'distributed-cells') {
            locatorRes = FieldLocator.locateDistributedCells(documentDom, fieldConfig.labelText, fieldConfig.locator.pattern);
          } else {
            locatorRes = FieldLocator.locateMultiRowDistributedCells(documentDom, fieldConfig.labelText, fieldConfig.locator);
          }
          WordFiller.fillDistributedField(locatorRes, String(val), fieldConfig);
          targetNode = null;
        } else {
          throw new Error(`Unsupported locator type: ${fieldConfig.locator.type}`);
        }

        if (targetNode) {
          if (fieldConfig.inputMode === 'date-preserve-tokens') {
            WordFiller.fillDateFieldPreservingTokens(targetNode, String(val), fieldConfig);
          } else if (fieldConfig.inputMode === 'numeric-preserve-affix') {
            try { 
              WordFiller.fillNumericFieldPreservingAffix(targetNode, String(val), fieldConfig); 
            } catch (e) { 
              console.error("Error in field", key, e); 
              throw e; 
            }
          } else {
            WordFiller.fillField(targetNode, val, fieldConfig);
          }
        }
      }
      inputsToFill[key] = val;
    }

    DomSerializationVerifier.verify(originalDomClone, documentDom);

    if (fs.existsSync(outPath)) {
      fs.unlinkSync(outPath);
    }
    doc.save(outPath);
    console.log(`Saved output to ${outPath}`);
    return { inputsToFill };
  };

  const runVerifierCb = async (context, outPath, inputsToFill) => {
    const adapter = new CareerUpAdapter();
    const mapping = adapter.adapt(context, config.formProfileId, config.mappingProfileId);

    const originalBuffer = fs.readFileSync(inputPath);
    await OutputVerifier.verify(originalBuffer, outPath, mapping.template.expectedSha256, inputsToFill, mapping);
    console.log(`Output verification passed for ${scenario}`);
    return { passed: true };
  };

  try {
    const result = await orchestrateProfileGeneration(registry, config, startWordGenerationCb, runVerifierCb);
    console.log(`[Profile-Driven] Runner Result: manualCheck=${result.manualCheck}, humanReview=${result.humanReview}`);
  } catch (e) {
    console.error(`[Profile-Driven] Resolution failed:`, e.message);
    throw e;
  }
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

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
