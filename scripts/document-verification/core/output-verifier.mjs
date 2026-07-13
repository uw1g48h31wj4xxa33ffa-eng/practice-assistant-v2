import fs from 'node:fs';
import PizZip from 'pizzip';
import { VersionGuard } from './version-guard.mjs';

export class OutputVerifier {
  static async verify(originalBuffer, outputPath, expectedSha256, inputs) {
    // Verify Original Hash unchanged
    VersionGuard.verifyHash(originalBuffer, expectedSha256);

    if (!fs.existsSync(outputPath)) {
      throw new Error(`Output file not found: ${outputPath}`);
    }

    const outputBuffer = fs.readFileSync(outputPath);
    let zip;
    try {
      zip = new PizZip(outputBuffer);
    } catch (e) {
      throw new Error(`Output file is not a valid ZIP: ${e.message}`);
    }

    const requiredFiles = ['word/document.xml', '[Content_Types].xml', '_rels/.rels', 'word/_rels/document.xml.rels'];
    for (const file of requiredFiles) {
      if (!zip.file(file)) {
        throw new Error(`Missing required file in ZIP: ${file}`);
      }
    }

    const documentXmlStr = zip.file('word/document.xml').asText();

    // We parse the DOM again from the output
    const { DOMParser } = await import('@xmldom/xmldom');
    const parser = new DOMParser();
    const docDom = parser.parseFromString(documentXmlStr, 'text/xml');
    const { FieldLocator } = await import('./field-locator.mjs');
    const { careerUpR8Form1Mapping } = await import('../config/career-up-r8-form1.mapping.mjs');

    for (const [key, value] of Object.entries(inputs)) {
      if (!value) continue;
      const escapedValue = value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const count = documentXmlStr.split(escapedValue).length - 1;
      if (count !== 1) {
        throw new Error(`Input value "${value}" (${key}) appears ${count} times in whole document, expected 1.`);
      }

      // Verify specific cell
      if (key === 'address') {
         const addrField = careerUpR8Form1Mapping.fields.find(f => f.fieldId === 'business_address');
         const targetCell = FieldLocator.locateNextRowContinuationCell(docDom, addrField.labelText);
         const cellText = FieldLocator.getCellText(targetCell);
         if (!cellText.includes(value)) {
           throw new Error(`Address cell does not contain the address value!`);
         }

         // Verify visibility and no del/move
         const runs = targetCell.getElementsByTagName('w:r');
         for (let r = 0; r < runs.length; r++) {
            const runText = FieldLocator.getCellText({ getElementsByTagName: (tag) => tag === 'w:t' ? runs[r].getElementsByTagName('w:t') : (tag === 'w:r' ? [runs[r]] : []) });
            if (runText.includes(value)) {
               const rPr = runs[r].getElementsByTagName('w:rPr')[0];
               if (rPr) {
                 if (rPr.getElementsByTagName('w:vanish').length > 0 || rPr.getElementsByTagName('w:webHidden').length > 0) {
                   throw new Error(`Address run has hidden attribute!`);
                 }
               }
               // Check ancestors for del/move
               let parent = runs[r].parentNode;
               while (parent) {
                 if (parent.nodeName === 'w:del' || parent.nodeName === 'w:moveFrom') {
                   throw new Error(`Address run is inside deleted/moved node!`);
                 }
                 parent = parent.parentNode;
               }
            }
         }

         // Check that the postal code cell doesn't have the address
         const labelMatches = FieldLocator.findCellByExactText(docDom, addrField.labelText);
         const postalCell = labelMatches[0].cells[labelMatches[0].cellIndex + 1];
         const postalText = FieldLocator.getCellText(postalCell);
         if (postalText.includes(value)) {
            throw new Error(`Postal cell contains the address value!`);
         }
      } else if (key === 'owner') {
         const ownerField = careerUpR8Form1Mapping.fields.find(f => f.fieldId === 'business_owner_name');
         const targetCell = FieldLocator.locateAdjacentCell(docDom, ownerField.labelText);
         const cellText = FieldLocator.getCellText(targetCell);
         if (!cellText.includes(value)) {
           throw new Error(`Owner cell does not contain the owner value!`);
         }
      }
    }

    // Verify other required strings
    if (!documentXmlStr.includes('〒')) {
      throw new Error('Postal code string (〒) is not preserved.');
    }
    if (!documentXmlStr.includes('val="dotted"')) {
      throw new Error('dotted border is not preserved.');
    }
    if (!documentXmlStr.includes('w:vMerge')) {
      throw new Error('vMerge is not preserved.');
    }
    if (!documentXmlStr.includes('w:gridSpan')) {
      throw new Error('gridSpan is not preserved.');
    }
  }
}
