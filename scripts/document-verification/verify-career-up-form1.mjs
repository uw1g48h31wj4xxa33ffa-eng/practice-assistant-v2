import fs from 'node:fs';
import path from 'node:path';
import { WordDocument } from './core/word-document.mjs';
import { VersionGuard } from './core/version-guard.mjs';
import { FieldLocator } from './core/field-locator.mjs';
import { WordFiller } from './core/word-filler.mjs';
import { OutputVerifier } from './core/output-verifier.mjs';
import { DomSerializationVerifier } from './core/dom-serialization-verifier.mjs';
import { careerUpR8Form1Mapping } from './config/career-up-r8-form1.mapping.mjs';

const inputPath = process.env.INPUT_PATH || '/Users/to/Documents/practice-assistant-input/001688046.docx';
const outputDir = process.env.OUTPUT_DIR || '/Users/to/Documents/practice-assistant-output/';

async function verify(scenario, outputsMap) {
  console.log(`\n=== Running scenario: ${scenario} ===`);
  const outputPath = path.join(outputDir, `001688046_${scenario}_test.docx`);

  VersionGuard.verifyPaths(inputPath, outputPath);

  const doc = WordDocument.fromFile(inputPath);
  const originalBuffer = doc.getOriginalBuffer();

  VersionGuard.verifyHash(originalBuffer, careerUpR8Form1Mapping.template.expectedSha256);
  VersionGuard.verifyVersionString(doc, careerUpR8Form1Mapping.template.version);

  const documentDom = doc.getDocumentDom();
  const originalDomClone = documentDom.cloneNode(true);

  const inputsToFill = {};

  if (outputsMap.owner) {
    const ownerField = careerUpR8Form1Mapping.fields.find(f => f.fieldId === 'business_owner_name');
    const targetCell = FieldLocator.locateAdjacentCell(documentDom, ownerField.labelText);
    WordFiller.fillField(targetCell, outputsMap.owner, { ...ownerField, status: 'confirmed' });
    inputsToFill.owner = outputsMap.owner;
  }

  if (outputsMap.address) {
    const addrField = careerUpR8Form1Mapping.fields.find(f => f.fieldId === 'business_address');
    const targetCell = FieldLocator.locateNextRowContinuationCell(documentDom, addrField.labelText);
    WordFiller.fillField(targetCell, outputsMap.address, { ...addrField, status: 'confirmed' });
    inputsToFill.address = outputsMap.address;
  }

  if (outputsMap.phone) {
    const phoneField = careerUpR8Form1Mapping.fields.find(f => f.fieldId === 'business_phone_number');
    const targetCell = FieldLocator.locateAdjacentCell(documentDom, phoneField.labelText);
    WordFiller.fillField(targetCell, outputsMap.phone, { ...phoneField, status: 'confirmed' });
    inputsToFill.phone = outputsMap.phone;
  }

  if (outputsMap.contact) {
    const contactField = careerUpR8Form1Mapping.fields.find(f => f.fieldId === 'business_contact_name');
    const targetCell = FieldLocator.locateAdjacentCell(documentDom, contactField.labelText);
    WordFiller.fillField(targetCell, outputsMap.contact, { ...contactField, status: 'confirmed' });
    inputsToFill.contact = outputsMap.contact;
  }

  if (outputsMap.employment_insurance) {
    const empField = careerUpR8Form1Mapping.fields.find(f => f.fieldId === 'employment_insurance_office_number');
    const result = FieldLocator.locateDistributedCells(documentDom, empField.labelText, empField.locator.pattern);
    WordFiller.fillDistributedField(result, outputsMap.employment_insurance, { ...empField, status: 'confirmed' });
    inputsToFill.employment_insurance = outputsMap.employment_insurance;
  }

  if (outputsMap.labor_insurance) {
    const laborField = careerUpR8Form1Mapping.fields.find(f => f.fieldId === 'labor_insurance_number');
    const result = FieldLocator.locateMultiRowDistributedCells(documentDom, laborField.labelText, laborField.locator);
    WordFiller.fillDistributedField(result, outputsMap.labor_insurance, { ...laborField, status: 'confirmed' });
    inputsToFill.labor_insurance = outputsMap.labor_insurance;
  }

  if (outputsMap.main_business) {
    const mainBusField = careerUpR8Form1Mapping.fields.find(f => f.fieldId === 'main_business');
    const targetCell = FieldLocator.locateAdjacentCell(documentDom, mainBusField.labelText);
    WordFiller.fillField(targetCell, outputsMap.main_business, { ...mainBusField, status: 'confirmed' });
    inputsToFill.main_business = outputsMap.main_business;
  }

  if (outputsMap.employee_count) {
    const empField = careerUpR8Form1Mapping.fields.find(f => f.fieldId === 'employee_count');
    const targetCell = FieldLocator.locateAdjacentCell(documentDom, empField.labelText);
    WordFiller.fillNumericFieldPreservingAffix(targetCell, outputsMap.employee_count, { ...empField, status: 'confirmed' });
    inputsToFill.employee_count = outputsMap.employee_count;
  }

  if (outputsMap.agent_name) {
    const agentField = careerUpR8Form1Mapping.fields.find(f => f.fieldId === 'agent_name');
    const targetCell = FieldLocator.locateAdjacentCell(documentDom, agentField.labelText);
    WordFiller.fillField(targetCell, outputsMap.agent_name, { ...agentField, status: 'confirmed' });
    inputsToFill.agent_name = outputsMap.agent_name;
  }

  DomSerializationVerifier.verify(originalDomClone, documentDom);

  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }
  doc.save(outputPath);
  console.log(`Saved output to ${outputPath}`);
  
  await OutputVerifier.verify(originalBuffer, outputPath, careerUpR8Form1Mapping.template.expectedSha256, inputsToFill);
  console.log(`Output verification passed for ${scenario}`);
}

async function run() {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  try {
    await verify('agent_name', { agent_name: '代理 太郎' });
    await verify('owner_address_phone_contact_employment_labor_main_business_employee_count_agent_name', { owner: '株式会社テスト', address: '東京都千代田区テスト1-2-3', phone: '090-1234-5678', contact: '山田 太郎', employment_insurance: '1234-567890-1', labor_insurance: '01123123456789', main_business: 'ソフトウェア開発業', employee_count: '25', agent_name: '代理 太郎' });
    console.log('\nAll scenarios completed successfully.');
  } catch (err) {
    console.error('\nVerification failed:', err.message);
    process.exit(1);
  }
}

run();
