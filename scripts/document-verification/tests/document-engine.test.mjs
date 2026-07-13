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

test('C. 電話番号検証ロジック', async (t) => {
  const { DOMParser } = await import('@xmldom/xmldom');
  const parser = new DOMParser();
  
  function getDummyCell() {
    return parser.parseFromString(`<w:tc xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:r><w:t>(   )</w:t></w:r></w:p></w:tc>`, 'text/xml').documentElement;
  }
  
  const baseConfig = careerUpR8Form1Mapping.fields.find(f => f.fieldId === 'business_phone_number');
  const config = { ...baseConfig, status: 'confirmed' };
  
  await t.test('正常系: 固定電話・ハイフンあり', () => {
    const tc = getDummyCell();
    assert.doesNotThrow(() => {
      WordFiller.fillField(tc, '03-1234-5678', { ...config, value: '03-1234-5678' });
    });
  });
  
  await t.test('正常系: 固定電話・ハイフンなし', () => {
    const tc = getDummyCell();
    assert.doesNotThrow(() => {
      WordFiller.fillField(tc, '0312345678', { ...config, value: '0312345678' });
    });
  });
  
  await t.test('正常系: 携帯電話・ハイフンあり', () => {
    const tc = getDummyCell();
    assert.doesNotThrow(() => {
      WordFiller.fillField(tc, '090-1234-5678', { ...config, value: '090-1234-5678' });
    });
  });
  
  await t.test('正常系: 携帯電話・ハイフンなし', () => {
    const tc = getDummyCell();
    assert.doesNotThrow(() => {
      WordFiller.fillField(tc, '09012345678', { ...config, value: '09012345678' });
    });
  });
  
  await t.test('異常系: 空文字', () => {
    const tc = getDummyCell();
    assert.throws(() => {
      WordFiller.fillField(tc, '', { ...config, value: '' });
    }, /Value is empty|Value for field.*is empty/);
  });
  
  await t.test('異常系: 未confirmed', () => {
    const tc = getDummyCell();
    assert.throws(() => {
      WordFiller.fillField(tc, '03-1234-5678', { ...config, status: 'draft', value: '03-1234-5678' });
    }, /Status is not 'confirmed'/);
  });
  
  await t.test('異常系: 9桁以下', () => {
    const tc = getDummyCell();
    assert.throws(() => {
      WordFiller.fillField(tc, '03-123-5678', { ...config, value: '03-123-5678' });
    }, /Invalid digit count: 9/);
  });
  
  await t.test('異常系: 12桁以上', () => {
    const tc = getDummyCell();
    assert.throws(() => {
      WordFiller.fillField(tc, '03-1234-567890', { ...config, value: '03-1234-567890' });
    }, /Invalid digit count: 12/);
  });
  
  await t.test('異常系: 英字混入', () => {
    const tc = getDummyCell();
    assert.throws(() => {
      WordFiller.fillField(tc, '03-1234-abcd', { ...config, value: '03-1234-abcd' });
    }, /Value contains letters/);
  });
  
  await t.test('異常系: 記号混入', () => {
    const tc = getDummyCell();
    assert.throws(() => {
      WordFiller.fillField(tc, '03-1234+5678', { ...config, value: '03-1234+5678' });
    }, /Value contains symbols/);
  });
});

test('D. 担当者検証ロジック', async (t) => {
  const { DOMParser } = await import('@xmldom/xmldom');
  const parser = new DOMParser();
  
  function getDummyCell() {
    return parser.parseFromString(`<w:tc xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p></w:p></w:tc>`, 'text/xml').documentElement;
  }
  
  const baseConfig = careerUpR8Form1Mapping.fields.find(f => f.fieldId === 'business_contact_name');
  const config = { ...baseConfig, status: 'confirmed' };
  
  await t.test('正常系: 日本語氏名', () => {
    const tc = getDummyCell();
    assert.doesNotThrow(() => {
      WordFiller.fillField(tc, '山田太郎', { ...config, value: '山田太郎' });
    });
  });
  
  await t.test('正常系: 半角スペースあり', () => {
    const tc = getDummyCell();
    assert.doesNotThrow(() => {
      WordFiller.fillField(tc, '山田 太郎', { ...config, value: '山田 太郎' });
    });
  });
  
  await t.test('正常系: 全角スペースあり', () => {
    const tc = getDummyCell();
    assert.doesNotThrow(() => {
      WordFiller.fillField(tc, '山田　太郎', { ...config, value: '山田　太郎' });
    });
  });
  
  await t.test('正常系: カタカナ氏名', () => {
    const tc = getDummyCell();
    assert.doesNotThrow(() => {
      WordFiller.fillField(tc, 'ヤマダタロウ', { ...config, value: 'ヤマダタロウ' });
    });
  });

  await t.test('正常系: 英字氏名', () => {
    const tc = getDummyCell();
    assert.doesNotThrow(() => {
      WordFiller.fillField(tc, 'John Smith', { ...config, value: 'John Smith' });
    });
  });

  await t.test('正常系: 中黒を含む氏名', () => {
    const tc = getDummyCell();
    assert.doesNotThrow(() => {
      WordFiller.fillField(tc, 'ジョン・スミス', { ...config, value: 'ジョン・スミス' });
    });
  });

  await t.test('異常系: 空文字', () => {
    const tc = getDummyCell();
    assert.throws(() => {
      WordFiller.fillField(tc, '', { ...config, value: '' });
    }, /Value is empty/);
  });
  
  await t.test('異常系: 未confirmed', () => {
    const tc = getDummyCell();
    assert.throws(() => {
      WordFiller.fillField(tc, '山田 太郎', { ...config, status: 'draft', value: '山田 太郎' });
    }, /Status is not 'confirmed'/);
  });
  
  await t.test('異常系: 31文字以上', () => {
    const tc = getDummyCell();
    const longName = 'あ'.repeat(31);
    assert.throws(() => {
      WordFiller.fillField(tc, longName, { ...config, value: longName });
    }, /Value exceeds max length of 30/);
  });
  
  await t.test('異常系: 改行含有', () => {
    const tc = getDummyCell();
    assert.throws(() => {
      WordFiller.fillField(tc, '山田\n太郎', { ...config, value: '山田\n太郎' });
    }, /Value contains newline or tab/);
  });
  
  await t.test('異常系: タブ含有', () => {
    const tc = getDummyCell();
    assert.throws(() => {
      WordFiller.fillField(tc, '山田\t太郎', { ...config, value: '山田\t太郎' });
    }, /Value contains newline or tab/);
  });
  
  await t.test('異常系: 制御文字', () => {
    const tc = getDummyCell();
    assert.throws(() => {
      WordFiller.fillField(tc, '山田\x00太郎', { ...config, value: '山田\x00太郎' });
    }, /Value contains control characters/);
  });

  await t.test('異常系: XMLタグ風文字列', () => {
    const tc = getDummyCell();
    assert.throws(() => {
      WordFiller.fillField(tc, '<script>alert(1)</script>', { ...config, value: '<script>alert(1)</script>' });
    }, /Value contains HTML\/XML tags/);
  });
});

test('E. 分散セルロジック', async (t) => {
  const { DOMParser } = await import('@xmldom/xmldom');
  const parser = new DOMParser();
  
  function getFixture() {
    return parser.parseFromString(`
    <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
      <w:tbl>
        <w:tr>
          <w:tc><w:p><w:r><w:t>⑤雇用保険適用</w:t></w:r></w:p><w:p><w:r><w:t>事業所番号</w:t></w:r></w:p></w:tc>
          <w:tc><w:p></w:p></w:tc>
          <w:tc><w:p></w:p></w:tc>
          <w:tc><w:p></w:p></w:tc>
          <w:tc><w:p></w:p></w:tc>
          <w:tc><w:p><w:r><w:t>－</w:t></w:r></w:p></w:tc>
          <w:tc><w:p></w:p></w:tc>
          <w:tc><w:p></w:p></w:tc>
          <w:tc><w:p></w:p></w:tc>
          <w:tc><w:p></w:p></w:tc>
          <w:tc><w:p></w:p></w:tc>
          <w:tc><w:p></w:p></w:tc>
          <w:tc><w:p><w:r><w:t>－</w:t></w:r></w:p></w:tc>
          <w:tc><w:p></w:p></w:tc>
          <w:tc><w:tcPr><w:tr2bl w:val="single"/></w:tcPr><w:p></w:p></w:tc>
        </w:tr>
      </w:tbl>
    </w:document>
    `, 'text/xml');
  }

  const baseConfig = careerUpR8Form1Mapping.fields.find(f => f.fieldId === 'employment_insurance_office_number');
  const config = { ...baseConfig, status: 'confirmed' };

  await t.test('Locator正常系: 正しく取得できる', () => {
    const doc = getFixture();
    const result = FieldLocator.locateDistributedCells(doc, '⑤雇用保険適用事業所番号', config.locator.pattern);
    assert.strictEqual(result.digitCells.length, 11);
    assert.strictEqual(result.separatorCells.length, 2);
    assert.strictEqual(result.ignoredCells.length, 1);
    assert.strictEqual(result.metadata.digitCount, 11);
    assert.strictEqual(result.metadata.separatorCount, 2);
    assert.deepStrictEqual(result.metadata.groups, [4, 6, 1]);
  });

  await t.test('Locator異常系: ラベルなし', () => {
    const doc = parser.parseFromString(`<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:tbl><w:tr></w:tr></w:tbl></w:document>`, 'text/xml');
    assert.throws(() => FieldLocator.locateDistributedCells(doc, '⑤雇用保険適用事業所番号', config.locator.pattern), /Label "⑤雇用保険適用事業所番号" not found/);
  });

  await t.test('Locator異常系: ラベル複数', () => {
    const doc = parser.parseFromString(`<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:tbl><w:tr><w:tc><w:p><w:r><w:t>⑤雇用保険適用事業所番号</w:t></w:r></w:p></w:tc></w:tr><w:tr><w:tc><w:p><w:r><w:t>⑤雇用保険適用事業所番号</w:t></w:r></w:p></w:tc></w:tr></w:tbl></w:document>`, 'text/xml');
    assert.throws(() => FieldLocator.locateDistributedCells(doc, '⑤雇用保険適用事業所番号', config.locator.pattern), /Label "⑤雇用保険適用事業所番号" found multiple times/);
  });

  await t.test('Locator異常系: digitセル不足', () => {
    const doc = parser.parseFromString(`<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:tbl><w:tr><w:tc><w:p><w:r><w:t>⑤雇用保険適用事業所番号</w:t></w:r></w:p></w:tc><w:tc></w:tc></w:tr></w:tbl></w:document>`, 'text/xml');
    assert.throws(() => FieldLocator.locateDistributedCells(doc, '⑤雇用保険適用事業所番号', config.locator.pattern), /Not enough cells remaining/);
  });

  await t.test('Locator異常系: pattern処理後に未分類セルが残る (過剰セル)', () => {
    const fixtureStr = getFixture().toString();
    const doc = parser.parseFromString(fixtureStr.replace('</w:tr>', '<w:tc></w:tc></w:tr>'), 'text/xml');
    assert.throws(() => FieldLocator.locateDistributedCells(doc, '⑤雇用保険適用事業所番号', config.locator.pattern), /Unclassified cells remaining/);
  });

  await t.test('Locator異常系: separator文字不一致', () => {
    const fixtureStr = getFixture().toString();
    const doc = parser.parseFromString(fixtureStr.replace('<w:t>－</w:t>', '<w:t>ー</w:t>'), 'text/xml');
    assert.throws(() => FieldLocator.locateDistributedCells(doc, '⑤雇用保険適用事業所番号', config.locator.pattern), /Separator mismatch/);
  });

  await t.test('Filler正常系: 正常な入力', () => {
    const doc = getFixture();
    const result = FieldLocator.locateDistributedCells(doc, '⑤雇用保険適用事業所番号', config.locator.pattern);
    WordFiller.fillDistributedField(result, '1234-567890-1', config);
    const digits = result.digitCells.map(c => FieldLocator.getCellText(c)).join('');
    assert.strictEqual(digits, '12345678901');
  });

  await t.test('Filler異常系: 10桁', () => {
    const doc = getFixture();
    const result = FieldLocator.locateDistributedCells(doc, '⑤雇用保険適用事業所番号', config.locator.pattern);
    assert.throws(() => WordFiller.fillDistributedField(result, '1234-567890', config), /Digit count mismatch/);
  });

  await t.test('Filler異常系: 英字混入', () => {
    const doc = getFixture();
    const result = FieldLocator.locateDistributedCells(doc, '⑤雇用保険適用事業所番号', config.locator.pattern);
    assert.throws(() => WordFiller.fillDistributedField(result, '1234-56789a-1', config), /Value contains letters/);
  });

  await t.test('Filler異常系: 誤ハイフン位置', () => {
    const doc = getFixture();
    const result = FieldLocator.locateDistributedCells(doc, '⑤雇用保険適用事業所番号', config.locator.pattern);
    assert.throws(() => WordFiller.fillDistributedField(result, '123-4567890-1', config), /Invalid hyphen position or group length/);
  });

  await t.test('Filler異常系: スラッシュ混入', () => {
    const doc = getFixture();
    const result = FieldLocator.locateDistributedCells(doc, '⑤雇用保険適用事業所番号', config.locator.pattern);
    assert.throws(() => WordFiller.fillDistributedField(result, '1234/567890-1', config), /Value contains non-digit/);
  });

  await t.test('Filler異常系: ピリオド混入', () => {
    const doc = getFixture();
    const result = FieldLocator.locateDistributedCells(doc, '⑤雇用保険適用事業所番号', config.locator.pattern);
    assert.throws(() => WordFiller.fillDistributedField(result, '1234.567890-1', config), /Value contains non-digit/);
  });
  
  await t.test('Filler異常系: 空白混入', () => {
    const doc = getFixture();
    const result = FieldLocator.locateDistributedCells(doc, '⑤雇用保険適用事業所番号', config.locator.pattern);
    assert.throws(() => WordFiller.fillDistributedField(result, '1234 567890 1', config), /Value contains spaces/);
  });
  
  await t.test('Filler異常系: 未confirmed', () => {
    const doc = getFixture();
    const result = FieldLocator.locateDistributedCells(doc, '⑤雇用保険適用事業所番号', config.locator.pattern);
    assert.throws(() => WordFiller.fillDistributedField(result, '1234-567890-1', { ...config, status: 'draft' }), /Status is not 'confirmed'/);
  });
  
  await t.test('Filler異常系: 空文字', () => {
    const doc = getFixture();
    const result = FieldLocator.locateDistributedCells(doc, '⑤雇用保険適用事業所番号', config.locator.pattern);
    assert.throws(() => WordFiller.fillDistributedField(result, '', config), /Value is empty/);
  });

});
