import fs from 'node:fs';
import path from 'node:path';
import { VersionGuard } from './core/version-guard.mjs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const hatarakikataFieldsPath = path.join(__dirname, 'config', 'hatarakikata-r8-form1-fields.json');
const hatarakikataFields = JSON.parse(fs.readFileSync(hatarakikataFieldsPath, 'utf8'));

import { JsonProfileAdapter } from '../../src/profiles/resolution/json-profile-adapter.js';
import { ProfileRegistry } from '../../src/profiles/registry/profile-registry.js';
import { ProfileWordGenerator } from '../../src/lib/document-generation/profile-word-generator.js';

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

  const startWordGenerationCb = ProfileWordGenerator.createStartWordGenerationCallback(inputPath);
  const runVerifierCb = ProfileWordGenerator.createRunVerifierCallback(inputPath);

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
