import fs from 'node:fs';
import PizZip from 'pizzip';
import { VersionGuard } from './version-guard.mjs';

async function verifySdtCheckboxField({ originalDom, outputDom, field, value, key }) {
  const { SdtCheckboxLocator } = await import('./sdt-checkbox-locator.mjs');

  // 原本DOMでグループとオプションを特定
  const origGroupInfo = SdtCheckboxLocator.locateGroup(originalDom, field.locator, field.selection);

  const origAllSdts = Array.from(originalDom.getElementsByTagName('w:sdt'));
  const outAllSdts = Array.from(outputDom.getElementsByTagName('w:sdt'));

  // 出力DOMにおける対象グループの情報を再構築する
  // (outputDomに対してlocateGroupを呼ぶと、チェック状態の変更でテキストが変わり特定できなくなるため、原本のインデックスでマッピングする)
  const groupInfo = {
    allGroupSdts: [],
    options: []
  };

  for (const sdt of origGroupInfo.allGroupSdts) {
    const idx = origAllSdts.indexOf(sdt);
    groupInfo.allGroupSdts.push(outAllSdts[idx]);
  }

  for (const origOpt of origGroupInfo.options) {
    const idx = origAllSdts.indexOf(origOpt.sdtNode);
    const outSdt = outAllSdts[idx];
    const cb = outSdt.getElementsByTagName('w14:checkbox')[0];
    const checkedNode = cb?.getElementsByTagName('w14:checked')[0];
    const checked = checkedNode ? checkedNode.getAttribute('w14:val') === '1' : false;

    groupInfo.options.push({
      value: origOpt.value,
      sdtNode: outSdt,
      checked
    });
  }

  // SDT数不変確認
  if (origGroupInfo.allGroupSdts.length !== groupInfo.allGroupSdts.length) {
    throw new Error(`SDT count changed in group for field "${key}"`);
  }

  // checkedState/uncheckedState維持確認（元の原本と同じ構造）
  for (let idx = 0; idx < origGroupInfo.allGroupSdts.length; idx++) {
    const origCb = origGroupInfo.allGroupSdts[idx].getElementsByTagName('w14:checkbox')[0];
    const outCb = groupInfo.allGroupSdts[idx].getElementsByTagName('w14:checkbox')[0];
    const origCS = origCb?.getElementsByTagName('w14:checkedState')[0]?.getAttribute('w14:val');
    const outCS = outCb?.getElementsByTagName('w14:checkedState')[0]?.getAttribute('w14:val');
    if (origCS !== outCS) throw new Error(`checkedState changed for SDT ${idx} in "${key}"`);
    const origUS = origCb?.getElementsByTagName('w14:uncheckedState')[0]?.getAttribute('w14:val');
    const outUS = outCb?.getElementsByTagName('w14:uncheckedState')[0]?.getAttribute('w14:val');
    if (origUS !== outUS) throw new Error(`uncheckedState changed for SDT ${idx} in "${key}"`);
  }

  // 選択値と checked 状態の一致確認
  if (field.selection.mode === 'single') {
    const selectedOption = groupInfo.options.find(opt => opt.value === value);
    if (!selectedOption) throw new Error(`Value "${value}" not found in options for "${key}"`);
    if (!selectedOption.checked) throw new Error(`Option "${value}" is not checked for "${key}"`);

    // clearUnselectedがtrueの場合、他のオプションは未選択であることを確認
    if (field.selection.clearUnselected) {
      const checkedCount = groupInfo.options.filter(opt => opt.checked).length;
      if (checkedCount !== 1) throw new Error(`Expected 1 checked, found ${checkedCount} for "${key}"`);
      const unselectedOptions = groupInfo.options.filter(opt => opt.value !== value);
      for (const opt of unselectedOptions) {
        if (opt.checked) throw new Error(`Option "${opt.value}" should not be checked for "${key}"`);
      }
    }

    // sdtContent表示文字の確認
    const checkedSdt = selectedOption.sdtNode;
    const checkbox = checkedSdt.getElementsByTagName('w14:checkbox')[0];
    const checkedState = checkbox.getElementsByTagName('w14:checkedState')[0];
    const expectedChar = String.fromCharCode(parseInt(checkedState.getAttribute('w14:val'), 16));
    const actualChar = checkedSdt.getElementsByTagName('w:t')[0]?.textContent;
    if (actualChar !== expectedChar) {
      throw new Error(`sdtContent display char mismatch for "${key}": expected "${expectedChar}" got "${actualChar}"`);
    }

    // Unselected elements display char sync check
    if (field.selection.clearUnselected) {
      const unselectedOptions = groupInfo.options.filter(opt => opt.value !== value);
      for (const opt of unselectedOptions) {
        const unselectedSdt = opt.sdtNode;
        const ucCheckbox = unselectedSdt.getElementsByTagName('w14:checkbox')[0];
        const uncheckedState = ucCheckbox.getElementsByTagName('w14:uncheckedState')[0];
        const ucExpectedChar = String.fromCharCode(parseInt(uncheckedState.getAttribute('w14:val'), 16));
        const ucActualChar = unselectedSdt.getElementsByTagName('w:t')[0]?.textContent;
        if (ucActualChar !== ucExpectedChar) {
          throw new Error(`sdtContent display char mismatch for unselected option in "${key}": expected "${ucExpectedChar}" got "${ucActualChar}"`);
        }
      }
    }

  } else if (field.selection.mode === 'multi') {
    const expectedValues = Array.isArray(value) ? value : [value];

    // check if all expectedValues are in options
    for (const v of expectedValues) {
      const opt = groupInfo.options.find(o => o.value === v);
      if (!opt) throw new Error(`Value "${v}" not found in options for "${key}"`);
    }

    const checkedCount = groupInfo.options.filter(opt => opt.checked).length;
    // Expected unique items count
    const uniqueExpectedCount = new Set(expectedValues).size;
    if (checkedCount !== uniqueExpectedCount) {
      throw new Error(`Expected ${uniqueExpectedCount} checked, found ${checkedCount} for "${key}"`);
    }
    for (const v of expectedValues) {
      const opt = groupInfo.options.find(o => o.value === v);
      if (!opt?.checked) throw new Error(`Option "${v}" is not checked for "${key}"`);

      // display char sync check for checked elements
      const checkedSdt = opt.sdtNode;
      const checkbox = checkedSdt.getElementsByTagName('w14:checkbox')[0];
      const checkedState = checkbox.getElementsByTagName('w14:checkedState')[0];
      const expectedChar = String.fromCharCode(parseInt(checkedState.getAttribute('w14:val'), 16));
      const actualChar = checkedSdt.getElementsByTagName('w:t')[0]?.textContent;
      if (actualChar !== expectedChar) {
        throw new Error(`sdtContent display char mismatch for checked option in "${key}": expected "${expectedChar}" got "${actualChar}"`);
      }
    }

    if (field.selection.clearUnselected) {
      const unselectedOptions = groupInfo.options.filter(opt => !expectedValues.includes(opt.value));
      for (const opt of unselectedOptions) {
        if (opt.checked) throw new Error(`Option "${opt.value}" should not be checked for "${key}"`);
        // display char sync check for unselected elements
        const unselectedSdt = opt.sdtNode;
        const ucCheckbox = unselectedSdt.getElementsByTagName('w14:checkbox')[0];
        const uncheckedState = ucCheckbox.getElementsByTagName('w14:uncheckedState')[0];
        const ucExpectedChar = String.fromCharCode(parseInt(uncheckedState.getAttribute('w14:val'), 16));
        const ucActualChar = unselectedSdt.getElementsByTagName('w:t')[0]?.textContent;
        if (ucActualChar !== ucExpectedChar) {
          throw new Error(`sdtContent display char mismatch for unselected option in "${key}": expected "${ucExpectedChar}" got "${ucActualChar}"`);
        }
      }
    }
  }
}

async function verifyTextField({ originalDom, outputDom, documentXmlStr, field, value, key }) {
  const { FieldLocator } = await import('./field-locator.mjs');

  const escapedValue = value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const count = documentXmlStr.split(escapedValue).length - 1;
  if (count !== 1) {
    throw new Error(`Input value "${value}" (${key}) appears ${count} times in whole document, expected 1.`);
  }

  let targetCell;
  if (field.locator.type === 'adjacent-cell') {
     targetCell = FieldLocator.locateAdjacentCell(outputDom, field.labelText);
  } else if (field.locator.type === 'next-row-continuation-cell') {
     targetCell = FieldLocator.locateNextRowContinuationCell(outputDom, field.labelText);
  } else if (field.locator.type === 'same-cell') {
     targetCell = FieldLocator.locateSameCellByExactText(outputDom, field.labelText, field.locator);
  } else {
     throw new Error(`Unsupported locator type for text verification: ${field.locator.type}`);
  }

  const cellText = FieldLocator.getCellText(targetCell);
  if (!cellText.includes(value)) {
    throw new Error(`${key} cell does not contain the value!`);
  }

  const runs = targetCell.getElementsByTagName('w:r');
  for (let r = 0; r < runs.length; r++) {
    const runText = Array.from(runs[r].getElementsByTagName('w:t')).map(t => t.textContent).join('');
    if (runText.includes(value)) {
       const rPr = runs[r].getElementsByTagName('w:rPr')[0];
       if (rPr) {
         if (rPr.getElementsByTagName('w:vanish').length > 0 || rPr.getElementsByTagName('w:webHidden').length > 0) {
           throw new Error(`${key} run has hidden attribute!`);
         }
       }
       let parent = runs[r].parentNode;
       while (parent) {
         if (parent.nodeName === 'w:del' || parent.nodeName === 'w:moveFrom') {
           throw new Error(`${key} run is inside deleted/moved node!`);
         }
         parent = parent.parentNode;
       }
    }
  }
}

async function verifyPrefixTextField(docDom, f, value, origDom) {
  const { FieldLocator } = await import('./field-locator.mjs');
  const origCell = FieldLocator.locateSameCellByExactText(origDom, f.labelText, f.locator);
  const origCells = Array.from(origDom.getElementsByTagName('w:tc'));
  const origIndex = origCells.indexOf(origCell);
  const targetCell = docDom.getElementsByTagName('w:tc')[origIndex];
  const cellText = FieldLocator.getCellText(targetCell);
  if (!cellText.includes(value)) throw new Error(`Cell does not contain the value!`);
  if (!cellText.startsWith(f.preserve.prefixText)) throw new Error(`prefix not preserved!`);
}


async function verifyNumericField(docDom, origDom, field, value) {
  const { FieldLocator } = await import('./field-locator.mjs');
  const targetCell = FieldLocator.locateAdjacentCell(docDom, field.labelText);
  const cellText = FieldLocator.getCellText(targetCell);

  if (field.verification?.preserveAffix && field.affix) {
    const expectedText = `${value}${field.affix.suffixText || ''}`;
    if (cellText !== expectedText) {
      if (!cellText.includes(expectedText)) {
        throw new Error(`Cell text "${cellText}" does not contain expected text "${expectedText}"`);
      }
    }

    const ps = targetCell.getElementsByTagName('w:p');
    let foundValue = false;
    let foundSuffix = false;
    for (let i = 0; i < ps.length; i++) {
        const runs = ps[i].getElementsByTagName('w:r');
        for (let j = 0; j < runs.length; j++) {
           const text = Array.from(runs[j].getElementsByTagName('w:t')).map(t => t.textContent).join('');
           if (text === String(value)) foundValue = true;
           if (field.affix.suffixText && text === field.affix.suffixText) {
              foundSuffix = true;
           }
        }
    }

    if (field.affix.suffixText && !foundSuffix) throw new Error('Suffix is not found as a separate run');
    if (!foundValue) throw new Error('Numeric value is not found as a separate run');
  } else {
    const numbers = cellText.match(/\d+/g);
    if (!numbers || numbers.length !== 1) {
       throw new Error('Expected exactly one number in cell!');
    }
    if (numbers[0] !== String(value)) {
       throw new Error('Numeric value does not match!');
    }
  }
}

async function verifyDistributedField(docDom, origDom, field, value) {
  const { FieldLocator } = await import('./field-locator.mjs');
  const result = FieldLocator.locateDistributedCells(docDom, field.labelText, field.locator.pattern);
  const normalized = String(value).replace(/[－-]/g, '');
  if (result.digitCells.length !== normalized.length) throw new Error('Digit cell count mismatch in verifier');

  for (let i = 0; i < normalized.length; i++) {
    const cellText = FieldLocator.getCellText(result.digitCells[i]);
    if (cellText !== normalized[i]) throw new Error(`Digit cell mismatch at index ${i}. Expected ${normalized[i]}, got ${cellText}`);

    const runs = result.digitCells[i].getElementsByTagName('w:r');
    for (let r = 0; r < runs.length; r++) {
       const rPr = runs[r].getElementsByTagName('w:rPr')[0];
       if (rPr) {
         if (rPr.getElementsByTagName('w:vanish').length > 0 || rPr.getElementsByTagName('w:webHidden').length > 0) {
           throw new Error('Digit run has hidden attribute!');
         }
       }
       let parent = runs[r].parentNode;
       while (parent) {
         if (parent.nodeName === 'w:del' || parent.nodeName === 'w:moveFrom') {
           throw new Error('Digit run is inside deleted/moved node!');
         }
         parent = parent.parentNode;
       }
    }
  }

  for (const sep of result.separatorCells) {
    const text = FieldLocator.getCellText(sep);
    if (text !== '－') throw new Error(`Separator changed to ${text}`);
    if (/\d/.test(text)) throw new Error('Separator contains digit');
  }

  for (const ig of result.ignoredCells) {
    const text = FieldLocator.getCellText(ig);
    if (/\d/.test(text)) throw new Error('Ignored cell contains digit');
  }

  const allDigits = result.digitCells.map(c => FieldLocator.getCellText(c)).join('');
  if (allDigits !== normalized) throw new Error('Constructed logical number does not match expected');
}

async function verifyMultiRowDistributedField(docDom, origDom, field, value) {
  const { FieldLocator } = await import('./field-locator.mjs');
  const result = FieldLocator.locateMultiRowDistributedCells(docDom, field.labelText, field.locator);
  const normalized = String(value).replace(/[－-]/g, '');
  if (result.digitCells.length !== normalized.length) throw new Error('Digit cell count mismatch in verifier');

  for (let i = 0; i < normalized.length; i++) {
    const cellText = FieldLocator.getCellText(result.digitCells[i]);
    if (cellText !== normalized[i]) throw new Error(`Digit cell mismatch at index ${i}. Expected ${normalized[i]}, got ${cellText}`);

    const runs = result.digitCells[i].getElementsByTagName('w:r');
    for (let r = 0; r < runs.length; r++) {
       const rPr = runs[r].getElementsByTagName('w:rPr')[0];
       if (rPr) {
         if (rPr.getElementsByTagName('w:vanish').length > 0 || rPr.getElementsByTagName('w:webHidden').length > 0) {
           throw new Error('Digit run has hidden attribute!');
         }
       }
       let parent = runs[r].parentNode;
       while (parent) {
         if (parent.nodeName === 'w:del' || parent.nodeName === 'w:moveFrom') {
           throw new Error('Digit run is inside deleted/moved node!');
         }
         parent = parent.parentNode;
       }
    }
  }

  for (const sep of result.separatorCells) {
    const text = FieldLocator.getCellText(sep);
    if (text !== '－') throw new Error(`Separator changed to ${text}`);
    if (/\d/.test(text)) throw new Error('Separator contains digit');
  }

  for (const ig of result.ignoredCells) {
    const text = FieldLocator.getCellText(ig);
    if (/\d/.test(text)) throw new Error('Ignored cell contains digit');
  }

  const allDigits = result.digitCells.map(c => FieldLocator.getCellText(c)).join('');
  if (allDigits !== normalized) throw new Error('Constructed logical number does not match expected');

  if (field.locator.pattern) {
    for (const p of field.locator.pattern) {
      if (p.groupId && result.groupedDigitCells[p.groupId]) {
         const groupText = result.groupedDigitCells[p.groupId].map(c => FieldLocator.getCellText(c)).join('');
         if (groupText.length !== p.count) throw new Error(`Group ${p.groupId} length mismatch`);
      }
    }
  }
}

async function verifyDateField(docDom, origDom, f, value) {
  const { FieldLocator } = await import('./field-locator.mjs');
  const origCell = FieldLocator.locateSameCellByExactText(origDom, f.labelText, f.locator);
  const origCells = Array.from(origDom.getElementsByTagName('w:tc'));
  const origIndex = origCells.indexOf(origCell);
  const targetCell = docDom.getElementsByTagName('w:tc')[origIndex];
  const cellText = FieldLocator.getCellText(targetCell);
  const { yearToken, monthToken, dayToken } = f.preserve;

  const isoRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
  const match = value.match(isoRegex);
  const y = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const d = parseInt(match[3], 10);

  const yearStr = f.format?.yearDigits === 2 ? String(y).slice(-2) : String(y);
  const monthStr = f.format?.padMonth ? String(m).padStart(2, '0') : String(m);
  const dayStr = f.format?.padDay ? String(d).padStart(2, '0') : String(d);

  if (!cellText.includes(`${yearStr}${yearToken}`)) throw new Error(`Year missing in cell!`);
  if (!cellText.includes(`${monthStr}${monthToken}`)) throw new Error(`Month missing in cell!`);
  if (!cellText.includes(`${dayStr}${dayToken}`)) throw new Error(`Day missing in cell!`);
}

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
    const origZip = new PizZip(originalBuffer);
    const origXmlStr = origZip.file('word/document.xml').asText();
    const origDom = parser.parseFromString(origXmlStr, 'text/xml');
    const { FieldLocator } = await import('./field-locator.mjs');
    const { careerUpR8Form1Mapping } = await import('../config/career-up-r8-form1.mapping.mjs');

    for (const [key, value] of Object.entries(inputs)) {
      if (value === null || value === undefined || value === '') {
        continue;
      }

      const f = careerUpR8Form1Mapping.fields.find(f => f.fieldId === key);
      if (f && f.inputMode === 'sdt-checkbox') {
        await verifySdtCheckboxField({
          originalDom: origDom,
          outputDom: docDom,
          field: f,
          value,
          key
        });
        continue;
      }

      if (f && f.verification?.type === 'date') {
        await verifyDateField(docDom, origDom, f, value);
        continue;
      }

      if (f && f.verification?.type === 'text') {
        if (f.verification.preservePrefix) {
          await verifyPrefixTextField(docDom, f, value, origDom);
        } else {
          await verifyTextField({ originalDom: origDom, outputDom: docDom, documentXmlStr, field: f, value, key });
        }
        continue;
      }


      if (f && f.verification?.type === 'numeric') {
        await verifyNumericField(docDom, origDom, f, value);
        continue;
      }

      if (f && f.verification?.type === 'distributed') {
        await verifyDistributedField(docDom, origDom, f, value);
        continue;
      }

      if (f && f.verification?.type === 'multi-row-distributed') {
        await verifyMultiRowDistributedField(docDom, origDom, f, value);
        continue;
      }

      if (key === 'manager_name') {
        throw new Error('manager_name should have been handled by verifyPrefixTextField');
      }

      const escapedValue = String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const count = documentXmlStr.split(escapedValue).length - 1;
      if (count !== 1) {
        throw new Error(`Input value "${value}" (${key}) appears ${count} times in whole document, expected 1.`);
      }


    }

    // 対象外SDT全件の checked値不変確認
    const origAllSdts = origDom.getElementsByTagName('w:sdt');
    const outAllSdts = docDom.getElementsByTagName('w:sdt');
    const sdtCheckboxFields = careerUpR8Form1Mapping.fields.filter(f => f.inputMode === 'sdt-checkbox');

    // 変更を許可するSDTノードのoriginalインデックスを収集
    const allowedChangedIndices = new Set();
    for (const cbField of sdtCheckboxFields) {
      if (!inputs[cbField.fieldId]) continue;
      const { SdtCheckboxLocator } = await import('./sdt-checkbox-locator.mjs');
      const origGroupInfo = SdtCheckboxLocator.locateGroup(origDom, cbField.locator, cbField.selection);
      for (const sdt of origGroupInfo.allGroupSdts) {
        const idx = Array.from(origAllSdts).indexOf(sdt);
        if (idx >= 0) allowedChangedIndices.add(idx);
      }
    }

    for (let i = 0; i < origAllSdts.length; i++) {
      const origCb = origAllSdts[i].getElementsByTagName('w14:checkbox')[0];
      if (!origCb) continue;
      if (allowedChangedIndices.has(i)) continue;  // 変更許可済み

      const origChecked = origCb.getElementsByTagName('w14:checked')[0]?.getAttribute('w14:val');
      const outChecked = outAllSdts[i]?.getElementsByTagName('w14:checkbox')[0]?.getElementsByTagName('w14:checked')[0]?.getAttribute('w14:val');
      if (origChecked !== outChecked) {
        throw new Error(`Non-target SDT ${i} changed from ${origChecked} to ${outChecked}`);
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
