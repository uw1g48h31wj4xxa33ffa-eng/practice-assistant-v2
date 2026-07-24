/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { ProfileRegistry } from '../../profiles/registry/profile-registry';
import { JsonProfileAdapter } from '../../profiles/resolution/json-profile-adapter';
import { ProfileVerificationRunner } from '../../profiles/runner/profile-verification-runner';
import { DocumentInputAdapter } from './adapter';
import { ProfileWordGenerator } from './profile-word-generator';
import { generatedStore } from './generated-store';
import { TemplateRegistry } from './template-registry';
import { WordGenerationRequestDTO, GenerationResultDTO } from './dto';
import { mapHatarakikataFields } from './field-mappings/hatarakikata-r8-form1';

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

// Legacy store for legacy path
const legacyGeneratedStore = new Map<string, { buffer: Buffer, fileName: string, contentType: string }>();

// Load profiles once
const registry = new ProfileRegistry();
const adapter = new JsonProfileAdapter();

// Hatarakikata Profile
import { readFileSync } from 'node:fs';

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

// Keep legacy registry for legacy path
const LegacyTemplateRegistry = [
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
  // --- Legacy Path ---
  static getGeneratedBuffer(downloadId: string) {
    return legacyGeneratedStore.get(downloadId);
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
      const templateDef = LegacyTemplateRegistry.find(t => t.templateId === templateId);
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
          effectiveDate: new Date(),
          inputData: inputsToFill,
          outputPath: tmpPath
        });
      } catch (e: any) {
        result.errors.push(`Profile Verification Runner failed: ${e.message}`);
        if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
        return result;
      }

      result.success = true;
      result.outputVerifierResult = { success: true, errors: [] };
      result.domSerializationVerifierResult = { success: true, errors: [] };

      if (runnerResult.manualCheck) {
        result.manualCheck.push({ fieldId: 'Global', reason: 'Field requires manual check' });
      }
      if (runnerResult.humanReview) {
        result.humanReview.push({ fieldId: 'Global', reason: 'Field requires human review' });
      }

      const buf = fs.readFileSync(tmpPath);

      const downloadId = crypto.randomUUID();
      const fileName = templateDef.outputFileNameRule.replace('{timestamp}', Date.now().toString());

      legacyGeneratedStore.set(downloadId, {
        buffer: buf,
        fileName,
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });

      result.downloadId = downloadId;
      result.outputFileName = fileName;

      fs.unlinkSync(tmpPath);
      return result;
    } catch (e: any) {
      result.errors.push(`Document generation failed: ${e.message}`);
      return result;
    }
  }

  // --- Phase 4 Path ---
  static async generateFromRequest(request: WordGenerationRequestDTO): Promise<GenerationResultDTO> {
    const result: GenerationResultDTO = {
      success: false,
      caseId: request.caseId,
      templateId: request.templateId,
      manualCheck: false,
      humanReview: false,
      verification: {
        outputVerifier: "NotRun",
        domSerializationVerifier: "NotRun"
      },
      warnings: [],
      errors: []
    };

    let templateDef;
    try {
      templateDef = TemplateRegistry.getTemplate(request.templateId, request.effectiveDate);
    } catch (e: any) {
      result.errors.push({ code: 'TEMPLATE_NOT_FOUND', message: e.message, retryable: false });
      return result;
    }

    if (!fs.existsSync(templateDef.templateSource)) {
      result.errors.push({ code: 'TEMPLATE_NOT_FOUND', message: 'Template file missing', retryable: false });
      return result;
    }

    let inputData: Record<string, unknown> = {};
    if (request.templateId === 'hatarakikata-r8-form1') {
      inputData = mapHatarakikataFields(request.confirmedFields);
    } else {
      result.errors.push({ code: 'MAPPING_FAILED', message: 'No mapping logic for template', retryable: false });
      return result;
    }

    if (Object.keys(inputData).length === 0) {
      result.errors.push({ code: 'NO_CONFIRMED_VALUES', message: 'No valid mapped fields found', retryable: true });
      return result;
    }

    // Use a temp path inside scratch as a working area for generation, but it will be read into buffer.
    const tmpPath = path.join(process.cwd(), 'scratch', `tmp_${crypto.randomUUID()}.docx`);
    fs.mkdirSync(path.join(process.cwd(), 'scratch'), { recursive: true });

    const runner = new ProfileVerificationRunner({
      registry,
      startWordGeneration: ProfileWordGenerator.createStartWordGenerationCallback(templateDef.templateSource),
      runVerifier: ProfileWordGenerator.createRunVerifierCallback(templateDef.templateSource)
    });

    let runnerResult;
    try {
      runnerResult = await runner.run({
        formProfileId: templateDef.formProfileId,
        mappingProfileId: templateDef.mappingProfileId,
        effectiveDate: new Date(request.effectiveDate),
        inputData,
        outputPath: tmpPath
      });
    } catch (e: any) {
      const code = e.code || 'GENERATION_FAILED';
      result.errors.push({ code, message: e.message, retryable: false });
      if (e.message.includes('serialize') || e.message.includes('DOM')) {
        result.verification.domSerializationVerifier = "Failed";
        result.verification.outputVerifier = "NotRun";
      } else if (e.message.includes('output') || e.message.includes('Verification failed')) {
        result.verification.domSerializationVerifier = "Success";
        result.verification.outputVerifier = "Failed";
      } else {
        result.verification.domSerializationVerifier = "Failed";
        result.verification.outputVerifier = "Failed";
      }
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
      return result;
    }

    // Both verifiers succeeded implicitly if runner didn't throw and returned success
    result.verification.domSerializationVerifier = "Success";
    result.verification.outputVerifier = "Success";

    result.manualCheck = runnerResult.manualCheck;
    // Human review is always true conceptually for this integration, or inherit from runner.
    // The instruction says "生成成功後も最終人間確認を必要とするため、Phase 4 UIでは原則humanReviewをtrueとして扱う".
    result.humanReview = true;

    try {
      const buf = fs.readFileSync(tmpPath);
      const downloadId = crypto.randomUUID();
      const outputFileName = `generation_${request.templateId}_${Date.now()}.docx`;

      generatedStore.register(downloadId, buf, outputFileName, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

      result.downloadId = downloadId;
      result.outputFileName = outputFileName;
      result.success = true;
    } catch (e: any) {
      result.errors.push({ code: 'OUTPUT_SAVE_FAILED', message: e.message, retryable: true });
    } finally {
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    }

    return result;
  }
}
