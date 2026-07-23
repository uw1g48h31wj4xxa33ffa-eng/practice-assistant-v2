import fs from 'node:fs';
import path from 'node:path';
import { WordDocument } from './core/word-document.mjs';
import { VersionGuard } from './core/version-guard.mjs';
import { FieldLocator } from './core/field-locator.mjs';
import { WordFiller } from './core/word-filler.mjs';
import { OutputVerifier } from './core/output-verifier.mjs';
import { DomSerializationVerifier } from './core/dom-serialization-verifier.mjs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const careerUpFieldsPath = path.join(__dirname, 'config', 'career-up-r8-form1-fields.json');
const careerUpFields = JSON.parse(fs.readFileSync(careerUpFieldsPath, 'utf8'));

import { JsonProfileAdapter } from '../../src/profiles/resolution/json-profile-adapter.js';
import { ProfileRegistry } from '../../src/profiles/registry/profile-registry.js';
import { CareerUpAdapter } from '../../src/profiles/resolution/adapter.js';

const inputPath = process.env.INPUT_PATH || '/Users/to/Documents/practice-assistant-input/001688046.docx';
const outputDir = process.env.OUTPUT_DIR || '/Users/to/Documents/practice-assistant-output/';

function setupRegistry() {
  const registry = new ProfileRegistry();
  const adapter = new JsonProfileAdapter();
  const { formProfile, mappingProfile } = adapter.adapt(careerUpFields);
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
  const outputPath = path.join(outputDir, `001688046_${scenario}_test.docx`);

  VersionGuard.verifyPaths(inputPath, outputPath);

  const registry = setupRegistry();
  const config = {
    formProfileId: 'career-up-r8-form1',
    mappingProfileId: 'career-up-map1',
    effectiveDate: new Date('2026-06-01T00:00:00Z'),
    inputData: outputsMap,
    outputPath: outputPath
  };

  const startWordGenerationCb = async (context, inputData, outPath) => {
    const adapter = new CareerUpAdapter();
    const mapping = adapter.adapt(context, config.formProfileId, config.mappingProfileId);

    const doc = WordDocument.fromFile(inputPath);
    const originalBuffer = doc.getOriginalBuffer();

    VersionGuard.verifyHash(originalBuffer, mapping.template.expectedSha256);
    VersionGuard.verifyVersionString(doc, mapping.template.version);

    const documentDom = doc.getDocumentDom();
    const originalDomClone = documentDom.cloneNode(true);

    const inputsToFill = {};

    if (inputData.owner) {
      const ownerField = mapping.fields.find(f => f.fieldId === 'business_owner_name');
      const targetCell = FieldLocator.locateAdjacentCell(documentDom, ownerField.labelText);
      WordFiller.fillField(targetCell, inputData.owner, { ...ownerField, status: 'confirmed' });
      inputsToFill.owner = inputData.owner;
    }

    if (inputData.address) {
      const addrField = mapping.fields.find(f => f.fieldId === 'business_address');
      const targetCell = FieldLocator.locateNextRowContinuationCell(documentDom, addrField.labelText);
      WordFiller.fillField(targetCell, inputData.address, { ...addrField, status: 'confirmed' });
      inputsToFill.address = inputData.address;
    }

    if (inputData.phone) {
      const phoneField = mapping.fields.find(f => f.fieldId === 'business_phone_number');
      const targetCell = FieldLocator.locateAdjacentCell(documentDom, phoneField.labelText);
      WordFiller.fillField(targetCell, inputData.phone, { ...phoneField, status: 'confirmed' });
      inputsToFill.phone = inputData.phone;
    }

    if (inputData.contact) {
      const contactField = mapping.fields.find(f => f.fieldId === 'business_contact_name');
      const targetCell = FieldLocator.locateAdjacentCell(documentDom, contactField.labelText);
      WordFiller.fillField(targetCell, inputData.contact, { ...contactField, status: 'confirmed' });
      inputsToFill.contact = inputData.contact;
    }

    if (inputData.employment_insurance_office_number) {
      const empField = mapping.fields.find(f => f.fieldId === 'employment_insurance_office_number');
      const result = FieldLocator.locateDistributedCells(documentDom, empField.labelText, empField.locator.pattern);
      WordFiller.fillDistributedField(result, inputData.employment_insurance_office_number, { ...empField, status: 'confirmed' });
      inputsToFill.employment_insurance_office_number = inputData.employment_insurance_office_number;
    }

    if (inputData.labor_insurance_number) {
      const laborField = mapping.fields.find(f => f.fieldId === 'labor_insurance_number');
      const result = FieldLocator.locateMultiRowDistributedCells(documentDom, laborField.labelText, laborField.locator);
      WordFiller.fillDistributedField(result, inputData.labor_insurance_number, { ...laborField, status: 'confirmed' });
      inputsToFill.labor_insurance_number = inputData.labor_insurance_number;
    }

    if (inputData.main_business) {
      const mainBusField = mapping.fields.find(f => f.fieldId === 'main_business');
      const targetCell = FieldLocator.locateAdjacentCell(documentDom, mainBusField.labelText);
      WordFiller.fillField(targetCell, inputData.main_business, { ...mainBusField, status: 'confirmed' });
      inputsToFill.main_business = inputData.main_business;
    }

    if (inputData.employee_count) {
      const empField = mapping.fields.find(f => f.fieldId === 'employee_count');
      const targetCell = FieldLocator.locateAdjacentCell(documentDom, empField.labelText);
      WordFiller.fillNumericFieldPreservingAffix(targetCell, inputData.employee_count, { ...empField, status: 'confirmed' });
      inputsToFill.employee_count = inputData.employee_count;
    }

    if (inputData.agent_name) {
      const agentField = mapping.fields.find(f => f.fieldId === 'agent_name');
      const targetCell = FieldLocator.locateAdjacentCell(documentDom, agentField.labelText);
      WordFiller.fillField(targetCell, inputData.agent_name, { ...agentField, status: 'confirmed' });
      inputsToFill.agent_name = inputData.agent_name;
    }

    if (inputData.agent_address) {
      const agentAddrField = mapping.fields.find(f => f.fieldId === 'agent_address');
      const targetCell = FieldLocator.locateNextRowContinuationCell(documentDom, agentAddrField.labelText);
      WordFiller.fillField(targetCell, inputData.agent_address, { ...agentAddrField, status: 'confirmed' });
      inputsToFill.agent_address = inputData.agent_address;
    }

    if (inputData.agent_phone) {
      const agentPhoneField = mapping.fields.find(f => f.fieldId === 'agent_phone_number');
      const targetCell = FieldLocator.locateAdjacentCell(documentDom, agentPhoneField.labelText);
      WordFiller.fillField(targetCell, inputData.agent_phone, { ...agentPhoneField, status: 'confirmed' });
      inputsToFill.agent_phone = inputData.agent_phone;
    }

    if (inputData.manager_name) {
      const f = mapping.fields.find(f => f.fieldId === 'manager_name');
      const origCell = FieldLocator.locateSameCellByExactText(originalDomClone, f.labelText, f.locator);
      const origIndex = Array.from(originalDomClone.getElementsByTagName('w:tc')).indexOf(origCell);
      const targetCell = documentDom.getElementsByTagName('w:tc')[origIndex];
      WordFiller.fillField(targetCell, inputData.manager_name, { ...f, status: 'confirmed' });
      inputsToFill.manager_name = inputData.manager_name;
    }

    if (inputData.manager_assigned_date) {
      const f = mapping.fields.find(f => f.fieldId === 'manager_assigned_date');
      const origCell = FieldLocator.locateSameCellByExactText(originalDomClone, f.labelText, f.locator);
      const origIndex = Array.from(originalDomClone.getElementsByTagName('w:tc')).indexOf(origCell);
      const targetCell = documentDom.getElementsByTagName('w:tc')[origIndex];
      WordFiller.fillField(targetCell, inputData.manager_assigned_date, { ...f, status: 'confirmed' });
      inputsToFill.manager_assigned_date = inputData.manager_assigned_date;
    }

    if (inputData.plan_start_date) {
      const f = mapping.fields.find(f => f.fieldId === 'plan_start_date');
      const origCell = FieldLocator.locateSameCellByExactText(originalDomClone, f.labelText, f.locator);
      const origIndex = Array.from(originalDomClone.getElementsByTagName('w:tc')).indexOf(origCell);
      const targetCell = documentDom.getElementsByTagName('w:tc')[origIndex];
      WordFiller.fillField(targetCell, inputData.plan_start_date, { ...f, status: 'confirmed' });
      inputsToFill.plan_start_date = inputData.plan_start_date;
    }

    if (inputData.plan_end_date) {
      const f = mapping.fields.find(f => f.fieldId === 'plan_end_date');
      const origCell = FieldLocator.locateSameCellByExactText(originalDomClone, f.labelText, f.locator);
      const origIndex = Array.from(originalDomClone.getElementsByTagName('w:tc')).indexOf(origCell);
      const targetCell = documentDom.getElementsByTagName('w:tc')[origIndex];
      WordFiller.fillField(targetCell, inputData.plan_end_date, { ...f, status: 'confirmed' });
      inputsToFill.plan_end_date = inputData.plan_end_date;
    }

    const sdtFields = mapping.fields.filter(f => f.inputMode === 'sdt-checkbox');
    for (const f of sdtFields) {
      if (inputData[f.fieldId]) {
        const { SdtCheckboxLocator } = await import('./core/sdt-checkbox-locator.mjs');
        const { SdtCheckboxFiller } = await import('./core/sdt-checkbox-filler.mjs');
        const groupInfo = SdtCheckboxLocator.locateGroup(documentDom, f.locator, f.selection);
        SdtCheckboxFiller.fillGroup(groupInfo, inputData[f.fieldId], f.selection, 'confirmed');
        inputsToFill[f.fieldId] = inputData[f.fieldId];
      }
    }

    DomSerializationVerifier.verify(originalDomClone, documentDom);
    console.log('[Profile CareerUp] Dom serialization passed');

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
    await OutputVerifier.verify(originalBuffer, outPath, mapping.template.expectedSha256, inputsToFill);
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
    await verify('agent_info', { agent_name: '代理 太郎', agent_address: '東京都新宿区1-1-1', agent_phone: '03-1234-5678' });
    await verify('owner_address_phone_contact_employment_labor_main_business_employee_count_agent_name', { owner: '株式会社テスト', address: '東京都千代田区テスト1-2-3', phone: '090-1234-5678', contact: '山田 太郎', employment_insurance_office_number: '1234-567890-1', labor_insurance_number: '01123123456789', main_business: 'ソフトウェア開発業', employee_count: '25', agent_name: '代理 太郎', agent_address: '大阪府大阪市北区1', agent_phone: '06-1111-2222' });

    // G2 new tests
    await verify('manager_name_only', { manager_name: '管理 花子' });
    await verify('assigned_date_only', { manager_assigned_date: '2026-04-01' });
    await verify('plan_period_only', { plan_start_date: '2026-04-01', plan_end_date: '2031-03-31' });
    await verify('g2_all_fields', { manager_name: '管理 花子', manager_assigned_date: '2026-04-01', plan_start_date: '2026-04-01', plan_end_date: '2031-03-31' });
    await verify('g2_full_suite', { owner: '株式会社テスト', address: '東京都千代田区テスト1-2-3', phone: '090-1234-5678', contact: '山田 太郎', employment_insurance_office_number: '1234-567890-1', labor_insurance_number: '01123123456789', main_business: 'ソフトウェア開発業', employee_count: '25', agent_name: '代理 太郎', agent_address: '大阪府大阪市北区1', agent_phone: '06-1111-2222', manager_name: '管理 花子', manager_assigned_date: '2026-04-01', plan_start_date: '2026-04-01', plan_end_date: '2031-03-31' });

    // G3 tests
    await verify('manager_role_checkbox', { career_up_manager_role_type: '役員でない' });
    await verify('full_with_manager_role_checkbox', { owner: '株式会社テスト', address: '東京都千代田区テスト1-2-3', phone: '090-1234-5678', contact: '山田 太郎', employment_insurance_office_number: '1234-567890-1', labor_insurance_number: '01123123456789', main_business: 'ソフトウェア開発業', employee_count: '25', agent_name: '代理 太郎', agent_address: '大阪府大阪市北区1', agent_phone: '06-1111-2222', manager_name: '管理 花子', manager_assigned_date: '2026-04-01', plan_start_date: '2026-04-01', plan_end_date: '2031-03-31', career_up_manager_role_type: '役員でない' });

    // G4 tests - single selection groups
    await verify('worker_consent_yes', { career_up_manager_role_type: '役員でない', worker_representative_consent: 'はい' });
    await verify('opinion_hearing_method_ア', { opinion_hearing_method: 'ア' });
    await verify('opinion_hearing_method_イ', { opinion_hearing_method: 'イ' });
    await verify('wage_increase_3pct', { wage_increase_rate: '3%以上4%未満' });

    // G5A tests - mapping expansion
    await verify('g5a_regularization_candidates', { regularization_candidates: ['fixed_term', 'dispatch'] });
    await verify('g5a_regularization_goals', { regularization_goals: ['conversion_to_regular', 'direct_employment_to_regular'] });
    await verify('g5a_disability_targets', { disability_regularization_targets: ['fixed_term_to_regular', 'indefinite_to_regular'] });
    await verify('g5a_all_new_fields', {
      regularization_candidates: ['fixed_term'],
      regularization_goals: ['conversion_to_regular'],
      disability_regularization_targets: ['fixed_term_to_indefinite']
    });

    // Level 1 Complete - All Fields Integrated
    await verify('level1_complete_test', {
      // General Info
      owner: '株式会社テストレベル１',
      address: '東京都千代田区テスト1-2-3',
      phone: '090-1234-5678',
      contact: '山田 太郎',
      employment_insurance_office_number: '1234-567890-1',
      labor_insurance_number: '01123123456789',
      main_business: 'ソフトウェア開発業',
      employee_count: '25',
      agent_name: '代理 太郎',
      agent_address: '大阪府大阪市北区1',
      agent_phone: '06-1111-2222',
      manager_name: '管理 花子',
      manager_assigned_date: '2026-04-01',
      plan_start_date: '2026-04-01',
      plan_end_date: '2031-03-31',

      // Existing SDTs
      career_up_manager_role_type: '役員でない',
      worker_representative_consent: 'はい',
      opinion_hearing_method: 'イ',
      wage_increase_rate: '4%以上5%未満',

      // G5A SDTs
      regularization_candidates: ['fixed_term', 'dispatch'],
      regularization_goals: ['direct_employment_to_regular'],
      disability_regularization_targets: ['indefinite_to_regular'],

      // G5B SDTs
      manager_duties: ['disseminate', 'consultation'],
      disability_regularization_candidates: ['fixed_term'],
      disability_regularization_actions: ['new_rules', 'interview'],
      wage_revision_target_category: ['employment_type', 'job_type'],
      wage_rules_revision_actions: ['create_rules'],
      wage_rules_commonization_actions: ['evaluation', 'check_wage'],
      bonus_retirement_new_systems: ['bonus', 'retirement'],
      bonus_retirement_actions: ['balance', 'apply'],
      social_insurance_actions: ['interview', 'ext_4h_base_5pct']
    });

    console.log('\nAll scenarios completed successfully.');
  } catch (err) {
    console.error('\nVerification failed:', err.message);
    process.exit(1);
  }
}

// Only run automatically if executed directly, not when imported for tests
if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
