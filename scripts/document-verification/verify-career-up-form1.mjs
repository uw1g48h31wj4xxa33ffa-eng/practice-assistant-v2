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

  DomSerializationVerifier.verify(originalDomClone, documentDom);

  if (fs.existsSync(outputPath)) {
    // If running verification multiple times, we might need to overwrite, 
    // but tests should check for "既存出力の無断上書き".
    // For this runner, we will overwrite to allow re-runs.
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
    await verify('contact', { contact: '山田 太郎' });
    await verify('owner_address_phone_contact', { owner: '株式会社テスト', address: '東京都千代田区テスト1-2-3', phone: '090-1234-5678', contact: '山田 太郎' });
    console.log('\nAll scenarios completed successfully.');
  } catch (err) {
    console.error('\nVerification failed:', err.message);
    process.exit(1);
  }
}

run();
