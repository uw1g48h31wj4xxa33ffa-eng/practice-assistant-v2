/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { WordDocument } from '../../../scripts/document-verification/core/word-document.mjs';
import { FieldLocator } from '../../../scripts/document-verification/core/field-locator.mjs';
import { WordFiller } from '../../../scripts/document-verification/core/word-filler.mjs';
import { hatarakikataR8Form1Mapping } from '../../../scripts/document-verification/config/hatarakikata-r8-form1.mapping.mjs';
import { DocumentInputAdapter } from './adapter';

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

const TemplateRegistry = [
  {
    templateId: 'hatarakikata-r8-form1',
    displayName: '働き方改革推進支援助成金（業種別課題対応コース）支給申請書',
    templatePath: process.env.INPUT_PATH || '/Users/to/Documents/practice-assistant-input/001687895.docx',
    mapping: hatarakikataR8Form1Mapping,
    mappingId: (hatarakikataR8Form1Mapping as any).mappingId || 'hatarakikata-r8-form1',
    verifierId: 'hatarakikata-r8-form1',
    supportedTaskTypes: ['subsidy-delivery'],
    outputFileNameRule: '001687895_level4a_output_{timestamp}.docx',
    manualCheck: false,
    humanReview: true,
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
      
      result.mappingId = templateDef.mappingId;
      const inputPath = templateDef.templatePath;
      
      if (!fs.existsSync(inputPath)) {
        result.errors.push(`Input template not found at ${inputPath}`);
        return result;
      }

      const inputsToFill = DocumentInputAdapter.extractVerifiedInputs(caseData);
      
      const doc = WordDocument.fromFile(inputPath);
      const documentDom = doc.getDocumentDom();

      // For dom serialization verification
      const { XMLSerializer, DOMParser } = await import('@xmldom/xmldom');
      const parser = new DOMParser();
      const serializer = new XMLSerializer();
      const originalXmlString = serializer.serializeToString(documentDom);
      const originalDomForVerifier = parser.parseFromString(originalXmlString, 'text/xml');

      for (const [key, val] of Object.entries(inputsToFill)) {
        const f = templateDef.mapping.fields.find((field: any) => field.fieldId === key);
        if (!f) {
          result.skippedFields.push(key);
          continue;
        }
        
        const config = { ...f, status: 'confirmed' };
        
        try {
          if (config.inputMode === 'sdt-checkbox') {
            const { SdtCheckboxLocator } = await import('../../../scripts/document-verification/core/sdt-checkbox-locator.mjs');
            const { SdtCheckboxFiller } = await import('../../../scripts/document-verification/core/sdt-checkbox-filler.mjs');
            const groupInfo = SdtCheckboxLocator.locateGroup(documentDom, config.locator, config.selection);
            SdtCheckboxFiller.fillGroup(groupInfo, val, config.selection, 'confirmed');
          } else if (config.inputMode === 'fixed-row-table') {
            const { ArrayFiller } = await import('../../../scripts/document-verification/core/array-filler.mjs');
            ArrayFiller.fillFixedRowTable(documentDom, val, config);
          } else {
            let targetNode = null;
            if (config.locator.type === 'paragraph-exact-text') {
              targetNode = FieldLocator.locateParagraphByExactText(documentDom, config.labelText, config.locator);
            } else if (config.locator.type === 'adjacent-cell') {
              targetNode = FieldLocator.locateAdjacentCell(documentDom, config.labelText, config.locator);
            } else if (config.locator.type === 'distributed-cells' || config.locator.type === 'multi-row-distributed-cells') {
              let locatorRes;
              if (config.locator.type === 'distributed-cells') {
                locatorRes = FieldLocator.locateDistributedCells(documentDom, config.labelText, config.locator.pattern);
              } else {
                locatorRes = FieldLocator.locateMultiRowDistributedCells(documentDom, config.labelText, config.locator);
              }
              WordFiller.fillDistributedField(locatorRes, String(val), config);
            } else {
              throw new Error(`Unsupported locator type: ${config.locator.type}`);
            }

            if (targetNode) {
              if (config.inputMode === 'date-preserve-tokens') {
                WordFiller.fillDateFieldPreservingTokens(targetNode, String(val), config);
              } else if (config.inputMode === 'numeric-preserve-affix') {
                WordFiller.fillNumericFieldPreservingAffix(targetNode, String(val), config);
              } else if (config.inputMode === 'multiline-text') {
                WordFiller.fillMultilineText(targetNode, String(val), config);
              } else {
                WordFiller.fillField(targetNode, val, config);
              }
            }
          }
          result.generatedFields.push(key);
          if (config.manualCheck) result.manualCheck.push({ fieldId: key, reason: 'Field requires manual check' });
          if (config.humanReview) result.humanReview.push({ fieldId: key, reason: 'Field requires human review' });
        } catch (e: any) {
          result.skippedFields.push(key);
          result.warnings.push(`Failed to fill field ${key}: ${e.message}`);
        }
      }

      const serializedXml = serializer.serializeToString(documentDom);
      const zip = doc.getZip();
      zip.file('word/document.xml', serializedXml);
      const buf = zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });
      
      const tmpPath = path.join(process.cwd(), 'scratch', `tmp_${Date.now()}.docx`);
      fs.mkdirSync(path.join(process.cwd(), 'scratch'), { recursive: true });
      fs.writeFileSync(tmpPath, buf);

      // Verifiers
      const { OutputVerifier } = await import('../../../scripts/document-verification/core/output-verifier.mjs');
      const { DomSerializationVerifier } = await import('../../../scripts/document-verification/core/dom-serialization-verifier.mjs');
      
      const originalBuffer = fs.readFileSync(inputPath);
      const expectedSha256 = crypto.createHash('sha256').update(originalBuffer).digest('hex');

      try {
        await OutputVerifier.verify(originalBuffer, tmpPath, expectedSha256, inputsToFill, templateDef.mapping as any);
        result.outputVerifierResult.success = true;
      } catch (e: any) {
        result.outputVerifierResult.success = false;
        result.outputVerifierResult.errors.push(e.message);
      }

      try {
        const docDomToVerify = parser.parseFromString(serializedXml, 'text/xml');
        DomSerializationVerifier.verify(originalDomForVerifier, docDomToVerify);
        result.domSerializationVerifierResult.success = true;
      } catch (e: any) {
        result.domSerializationVerifierResult.success = false;
        result.domSerializationVerifierResult.errors.push(e.message);
      }
      
      // Cleanup temp file
      fs.unlinkSync(tmpPath);

      if (result.outputVerifierResult.success && result.domSerializationVerifierResult.success) {
         result.success = true;
         const downloadId = crypto.randomUUID();
         const fileName = templateDef.outputFileNameRule.replace('{timestamp}', Date.now().toString());
         
         generatedStore.set(downloadId, {
           buffer: buf,
           fileName,
           contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
         });
         
         result.downloadId = downloadId;
         result.outputFileName = fileName;
      } else {
         result.errors.push('Verification failed. See verifier results for details.');
      }

      return result;
    } catch (e: any) {
      result.errors.push(`Document generation failed: ${e.message}`);
      return result;
    }
  }
}
