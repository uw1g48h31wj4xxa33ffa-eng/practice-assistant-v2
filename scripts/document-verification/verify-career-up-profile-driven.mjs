import fs from 'node:fs';
import path from 'node:path';
import { WordDocument } from './core/word-document.mjs';
import { VersionGuard } from './core/version-guard.mjs';
import { FieldLocator } from './core/field-locator.mjs';
import { WordFiller } from './core/word-filler.mjs';
import { OutputVerifier } from './core/output-verifier.mjs';
import { DomSerializationVerifier } from './core/dom-serialization-verifier.mjs';
import { careerUpR8Form1Mapping as legacyMapping } from './config/career-up-r8-form1.mapping.mjs';

// Profile-driven imports (will be executed via tsx)
import { ProfileRegistry } from '../../src/profiles/registry/profile-registry.js';
import { ProfileDrivenContextFactory } from '../../src/profiles/resolution/feature-activation.js';
import { CareerUpAdapter } from '../../src/profiles/resolution/adapter.js';
import assert from 'node:assert';

const inputPath = process.env.INPUT_PATH || '/Users/to/Documents/practice-assistant-input/001688046.docx';
const outputDir = process.env.OUTPUT_DIR || '/Users/to/Documents/practice-assistant-output/';

function setupRegistry() {
  const registry = new ProfileRegistry();

  registry.register({
    id: 'career-up-r8-form1',
    profileType: 'form',
    schemaVersion: '1.0',
    version: legacyMapping.template.version,
    status: 'active',
    effectiveFrom: '2026-01-01T00:00:00Z',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    formVersion: legacyMapping.template.version,
    templateReference: '001688046.docx',
    templateHash: legacyMapping.template.expectedSha256,
    mappingProfileId: 'career-up-map1'
  });

  registry.register({
    id: 'career-up-map1',
    profileType: 'mapping',
    schemaVersion: '1.0',
    version: '1.0',
    status: 'active',
    effectiveFrom: '2026-01-01T00:00:00Z',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    formProfileId: 'career-up-r8-form1',
    fieldDefinitions: {
      fields: legacyMapping.fields
    }
  });

  return registry;
}

function resolveCareerUpMapping() {
  const registry = setupRegistry();
  const factory = new ProfileDrivenContextFactory(registry);

  // Create explicitly with fixed effectiveDate (UTC)
  const ctx = factory.createContext({
    profileId: 'career-up-r8-form1',
    profileType: 'form',
    effectiveDate: new Date('2026-06-01T00:00:00Z')
  });

  const adapter = new CareerUpAdapter();
  const mapping = adapter.adapt(ctx, 'career-up-r8-form1', 'career-up-map1');

  // Strict compatibility check against legacy
  assert.strictEqual(mapping.template.id, legacyMapping.template.id || 'career-up-r8-form1');
  assert.strictEqual(mapping.template.version, legacyMapping.template.version);
  assert.strictEqual(mapping.template.expectedSha256, legacyMapping.template.expectedSha256);
  assert.deepStrictEqual(mapping.fields, legacyMapping.fields);

  return mapping;
}

export async function orchestrateProfileGeneration(resolveMapping, startWordGeneration, legacyFallback) {
  let mapping;
  try {
    // 1. Profile Driven Resolution
    mapping = await resolveMapping();
  } catch (e) {
    // DO NOT call legacyFallback here, to strictly eliminate automatic fallback.
    // Let the error propagate upwards.
    void legacyFallback; // Suppress unused warning
    throw e;
  }

  // 2. Proceed to Word Generation only if resolution succeeds
  await startWordGeneration(mapping);
}

async function verify(scenario, outputsMap) {
  console.log(`\n=== Running scenario: ${scenario} ===`);
  const outputPath = path.join(outputDir, `001688046_${scenario}_test.docx`);

  VersionGuard.verifyPaths(inputPath, outputPath);

  const resolveMappingCb = () => {
    const mapping = resolveCareerUpMapping();
    console.log(`[Profile-Driven] Resolved and verified compatibility successfully.`);
    return mapping;
  };

  const legacyFallbackCb = () => {
    console.warn(`[Profile-Driven] Legacy fallback invoked (Should not happen in Phase 2-C)`);
  };

  const startWordGenerationCb = async (mapping) => {
    const doc = WordDocument.fromFile(inputPath);
  const originalBuffer = doc.getOriginalBuffer();

  VersionGuard.verifyHash(originalBuffer, mapping.template.expectedSha256);
  VersionGuard.verifyVersionString(doc, mapping.template.version);

  const documentDom = doc.getDocumentDom();
  const originalDomClone = documentDom.cloneNode(true);

  const inputsToFill = {};

  if (outputsMap.owner) {
    const ownerField = mapping.fields.find(f => f.fieldId === 'business_owner_name');
    const targetCell = FieldLocator.locateAdjacentCell(documentDom, ownerField.labelText);
    WordFiller.fillField(targetCell, outputsMap.owner, { ...ownerField, status: 'confirmed' });
    inputsToFill.owner = outputsMap.owner;
  }

  if (outputsMap.address) {
    const addrField = mapping.fields.find(f => f.fieldId === 'business_address');
    const targetCell = FieldLocator.locateNextRowContinuationCell(documentDom, addrField.labelText);
    WordFiller.fillField(targetCell, outputsMap.address, { ...addrField, status: 'confirmed' });
    inputsToFill.address = outputsMap.address;
  }

  if (outputsMap.phone) {
    const phoneField = mapping.fields.find(f => f.fieldId === 'business_phone_number');
    const targetCell = FieldLocator.locateAdjacentCell(documentDom, phoneField.labelText);
    WordFiller.fillField(targetCell, outputsMap.phone, { ...phoneField, status: 'confirmed' });
    inputsToFill.phone = outputsMap.phone;
  }

  if (outputsMap.contact) {
    const contactField = mapping.fields.find(f => f.fieldId === 'business_contact_name');
    const targetCell = FieldLocator.locateAdjacentCell(documentDom, contactField.labelText);
    WordFiller.fillField(targetCell, outputsMap.contact, { ...contactField, status: 'confirmed' });
    inputsToFill.contact = outputsMap.contact;
  }

  if (outputsMap.employment_insurance_office_number) {
    const empField = mapping.fields.find(f => f.fieldId === 'employment_insurance_office_number');
    const result = FieldLocator.locateDistributedCells(documentDom, empField.labelText, empField.locator.pattern);
    WordFiller.fillDistributedField(result, outputsMap.employment_insurance_office_number, { ...empField, status: 'confirmed' });
    inputsToFill.employment_insurance_office_number = outputsMap.employment_insurance_office_number;
  }

  if (outputsMap.labor_insurance_number) {
    const laborField = mapping.fields.find(f => f.fieldId === 'labor_insurance_number');
    const result = FieldLocator.locateMultiRowDistributedCells(documentDom, laborField.labelText, laborField.locator);
    WordFiller.fillDistributedField(result, outputsMap.labor_insurance_number, { ...laborField, status: 'confirmed' });
    inputsToFill.labor_insurance_number = outputsMap.labor_insurance_number;
  }

  if (outputsMap.main_business) {
    const mainBusField = mapping.fields.find(f => f.fieldId === 'main_business');
    const targetCell = FieldLocator.locateAdjacentCell(documentDom, mainBusField.labelText);
    WordFiller.fillField(targetCell, outputsMap.main_business, { ...mainBusField, status: 'confirmed' });
    inputsToFill.main_business = outputsMap.main_business;
  }

  if (outputsMap.employee_count) {
    const empField = mapping.fields.find(f => f.fieldId === 'employee_count');
    const targetCell = FieldLocator.locateAdjacentCell(documentDom, empField.labelText);
    WordFiller.fillNumericFieldPreservingAffix(targetCell, outputsMap.employee_count, { ...empField, status: 'confirmed' });
    inputsToFill.employee_count = outputsMap.employee_count;
  }

  if (outputsMap.agent_name) {
    const agentField = mapping.fields.find(f => f.fieldId === 'agent_name');
    const targetCell = FieldLocator.locateAdjacentCell(documentDom, agentField.labelText);
    WordFiller.fillField(targetCell, outputsMap.agent_name, { ...agentField, status: 'confirmed' });
    inputsToFill.agent_name = outputsMap.agent_name;
  }

  if (outputsMap.agent_address) {
    const agentAddrField = mapping.fields.find(f => f.fieldId === 'agent_address');
    const targetCell = FieldLocator.locateNextRowContinuationCell(documentDom, agentAddrField.labelText);
    WordFiller.fillField(targetCell, outputsMap.agent_address, { ...agentAddrField, status: 'confirmed' });
    inputsToFill.agent_address = outputsMap.agent_address;
  }

  if (outputsMap.agent_phone) {
    const agentPhoneField = mapping.fields.find(f => f.fieldId === 'agent_phone_number');
    const targetCell = FieldLocator.locateAdjacentCell(documentDom, agentPhoneField.labelText);
    WordFiller.fillField(targetCell, outputsMap.agent_phone, { ...agentPhoneField, status: 'confirmed' });
    inputsToFill.agent_phone = outputsMap.agent_phone;
  }

  if (outputsMap.manager_name) {
    const f = mapping.fields.find(f => f.fieldId === 'manager_name');
    const origCell = FieldLocator.locateSameCellByExactText(originalDomClone, f.labelText, f.locator);
    const origIndex = Array.from(originalDomClone.getElementsByTagName('w:tc')).indexOf(origCell);
    const targetCell = documentDom.getElementsByTagName('w:tc')[origIndex];
    WordFiller.fillField(targetCell, outputsMap.manager_name, { ...f, status: 'confirmed' });
    inputsToFill.manager_name = outputsMap.manager_name;
  }

  if (outputsMap.manager_assigned_date) {
    const f = mapping.fields.find(f => f.fieldId === 'manager_assigned_date');
    const origCell = FieldLocator.locateSameCellByExactText(originalDomClone, f.labelText, f.locator);
    const origIndex = Array.from(originalDomClone.getElementsByTagName('w:tc')).indexOf(origCell);
    const targetCell = documentDom.getElementsByTagName('w:tc')[origIndex];
    WordFiller.fillField(targetCell, outputsMap.manager_assigned_date, { ...f, status: 'confirmed' });
    inputsToFill.manager_assigned_date = outputsMap.manager_assigned_date;
  }

  if (outputsMap.plan_start_date) {
    const f = mapping.fields.find(f => f.fieldId === 'plan_start_date');
    const origCell = FieldLocator.locateSameCellByExactText(originalDomClone, f.labelText, f.locator);
    const origIndex = Array.from(originalDomClone.getElementsByTagName('w:tc')).indexOf(origCell);
    const targetCell = documentDom.getElementsByTagName('w:tc')[origIndex];
    WordFiller.fillField(targetCell, outputsMap.plan_start_date, { ...f, status: 'confirmed' });
    inputsToFill.plan_start_date = outputsMap.plan_start_date;
  }

  if (outputsMap.plan_end_date) {
    const f = mapping.fields.find(f => f.fieldId === 'plan_end_date');
    const origCell = FieldLocator.locateSameCellByExactText(originalDomClone, f.labelText, f.locator);
    const origIndex = Array.from(originalDomClone.getElementsByTagName('w:tc')).indexOf(origCell);
    const targetCell = documentDom.getElementsByTagName('w:tc')[origIndex];
    WordFiller.fillField(targetCell, outputsMap.plan_end_date, { ...f, status: 'confirmed' });
    inputsToFill.plan_end_date = outputsMap.plan_end_date;
  }

  const sdtFields = mapping.fields.filter(f => f.inputMode === 'sdt-checkbox');
  for (const f of sdtFields) {
    if (outputsMap[f.fieldId]) {
      const { SdtCheckboxLocator } = await import('./core/sdt-checkbox-locator.mjs');
      const { SdtCheckboxFiller } = await import('./core/sdt-checkbox-filler.mjs');
      const groupInfo = SdtCheckboxLocator.locateGroup(documentDom, f.locator, f.selection);
      SdtCheckboxFiller.fillGroup(groupInfo, outputsMap[f.fieldId], f.selection, 'confirmed');
      inputsToFill[f.fieldId] = outputsMap[f.fieldId];
    }
  }

  DomSerializationVerifier.verify(originalDomClone, documentDom);

  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }
  doc.save(outputPath);
  console.log(`Saved output to ${outputPath}`);

  await OutputVerifier.verify(originalBuffer, outputPath, mapping.template.expectedSha256, inputsToFill);
  console.log(`Output verification passed for ${scenario}`);
  };

  try {
    await orchestrateProfileGeneration(resolveMappingCb, startWordGenerationCb, legacyFallbackCb);
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
