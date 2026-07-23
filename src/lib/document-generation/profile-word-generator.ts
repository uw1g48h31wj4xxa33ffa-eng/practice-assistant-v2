/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'node:fs';
import { WordDocument } from '../../../scripts/document-verification/core/word-document.mjs';
import { VersionGuard } from '../../../scripts/document-verification/core/version-guard.mjs';
import { FieldLocator } from '../../../scripts/document-verification/core/field-locator.mjs';
import { WordFiller } from '../../../scripts/document-verification/core/word-filler.mjs';
import { ArrayFiller } from '../../../scripts/document-verification/core/array-filler.mjs';
import { OutputVerifier } from '../../../scripts/document-verification/core/output-verifier.mjs';
import { DomSerializationVerifier } from '../../../scripts/document-verification/core/dom-serialization-verifier.mjs';
import { CareerUpAdapter } from '../../profiles/resolution/adapter';
import { ExecutionContext } from '../../profiles/resolution/types';
import { SdtCheckboxLocator } from '../../../scripts/document-verification/core/sdt-checkbox-locator.mjs';
import { SdtCheckboxFiller } from '../../../scripts/document-verification/core/sdt-checkbox-filler.mjs';

export class ProfileWordGenerator {
  static createStartWordGenerationCallback(inputPath: string, expectedSha256?: string) {
    return async (context: ExecutionContext, inputData: Record<string, unknown>, outPath: string) => {
      const formProfileId = Object.keys(context.resolvedProfiles).find(k => {
        const res = context.resolvedProfiles[k];
        return res && res.ok && res.profile.profileType === 'form';
      });
      const mappingProfileId = Object.keys(context.resolvedProfiles).find(k => {
        const res = context.resolvedProfiles[k];
        return res && res.ok && res.profile.profileType === 'mapping';
      });
      
      const adapter = new CareerUpAdapter();
      const mapping = adapter.adapt(
        context, 
        formProfileId || '',
        mappingProfileId || ''
      );

      const targetSha256 = expectedSha256 || mapping.template.expectedSha256;

      const doc = WordDocument.fromFile(inputPath);
      const originalBuffer = doc.getOriginalBuffer();

      VersionGuard.verifyHash(originalBuffer, targetSha256);

      const documentDom: any = doc.getDocumentDom();
      const originalDomClone: any = documentDom.cloneNode(true);

      const inputsToFill: Record<string, unknown> = {};

      for (const [key, val] of Object.entries(inputData)) {
        const f = mapping.fields.find((field: any) => field.fieldId === key);
        if (!f) {
          console.warn(`Field ${key} not found in mapping`);
          continue;
        }
        const fieldConfig: any = { ...f, status: 'confirmed' };
        
        if (fieldConfig.inputMode === 'sdt-checkbox') {
          const groupInfo = SdtCheckboxLocator.locateGroup(documentDom, fieldConfig.locator, fieldConfig.selection);
          SdtCheckboxFiller.fillGroup(groupInfo, val, fieldConfig.selection, 'confirmed');
        } else if (fieldConfig.inputMode === 'fixed-row-table') {
          ArrayFiller.fillFixedRowTable(documentDom, val, fieldConfig);
        } else {
          let targetNode: any;
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
          } else if (fieldConfig.locator.type === 'next-row-continuation-cell') {
            const origCell = FieldLocator.locateNextRowContinuationCell(originalDomClone, fieldConfig.labelText);
            const origCells = Array.from(originalDomClone.getElementsByTagName('w:tc'));
            const origIndex = origCells.indexOf(origCell);
            targetNode = documentDom.getElementsByTagName('w:tc')[origIndex];
          } else if (fieldConfig.locator.type === 'same-cell') {
            const origCell = FieldLocator.locateSameCellByExactText(originalDomClone, fieldConfig.labelText, fieldConfig.locator);
            const origCells = Array.from(originalDomClone.getElementsByTagName('w:tc'));
            const origIndex = origCells.indexOf(origCell);
            targetNode = documentDom.getElementsByTagName('w:tc')[origIndex];
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
            } else if (fieldConfig.inputMode === 'multiline-text') {
              WordFiller.fillMultilineText(targetNode, String(val), fieldConfig);
            } else {
              WordFiller.fillField(targetNode, val, fieldConfig);
            }
          }
        }
        inputsToFill[key] = val;
      }

      DomSerializationVerifier.verify(originalDomClone, documentDom);
      console.log('[Profile-Driven] Dom serialization passed');

      if (fs.existsSync(outPath)) {
        fs.unlinkSync(outPath);
      }
      doc.save(outPath);
      console.log(`Saved output to ${outPath}`);
      return { inputsToFill };
    };
  }

  static createRunVerifierCallback(inputPath: string, expectedSha256?: string) {
    return async (context: ExecutionContext, outPath: string, inputsToFill: Record<string, unknown>) => {
      const formProfileId = Object.keys(context.resolvedProfiles).find(k => {
        const res = context.resolvedProfiles[k];
        return res && res.ok && res.profile.profileType === 'form';
      });
      const mappingProfileId = Object.keys(context.resolvedProfiles).find(k => {
        const res = context.resolvedProfiles[k];
        return res && res.ok && res.profile.profileType === 'mapping';
      });

      const adapter = new CareerUpAdapter();
      const mapping = adapter.adapt(
        context,
        formProfileId || '',
        mappingProfileId || ''
      );

      const originalBuffer = fs.readFileSync(inputPath);
      const targetSha256 = expectedSha256 || mapping.template.expectedSha256;
      await OutputVerifier.verify(originalBuffer, outPath, targetSha256, inputsToFill, mapping as any);
      console.log(`Output verification passed`);
      return { passed: true };
    };
  }
}
