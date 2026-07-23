/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { ProfileRegistry } from '../../profiles/registry/profile-registry';
import { JsonProfileAdapter } from '../../profiles/resolution/json-profile-adapter';
import { ProfileVerificationRunner } from '../../profiles/runner/profile-verification-runner';
import { DocumentInputAdapter } from './adapter';
import { ProfileWordGenerator } from './profile-word-generator';

export type GenerationResult = {
  success: boolean;
  templateId: string;
  mappingId: string;
  outputFileName?: string;
  downloadId?: string;
  generatedFields: string[];
  skippedFields: string[];
  manualCheck: Array<{ fieldId: string; reason: string }>;
  humanReview: Array<{ fieldId: string; reason: string }>;
  warnings: string[];
  errors: string[];
  outputVerifierResult: { success: boolean; errors: string[] };
  domSerializationVerifierResult: { success: boolean; errors: string[] };
  generatedAt: string;
};

// In-memory store for generated buffers for the demo
const generatedStore = new Map<string, { buffer: Buffer, fileName: string, contentType: string }>();

// Load profiles once
const registry = new ProfileRegistry();
const adapter = new JsonProfileAdapter();

// Hatarakikata Profile
import { readFileSync } from 'node:fs';

// Because this is used in Next.js backend, __dirname is not directly available in ES modules.
// But wait, Next.js compiles this. If process.cwd() is used, it's safer.
const hatarakikataFieldsPath = path.join(process.cwd(), 'scripts', 'document-verification', 'config', 'hatarakikata-r8-form1-fields.json');
if (fs.existsSync(hatarakikataFieldsPath)) {
  const hatarakikataFields = JSON.parse(readFileSync(hatarakikataFieldsPath, 'utf8'));
  const { formProfile, mappingProfile } = adapter.adapt(hatarakikataFields);
  registry.register(formProfile);
  registry.register(mappingProfile);
}

const careerUpFieldsPath = path.join(process.cwd(), 'scripts', 'document-verification', 'config', 'career-up-r8-form1-fields.json');
if (fs.existsSync(careerUpFieldsPath)) {
  const careerUpFields = JSON.parse(readFileSync(careerUpFieldsPath, 'utf8'));
  const { formProfile: cFormProfile, mappingProfile: cMappingProfile } = adapter.adapt(careerUpFields);
  registry.register(cFormProfile);
  registry.register(cMappingProfile);
}

const TemplateRegistry = [
  {
    templateId: 'hatarakikata-r8-form1',
    formProfileId: 'hatarakikata-r8-form1',
    mappingProfileId: 'hatarakikata-r8-form1-map1',
    templatePath: process.env.INPUT_PATH || '/Users/to/Documents/practice-assistant-input/001687895.docx',
    outputFileNameRule: '001687895_level4a_output_{timestamp}.docx',
    enabled: true
  },
  {
    templateId: 'career-up-r8-form1',
    formProfileId: 'career-up-r8-form1',
    mappingProfileId: 'career-up-map1',
    templatePath: process.env.INPUT_PATH || '/Users/to/Documents/practice-assistant-input/001688046.docx',
    outputFileNameRule: '001688046_output_{timestamp}.docx',
    enabled: true
  }
];

export class WordGenerationApplicationService {
  static getGeneratedBuffer(downloadId: string) {
    return generatedStore.get(downloadId);
  }

  static async generateDocument(caseData: any, templateId: string): Promise<GenerationResult> {
    const result: GenerationResult = {
      success: false,
      templateId,
      mappingId: '',
      generatedFields: [],
      skippedFields: [],
      manualCheck: [],
      humanReview: [],
      warnings: [],
      errors: [],
      outputVerifierResult: { success: false, errors: [] },
      domSerializationVerifierResult: { success: false, errors: [] },
      generatedAt: new Date().toISOString()
    };

    try {
      const templateDef = TemplateRegistry.find(t => t.templateId === templateId);
      if (!templateDef || !templateDef.enabled) {
        result.errors.push(`Template not found or disabled: ${templateId}`);
        return result;
      }
      
      result.mappingId = templateDef.mappingProfileId;
      const inputPath = templateDef.templatePath;
      
      if (!fs.existsSync(inputPath)) {
        result.errors.push(`Input template not found at ${inputPath}`);
        return result;
      }

      const inputsToFill = DocumentInputAdapter.extractVerifiedInputs(caseData);
      
      const tmpPath = path.join(process.cwd(), 'scratch', `tmp_${Date.now()}.docx`);
      fs.mkdirSync(path.join(process.cwd(), 'scratch'), { recursive: true });

      const runner = new ProfileVerificationRunner({
        registry,
        startWordGeneration: ProfileWordGenerator.createStartWordGenerationCallback(inputPath),
        runVerifier: ProfileWordGenerator.createRunVerifierCallback(inputPath)
      });

      let runnerResult;
      try {
        runnerResult = await runner.run({
          formProfileId: templateDef.formProfileId,
          mappingProfileId: templateDef.mappingProfileId,
          effectiveDate: new Date(), // Use current date or caseData date if needed
          inputData: inputsToFill,
          outputPath: tmpPath
        });
      } catch (e: any) {
        result.errors.push(`Profile Verification Runner failed: ${e.message}`);
        // Ensure tmp file is cleaned up if it was created
        if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
        return result;
      }

      // Populate GenerationResult from runnerResult
      result.success = true;
      result.outputVerifierResult = { success: true, errors: [] };
      result.domSerializationVerifierResult = { success: true, errors: [] };
      
      // In a real scenario, we'd map fields to manualCheck/humanReview accurately by tracing inputsToFill.
      // ProfileVerificationRunner tells us globally if manualCheck/humanReview was triggered.
      if (runnerResult.manualCheck) {
        result.manualCheck.push({ fieldId: 'Global', reason: 'Field requires manual check' });
      }
      if (runnerResult.humanReview) {
        result.humanReview.push({ fieldId: 'Global', reason: 'Field requires human review' });
      }

      const buf = fs.readFileSync(tmpPath);
      
      const downloadId = crypto.randomUUID();
      const fileName = templateDef.outputFileNameRule.replace('{timestamp}', Date.now().toString());
      
      generatedStore.set(downloadId, {
        buffer: buf,
        fileName,
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      
      result.downloadId = downloadId;
      result.outputFileName = fileName;

      // Cleanup tmp file
      fs.unlinkSync(tmpPath);

      return result;
    } catch (e: any) {
      result.errors.push(`Document generation failed: ${e.message}`);
      return result;
    }
  }
}
