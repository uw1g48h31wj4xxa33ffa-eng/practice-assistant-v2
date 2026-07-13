import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { DOMParser } from '@xmldom/xmldom';
import { FieldLocator } from '../core/field-locator.mjs';
import { WordFiller } from '../core/word-filler.mjs';

test('A. Unit Tests', async (t) => {
  const parser = new DOMParser({
    onError: (level, msg) => {
      if (level === 'warning') return;
      throw new Error(`XML Parse ${level}: ${msg}`);
    }
  });

  await t.test('Run分割ラベル結合・完全一致', () => {
    const xml = `
      <w:tbl xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:tr>
          <w:tc>
            <w:p>
              <w:r><w:t>①事業主</w:t></w:r>
              <w:r><w:t>名</w:t></w:r>
            </w:p>
          </w:tc>
          <w:tc><w:p></w:p></w:tc>
        </w:tr>
      </w:tbl>
    `;
    const dom = parser.parseFromString(xml, 'text/xml');
    const matches = FieldLocator.findCellByExactText(dom, '①事業主名');
    assert.strictEqual(matches.length, 1);
  });

  await t.test('複数一致拒否', () => {
    const xml = `
      <w:tbl xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:tr>
          <w:tc><w:p><w:r><w:t>①事業主名</w:t></w:r></w:p></w:tc>
          <w:tc><w:p><w:r><w:t>①事業主名</w:t></w:r></w:p></w:tc>
        </w:tr>
      </w:tbl>
    `;
    const dom = parser.parseFromString(xml, 'text/xml');
    assert.throws(() => {
      FieldLocator.locateAdjacentCell(dom, '①事業主名');
    }, /found multiple times/);
  });

  await t.test('adjacent-cell 検索', () => {
    const xml = `
      <w:tbl xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:tr>
          <w:tc><w:p><w:r><w:t>①事業主名</w:t></w:r></w:p></w:tc>
          <w:tc><w:p></w:p></w:tc>
        </w:tr>
      </w:tbl>
    `;
    const dom = parser.parseFromString(xml, 'text/xml');
    const targetCell = FieldLocator.locateAdjacentCell(dom, '①事業主名');
    assert.ok(targetCell);
    assert.strictEqual(FieldLocator.getCellText(targetCell), '');
  });

  await t.test('next-row-continuation-cell 検索 (vMerge対応)', () => {
    const xml = `
      <w:tbl xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:tr>
          <w:tc>
            <w:tcPr><w:vMerge w:val="restart"/></w:tcPr>
            <w:p><w:r><w:t>②事業所所在地</w:t></w:r></w:p>
          </w:tc>
          <w:tc><w:p><w:r><w:t>〒123-4567</w:t></w:r></w:p></w:tc>
        </w:tr>
        <w:tr>
          <w:tc>
            <w:tcPr><w:vMerge/></w:tcPr>
            <w:p></w:p>
          </w:tc>
          <w:tc><w:p></w:p></w:tc>
        </w:tr>
      </w:tbl>
    `;
    const dom = parser.parseFromString(xml, 'text/xml');
    const targetCell = FieldLocator.locateNextRowContinuationCell(dom, '②事業所所在地');
    assert.ok(targetCell);
  });

  await t.test('confirmed値制御', () => {
    const xml = `
      <w:tbl xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:tr><w:tc><w:p></w:p></w:tc></w:tr>
      </w:tbl>
    `;
    const dom = parser.parseFromString(xml, 'text/xml');
    const tc = dom.getElementsByTagName('w:tc')[0];
    
    assert.throws(() => {
      WordFiller.fillField(tc, 'テスト', { status: 'pending' });
    }, /Status is not 'confirmed'/);
  });
});

import { WordDocument } from '../core/word-document.mjs';
import { VersionGuard } from '../core/version-guard.mjs';
import { careerUpR8Form1Mapping } from '../config/career-up-r8-form1.mapping.mjs';

test('B. 実原本結合テスト', async (t) => {
  const inputPath = process.env.INPUT_PATH || '/Users/to/Documents/practice-assistant-input/001688046.docx';
  
  if (!fs.existsSync(inputPath)) {
    console.log(`未実行：原本なし (${inputPath})`);
    return;
  }

  await t.test('WordDocumentロード・ハッシュ・バージョン確認', () => {
    const doc = WordDocument.fromFile(inputPath);
    const buffer = doc.getOriginalBuffer();
    assert.doesNotThrow(() => {
      VersionGuard.verifyHash(buffer, careerUpR8Form1Mapping.template.expectedSha256);
      VersionGuard.verifyVersionString(doc, careerUpR8Form1Mapping.template.version);
    });
  });
  
  await t.test('同一パス拒否', () => {
    assert.throws(() => {
      VersionGuard.verifyPaths(inputPath, inputPath);
    }, /must be different/);
  });
});
