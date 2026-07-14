import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
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

test('F. 労働保険番号分散セルロジック', async (t) => {
  const { DOMParser } = await import('@xmldom/xmldom');
  const parser = new DOMParser();

  function getLaborFixture() {
    return parser.parseFromString(`
    <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
      <w:tbl>
        <w:tr>
          <w:tc>
            <w:tcPr><w:vMerge w:val="restart"/></w:tcPr>
            <w:p><w:r><w:t>⑥労働保険番号</w:t></w:r></w:p>
          </w:tc>
          <w:tc><w:tcPr><w:gridSpan w:val="3"/></w:tcPr><w:p><w:r><w:t>都道府県</w:t></w:r></w:p></w:tc>
          <w:tc><w:p><w:r><w:t>所掌</w:t></w:r></w:p></w:tc>
          <w:tc><w:tcPr><w:gridSpan w:val="4"/></w:tcPr><w:p><w:r><w:t>管轄</w:t></w:r></w:p></w:tc>
          <w:tc><w:tcPr><w:gridSpan w:val="17"/></w:tcPr><w:p><w:r><w:t>基幹番号</w:t></w:r></w:p></w:tc>
          <w:tc><w:tcPr><w:gridSpan w:val="6"/></w:tcPr><w:p><w:r><w:t>枝番号</w:t></w:r></w:p></w:tc>
        </w:tr>
        <w:tr>
          <w:tc><w:tcPr><w:vMerge w:val="continue"/></w:tcPr><w:p></w:p></w:tc>
          <w:tc><w:p></w:p></w:tc>
          <w:tc><w:p></w:p></w:tc>
          <w:tc><w:p></w:p></w:tc>
          <w:tc><w:p></w:p></w:tc>
          <w:tc><w:p></w:p></w:tc>
          <w:tc><w:p></w:p></w:tc>
          <w:tc><w:p></w:p></w:tc>
          <w:tc><w:p></w:p></w:tc>
          <w:tc><w:p></w:p></w:tc>
          <w:tc><w:p></w:p></w:tc>
          <w:tc><w:p></w:p></w:tc>
          <w:tc><w:p><w:r><w:t>－</w:t></w:r></w:p></w:tc>
          <w:tc><w:p></w:p></w:tc>
          <w:tc><w:p></w:p></w:tc>
          <w:tc><w:p></w:p></w:tc>
        </w:tr>
      </w:tbl>
    </w:document>
    `, 'text/xml');
  }

  const baseConfig = careerUpR8Form1Mapping.fields.find(f => f.fieldId === 'labor_insurance_number');
  const config = { ...baseConfig, status: 'confirmed' };

  await t.test('Locator正常系: 正しく取得できる', () => {
    const doc = getLaborFixture();
    const result = FieldLocator.locateMultiRowDistributedCells(doc, '⑥労働保険番号', config.locator);
    assert.strictEqual(result.digitCells.length, 14);
    assert.strictEqual(result.separatorCells.length, 1);
    assert.strictEqual(result.ignoredCells.length, 1);
    assert.deepStrictEqual(result.metadata.groups, [2, 1, 2, 6, 3]);
  });

  await t.test('Locator異常系: ラベルなし', () => {
    const doc = parser.parseFromString(`<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:tbl><w:tr></w:tr></w:tbl></w:document>`, 'text/xml');
    assert.throws(() => FieldLocator.locateMultiRowDistributedCells(doc, '⑥労働保険番号', config.locator), /Label "⑥労働保険番号" not found/);
  });

  await t.test('Locator異常系: ラベル複数', () => {
    const doc = parser.parseFromString(`<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:tbl><w:tr><w:tc><w:p><w:r><w:t>⑥労働保険番号</w:t></w:r></w:p></w:tc></w:tr><w:tr><w:tc><w:p><w:r><w:t>⑥労働保険番号</w:t></w:r></w:p></w:tc></w:tr></w:tbl></w:document>`, 'text/xml');
    assert.throws(() => FieldLocator.locateMultiRowDistributedCells(doc, '⑥労働保険番号', config.locator), /Label "⑥労働保険番号" found multiple times/);
  });

  await t.test('Locator異常系: 次行なし (targetRowOffset不正)', () => {
    const doc = parser.parseFromString(`<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:tbl><w:tr><w:tc><w:p><w:r><w:t>⑥労働保険番号</w:t></w:r></w:p></w:tc></w:tr></w:tbl></w:document>`, 'text/xml');
    assert.throws(() => FieldLocator.locateMultiRowDistributedCells(doc, '⑥労働保険番号', config.locator), /Target row offset 1 exceeds available rows/);
  });

  await t.test('Locator異常系: digit不足', () => {
    const doc = getLaborFixture();
    const rows = doc.getElementsByTagName('w:tr');
    const cells = rows[1].getElementsByTagName('w:tc');
    rows[1].removeChild(cells[cells.length - 1]);
    assert.throws(() => FieldLocator.locateMultiRowDistributedCells(doc, '⑥労働保険番号', config.locator), /Not enough cells remaining/);
  });

  await t.test('Locator異常系: 未分類セル残存 (過剰)', () => {
    const doc = getLaborFixture();
    const rows = doc.getElementsByTagName('w:tr');
    const newCell = doc.createElement('w:tc');
    rows[1].appendChild(newCell);
    assert.throws(() => FieldLocator.locateMultiRowDistributedCells(doc, '⑥労働保険番号', config.locator), /Unclassified cells remaining/);
  });

  await t.test('Locator異常系: separator文字不一致', () => {
    const fixtureStr = getLaborFixture().toString();
    const doc = parser.parseFromString(fixtureStr.replace('<w:t>－</w:t>', '<w:t>ー</w:t>'), 'text/xml');
    assert.throws(() => FieldLocator.locateMultiRowDistributedCells(doc, '⑥労働保険番号', config.locator), /Separator mismatch/);
  });

  await t.test('Filler正常系: 正常な入力', () => {
    const doc = getLaborFixture();
    const result = FieldLocator.locateMultiRowDistributedCells(doc, '⑥労働保険番号', config.locator);
    WordFiller.fillDistributedField(result, '01123123456789', config);
    const digits = result.digitCells.map(c => FieldLocator.getCellText(c)).join('');
    assert.strictEqual(digits, '01123123456789');
  });

  await t.test('Filler異常系: 13桁', () => {
    const doc = getLaborFixture();
    const result = FieldLocator.locateMultiRowDistributedCells(doc, '⑥労働保険番号', config.locator);
    assert.throws(() => WordFiller.fillDistributedField(result, '0112312345678', config), /Digit count mismatch/);
  });

  await t.test('Filler異常系: 15桁', () => {
    const doc = getLaborFixture();
    const result = FieldLocator.locateMultiRowDistributedCells(doc, '⑥労働保険番号', config.locator);
    assert.throws(() => WordFiller.fillDistributedField(result, '011231234567890', config), /Digit count mismatch/);
  });

  await t.test('Filler異常系: 空白混入', () => {
    const doc = getLaborFixture();
    const result = FieldLocator.locateMultiRowDistributedCells(doc, '⑥労働保険番号', config.locator);
    assert.throws(() => WordFiller.fillDistributedField(result, '01 123123456789', config), /Value contains spaces/);
  });

  await t.test('Filler異常系: ピリオド混入', () => {
    const doc = getLaborFixture();
    const result = FieldLocator.locateMultiRowDistributedCells(doc, '⑥労働保険番号', config.locator);
    assert.throws(() => WordFiller.fillDistributedField(result, '01.123123456789', config), /Value contains non-digit/);
  });

  await t.test('Filler異常系: スラッシュ混入', () => {
    const doc = getLaborFixture();
    const result = FieldLocator.locateMultiRowDistributedCells(doc, '⑥労働保険番号', config.locator);
    assert.throws(() => WordFiller.fillDistributedField(result, '01/123123456789', config), /Value contains non-digit/);
  });

  await t.test('Filler異常系: 空文字', () => {
    const doc = getLaborFixture();
    const result = FieldLocator.locateMultiRowDistributedCells(doc, '⑥労働保険番号', config.locator);
    assert.throws(() => WordFiller.fillDistributedField(result, '', config), /Value is empty/);
  });

  await t.test('Filler異常系: 未confirmed', () => {
    const doc = getLaborFixture();
    const result = FieldLocator.locateMultiRowDistributedCells(doc, '⑥労働保険番号', config.locator);
    assert.throws(() => WordFiller.fillDistributedField(result, '01123123456789', { ...config, status: 'draft' }), /Status is not 'confirmed'/);
  });
});


test('G. 主たる事業検証ロジック', async (t) => {
  const { DOMParser } = await import('@xmldom/xmldom');
  const parser = new DOMParser();

  function getBusinessFixture() {
    return parser.parseFromString(`
    <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
      <w:tbl>
        <w:tr>
          <w:tc>
            <w:p><w:r><w:t>⑦主たる事業</w:t></w:r></w:p>
          </w:tc>
          <w:tc>
            <w:p><w:r><w:t></w:t></w:r></w:p>
          </w:tc>
        </w:tr>
      </w:tbl>
    </w:document>
    `, 'text/xml');
  }

  const baseConfig = careerUpR8Form1Mapping.fields.find(f => f.fieldId === 'main_business');
  const config = { ...baseConfig, status: 'confirmed' };

  await t.test('正常系: 日本語短文', () => {
    const doc = getBusinessFixture();
    const cell = FieldLocator.locateAdjacentCell(doc, '⑦主たる事業');
    WordFiller.fillField(cell, 'ソフトウェア開発', config);
    assert.strictEqual(FieldLocator.getCellText(cell), 'ソフトウェア開発');
  });

  await t.test('異常系: 空文字', () => {
    const doc = getBusinessFixture();
    const cell = FieldLocator.locateAdjacentCell(doc, '⑦主たる事業');
    assert.throws(() => WordFiller.fillField(cell, '', config), /Value is empty/);
  });

  await t.test('異常系: タブ含有', () => {
    const doc = getBusinessFixture();
    const cell = FieldLocator.locateAdjacentCell(doc, '⑦主たる事業');
    assert.throws(() => WordFiller.fillField(cell, 'ソフト\tウェア', config), /Value contains newline or tab/);
  });

  await t.test('異常系: 最大文字数超過', () => {
    const doc = getBusinessFixture();
    const cell = FieldLocator.locateAdjacentCell(doc, '⑦主たる事業');
    assert.throws(() => WordFiller.fillField(cell, 'a'.repeat(101), config), /Value exceeds max length of 100/);
  });
});

test('H. 企業規模（人数）検証ロジック', async (t) => {
  const { DOMParser } = await import('@xmldom/xmldom');
  const parser = new DOMParser();

  function getEmpCountFixture() {
    return parser.parseFromString(`
    <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
      <w:tbl>
        <w:tr>
          <w:tc>
            <w:p><w:r><w:t>⑧企業規模（人数）</w:t></w:r></w:p>
          </w:tc>
          <w:tc>
            <w:p>
              <w:r><w:t></w:t></w:r>
              <w:r><w:t>人</w:t></w:r>
            </w:p>
          </w:tc>
        </w:tr>
      </w:tbl>
    </w:document>
    `, 'text/xml');
  }

  const baseConfig = careerUpR8Form1Mapping.fields.find(f => f.fieldId === 'employee_count');
  const config = { ...baseConfig, status: 'confirmed' };

  await t.test('正常系: 半角数字', () => {
    const doc = getEmpCountFixture();
    const cell = FieldLocator.locateAdjacentCell(doc, '⑧企業規模（人数）');
    WordFiller.fillNumericFieldPreservingAffix(cell, '25', config);
    assert.strictEqual(FieldLocator.getCellText(cell), '25人');
  });

  await t.test('正常系: 全角数字の半角化', () => {
    const doc = getEmpCountFixture();
    const cell = FieldLocator.locateAdjacentCell(doc, '⑧企業規模（人数）');
    WordFiller.fillNumericFieldPreservingAffix(cell, '２５', config);
    assert.strictEqual(FieldLocator.getCellText(cell), '25人');
  });

  await t.test('異常系: 空文字', () => {
    const doc = getEmpCountFixture();
    const cell = FieldLocator.locateAdjacentCell(doc, '⑧企業規模（人数）');
    assert.throws(() => WordFiller.fillNumericFieldPreservingAffix(cell, '', config), /Value is empty/);
  });

  await t.test('異常系: 負数', () => {
    const doc = getEmpCountFixture();
    const cell = FieldLocator.locateAdjacentCell(doc, '⑧企業規模（人数）');
    assert.throws(() => WordFiller.fillNumericFieldPreservingAffix(cell, '-25', config), /Value contains negative sign/);
  });

  await t.test('異常系: 小数', () => {
    const doc = getEmpCountFixture();
    const cell = FieldLocator.locateAdjacentCell(doc, '⑧企業規模（人数）');
    assert.throws(() => WordFiller.fillNumericFieldPreservingAffix(cell, '2.5', config), /Value contains decimal point/);
  });

  await t.test('異常系: カンマ', () => {
    const doc = getEmpCountFixture();
    const cell = FieldLocator.locateAdjacentCell(doc, '⑧企業規模（人数）');
    assert.throws(() => WordFiller.fillNumericFieldPreservingAffix(cell, '1,000', config), /Value contains comma/);
  });

  await t.test('異常系: 英字混入', () => {
    const doc = getEmpCountFixture();
    const cell = FieldLocator.locateAdjacentCell(doc, '⑧企業規模（人数）');
    assert.throws(() => WordFiller.fillNumericFieldPreservingAffix(cell, '25a', config), /Value contains letters/);
  });

  await t.test('異常系: 単位を含める', () => {
    const doc = getEmpCountFixture();
    const cell = FieldLocator.locateAdjacentCell(doc, '⑧企業規模（人数）');
    assert.throws(() => WordFiller.fillNumericFieldPreservingAffix(cell, '25人', config), /Value contains affix 人/);
  });

  await t.test('異常系: 単位を含める (スペースあり)', () => {
    const doc = getEmpCountFixture();
    const cell = FieldLocator.locateAdjacentCell(doc, '⑧企業規模（人数）');
    assert.throws(() => WordFiller.fillNumericFieldPreservingAffix(cell, '25 人', config), /Value contains affix 人/);
  });

  await t.test('異常系: 接尾辞なし', () => {
    const doc = parser.parseFromString(`
    <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
      <w:tbl><w:tr>
        <w:tc><w:p><w:r><w:t>⑧企業規模（人数）</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t></w:t></w:r></w:p></w:tc>
      </w:tr></w:tbl>
    </w:document>`, 'text/xml');
    const cell = FieldLocator.locateAdjacentCell(doc, '⑧企業規模（人数）');
    assert.throws(() => WordFiller.fillNumericFieldPreservingAffix(cell, '25', config), /Suffix run not found in target cell/);
  });
});

test('I. 代理人等氏名検証ロジック', async (t) => {
  const { DOMParser } = await import('@xmldom/xmldom');
  const parser = new DOMParser();

  function getAgentFixture() {
    return parser.parseFromString(`
    <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
      <w:tbl>
        <w:tr>
          <w:tc>
            <w:p><w:r><w:t>⑩代理人等氏名</w:t></w:r></w:p>
          </w:tc>
          <w:tc>
            <w:p><w:r><w:t></w:t></w:r></w:p>
          </w:tc>
        </w:tr>
      </w:tbl>
    </w:document>
    `, 'text/xml');
  }

  const baseConfig = careerUpR8Form1Mapping.fields.find(f => f.fieldId === 'agent_name');
  const config = { ...baseConfig, status: 'confirmed' };

  await t.test('正常系: 日本語氏名', () => {
    const doc = getAgentFixture();
    const cell = FieldLocator.locateAdjacentCell(doc, '⑩代理人等氏名');
    WordFiller.fillField(cell, '代理 太郎', config);
    assert.strictEqual(FieldLocator.getCellText(cell), '代理 太郎');
  });

  await t.test('正常系: 半角スペースあり', () => {
    const doc = getAgentFixture();
    const cell = FieldLocator.locateAdjacentCell(doc, '⑩代理人等氏名');
    WordFiller.fillField(cell, '代理 Taro', config);
    assert.strictEqual(FieldLocator.getCellText(cell), '代理 Taro');
  });

  await t.test('正常系: 全角スペースあり', () => {
    const doc = getAgentFixture();
    const cell = FieldLocator.locateAdjacentCell(doc, '⑩代理人等氏名');
    WordFiller.fillField(cell, '代理　太郎', config);
    assert.strictEqual(FieldLocator.getCellText(cell), '代理　太郎');
  });

  await t.test('正常系: カタカナ氏名', () => {
    const doc = getAgentFixture();
    const cell = FieldLocator.locateAdjacentCell(doc, '⑩代理人等氏名');
    WordFiller.fillField(cell, 'ダイリ タロウ', config);
    assert.strictEqual(FieldLocator.getCellText(cell), 'ダイリ タロウ');
  });

  await t.test('正常系: 英字氏名', () => {
    const doc = getAgentFixture();
    const cell = FieldLocator.locateAdjacentCell(doc, '⑩代理人等氏名');
    WordFiller.fillField(cell, 'Taro Dairi', config);
    assert.strictEqual(FieldLocator.getCellText(cell), 'Taro Dairi');
  });

  await t.test('正常系: 中黒を含む氏名', () => {
    const doc = getAgentFixture();
    const cell = FieldLocator.locateAdjacentCell(doc, '⑩代理人等氏名');
    WordFiller.fillField(cell, 'ダ・ヴィンチ', config);
    assert.strictEqual(FieldLocator.getCellText(cell), 'ダ・ヴィンチ');
  });

  await t.test('正常系: 空文字は処理をスキップ', () => {
    const doc = getAgentFixture();
    const cell = FieldLocator.locateAdjacentCell(doc, '⑩代理人等氏名');
    WordFiller.fillField(cell, '', config);
    assert.strictEqual(FieldLocator.getCellText(cell), '');
  });

  await t.test('異常系: 未confirmed', () => {
    const doc = getAgentFixture();
    const cell = FieldLocator.locateAdjacentCell(doc, '⑩代理人等氏名');
    const unconfirmedConfig = { ...config, status: 'aiDraft' };
    assert.throws(() => WordFiller.fillField(cell, '代理 太郎', unconfirmedConfig), /Cannot fill value. Status is not 'confirmed'/);
  });

  await t.test('異常系: 最大文字数超過', () => {
    const doc = getAgentFixture();
    const cell = FieldLocator.locateAdjacentCell(doc, '⑩代理人等氏名');
    assert.throws(() => WordFiller.fillField(cell, 'a'.repeat(51), config), /Value exceeds max length of 50/);
  });

  await t.test('異常系: 改行含有', () => {
    const doc = getAgentFixture();
    const cell = FieldLocator.locateAdjacentCell(doc, '⑩代理人等氏名');
    assert.throws(() => WordFiller.fillField(cell, '代理\n太郎', config), /Value contains newline or tab/);
  });

  await t.test('異常系: タブ含有', () => {
    const doc = getAgentFixture();
    const cell = FieldLocator.locateAdjacentCell(doc, '⑩代理人等氏名');
    assert.throws(() => WordFiller.fillField(cell, '代理\t太郎', config), /Value contains newline or tab/);
  });

  await t.test('異常系: 制御文字', () => {
    const doc = getAgentFixture();
    const cell = FieldLocator.locateAdjacentCell(doc, '⑩代理人等氏名');
    assert.throws(() => WordFiller.fillField(cell, '代理\x00太郎', config), /Value contains control characters/);
  });

  await t.test('異常系: XMLタグ風文字列', () => {
    const doc = getAgentFixture();
    const cell = FieldLocator.locateAdjacentCell(doc, '⑩代理人等氏名');
    assert.throws(() => WordFiller.fillField(cell, '<w:t>代理</w:t>', config), /Value contains HTML\/XML tags/);
  });
});

test('J. WordFiller空値処理の最終是正', async (t) => {
  const { DOMParser, XMLSerializer } = await import('@xmldom/xmldom');
  const parser = new DOMParser();
  const serializer = new XMLSerializer();

  function getFixture() {
    return parser.parseFromString(`
    <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
      <w:tbl>
        <w:tr>
          <w:tc>
            <w:p><w:r><w:t>⑩代理人等氏名</w:t></w:r></w:p>
          </w:tc>
          <w:tc>
            <w:p><w:r><w:t></w:t></w:r></w:p>
          </w:tc>
        </w:tr>
        <w:tr>
          <w:tc>
            <w:p><w:r><w:t>④事業所の担当者</w:t></w:r></w:p>
          </w:tc>
          <w:tc>
            <w:p><w:r><w:t></w:t></w:r></w:p>
          </w:tc>
        </w:tr>
      </w:tbl>
    </w:document>
    `, 'text/xml');
  }

  const optConfigBase = careerUpR8Form1Mapping.fields.find(f => f.fieldId === 'agent_name');
  const optCfg = { ...optConfigBase, status: 'confirmed' };

  const reqConfigBase = careerUpR8Form1Mapping.fields.find(f => f.fieldId === 'business_contact_name');
  const reqCfg = { ...reqConfigBase, status: 'confirmed' };

  await t.test('A. optional空値: undefined', () => {
    const doc = getFixture();
    const cell = FieldLocator.locateAdjacentCell(doc, '⑩代理人等氏名');
    const originalXml = serializer.serializeToString(cell);
    WordFiller.fillField(cell, undefined, optCfg);
    assert.strictEqual(serializer.serializeToString(cell), originalXml);
  });
  await t.test('A. optional空値: null', () => {
    const doc = getFixture();
    const cell = FieldLocator.locateAdjacentCell(doc, '⑩代理人等氏名');
    const originalXml = serializer.serializeToString(cell);
    WordFiller.fillField(cell, null, optCfg);
    assert.strictEqual(serializer.serializeToString(cell), originalXml);
  });
  await t.test("A. optional空値: ''", () => {
    const doc = getFixture();
    const cell = FieldLocator.locateAdjacentCell(doc, '⑩代理人等氏名');
    const originalXml = serializer.serializeToString(cell);
    WordFiller.fillField(cell, '', optCfg);
    assert.strictEqual(serializer.serializeToString(cell), originalXml);
  });

  await t.test('B. required空値: undefined', () => {
    const doc = getFixture();
    const cell = FieldLocator.locateAdjacentCell(doc, '④事業所の担当者');
    const originalXml = serializer.serializeToString(cell);
    assert.throws(() => WordFiller.fillField(cell, undefined, reqCfg), /Value is empty/);
    assert.strictEqual(serializer.serializeToString(cell), originalXml);
  });
  await t.test('B. required空値: null', () => {
    const doc = getFixture();
    const cell = FieldLocator.locateAdjacentCell(doc, '④事業所の担当者');
    const originalXml = serializer.serializeToString(cell);
    assert.throws(() => WordFiller.fillField(cell, null, reqCfg), /Value is empty/);
    assert.strictEqual(serializer.serializeToString(cell), originalXml);
  });
  await t.test("B. required空値: ''", () => {
    const doc = getFixture();
    const cell = FieldLocator.locateAdjacentCell(doc, '④事業所の担当者');
    const originalXml = serializer.serializeToString(cell);
    assert.throws(() => WordFiller.fillField(cell, '', reqCfg), /Value is empty/);
    assert.strictEqual(serializer.serializeToString(cell), originalXml);
  });

  for (const invalid of [0, 1, false, true, NaN, {}, []]) {
    await t.test(`C. 型検証: ${String(invalid)}`, () => {
      const doc = getFixture();
      const cell = FieldLocator.locateAdjacentCell(doc, '⑩代理人等氏名');
      const originalXml = serializer.serializeToString(cell);
      assert.throws(() => WordFiller.fillField(cell, invalid, optCfg), /Value must be a string/);
      assert.strictEqual(serializer.serializeToString(cell), originalXml);
    });
  }

  for (const valid of ['0', 'false', '代理 太郎', 'ソフトウェア開発業']) {
    await t.test(`D. 文字列として許可: '${valid}'`, () => {
      const doc = getFixture();
      const cell = FieldLocator.locateAdjacentCell(doc, '⑩代理人等氏名');
      WordFiller.fillField(cell, valid, optCfg);
      assert.strictEqual(FieldLocator.getCellText(cell), valid);
    });
  }

  for (const unconf of ['通常文字列', undefined, null, '']) {
    await t.test(`E. 未confirmed: ${String(unconf)}`, () => {
      const doc = getFixture();
      const cell = FieldLocator.locateAdjacentCell(doc, '⑩代理人等氏名');
      const unconfirmedCfg = { ...optCfg, status: 'aiDraft' };
      assert.throws(() => WordFiller.fillField(cell, unconf, unconfirmedCfg), /Cannot fill value. Status is not 'confirmed'/);
    });
  }

  await t.test('F. validation失敗時の非破壊性: 改行', () => {
    const doc = getFixture();
    const cell = FieldLocator.locateAdjacentCell(doc, '⑩代理人等氏名');
    const originalXml = serializer.serializeToString(cell);
    assert.throws(() => WordFiller.fillField(cell, '代理\n太郎', optCfg), /Value contains newline or tab/);
    assert.strictEqual(serializer.serializeToString(cell), originalXml);
  });
  await t.test('F. validation失敗時の非破壊性: タブ', () => {
    const doc = getFixture();
    const cell = FieldLocator.locateAdjacentCell(doc, '⑩代理人等氏名');
    const originalXml = serializer.serializeToString(cell);
    assert.throws(() => WordFiller.fillField(cell, '代理\t太郎', optCfg), /Value contains newline or tab/);
    assert.strictEqual(serializer.serializeToString(cell), originalXml);
  });
  await t.test('F. validation失敗時の非破壊性: 制御文字', () => {
    const doc = getFixture();
    const cell = FieldLocator.locateAdjacentCell(doc, '⑩代理人等氏名');
    const originalXml = serializer.serializeToString(cell);
    assert.throws(() => WordFiller.fillField(cell, '代理\x00太郎', optCfg), /Value contains control characters/);
    assert.strictEqual(serializer.serializeToString(cell), originalXml);
  });
  await t.test('F. validation失敗時の非破壊性: HTML/XMLタグ風文字列', () => {
    const doc = getFixture();
    const cell = FieldLocator.locateAdjacentCell(doc, '⑩代理人等氏名');
    const originalXml = serializer.serializeToString(cell);
    assert.throws(() => WordFiller.fillField(cell, '<w:t>代理</w:t>', optCfg), /Value contains HTML\/XML tags/);
    assert.strictEqual(serializer.serializeToString(cell), originalXml);
  });
  await t.test('F. validation失敗時の非破壊性: maxLength超過', () => {
    const doc = getFixture();
    const cell = FieldLocator.locateAdjacentCell(doc, '⑩代理人等氏名');
    const originalXml = serializer.serializeToString(cell);
    assert.throws(() => WordFiller.fillField(cell, 'a'.repeat(51), optCfg), /Value exceeds max length of 50/);
    assert.strictEqual(serializer.serializeToString(cell), originalXml);
  });
});

test('K. ⑪代理人等所在地検証ロジック', async (t) => {
  const { DOMParser } = await import('@xmldom/xmldom');
  const parser = new DOMParser();

  function getAddrFixture() {
    return parser.parseFromString(`
    <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
      <w:tbl>
        <w:tr>
          <w:tc>
            <w:tcPr><w:vMerge w:val="restart"/></w:tcPr>
            <w:p><w:r><w:t>⑪所在地</w:t></w:r></w:p>
          </w:tc>
          <w:tc><w:p><w:r><w:t>〒123-4567</w:t></w:r></w:p></w:tc>
        </w:tr>
        <w:tr>
          <w:tc>
            <w:tcPr><w:vMerge w:val="continue"/></w:tcPr>
            <w:p></w:p>
          </w:tc>
          <w:tc><w:p></w:p></w:tc>
        </w:tr>
      </w:tbl>
    </w:document>
    `, 'text/xml');
  }

  const baseConfig = careerUpR8Form1Mapping.fields.find(f => f.fieldId === 'agent_address');
  const config = { ...baseConfig, status: 'confirmed' };

  await t.test('正常系: 日本語住所', () => {
    const doc = getAddrFixture();
    const cell = FieldLocator.locateNextRowContinuationCell(doc, '⑪所在地');
    WordFiller.fillField(cell, '東京都新宿区', config);
    assert.strictEqual(FieldLocator.getCellText(cell), '東京都新宿区');
  });

  await t.test('異常系: 空文字は処理をスキップ', () => {
    const doc = getAddrFixture();
    const cell = FieldLocator.locateNextRowContinuationCell(doc, '⑪所在地');
    WordFiller.fillField(cell, '', config);
    assert.strictEqual(FieldLocator.getCellText(cell), '');
  });

  await t.test('異常系: ラベル未検出', () => {
    const doc = parser.parseFromString(`<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:tbl><w:tr></w:tr></w:tbl></w:document>`, 'text/xml');
    assert.throws(() => FieldLocator.locateNextRowContinuationCell(doc, '⑪所在地'), /Label "⑪所在地" not found/);
  });

  await t.test('異常系: ラベル重複', () => {
    const doc = parser.parseFromString(`<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:tbl><w:tr><w:tc><w:tcPr><w:vMerge w:val="restart"/></w:tcPr><w:p><w:r><w:t>⑪所在地</w:t></w:r></w:p></w:tc></w:tr><w:tr><w:tc><w:tcPr><w:vMerge w:val="continue"/></w:tcPr><w:p></w:p></w:tc></w:tr><w:tr><w:tc><w:tcPr><w:vMerge w:val="restart"/></w:tcPr><w:p><w:r><w:t>⑪所在地</w:t></w:r></w:p></w:tc></w:tr><w:tr><w:tc><w:tcPr><w:vMerge w:val="continue"/></w:tcPr><w:p></w:p></w:tc></w:tr></w:tbl></w:document>`, 'text/xml');
    assert.throws(() => FieldLocator.locateNextRowContinuationCell(doc, '⑪所在地'), /Label "⑪所在地" found multiple times/);
  });
});

test('L. ⑫代理人等電話番号検証ロジック', async (t) => {
  const { DOMParser } = await import('@xmldom/xmldom');
  const parser = new DOMParser();

  function getPhoneFixture() {
    return parser.parseFromString(`
    <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
      <w:tbl>
        <w:tr>
          <w:tc>
            <w:p><w:r><w:t>⑫電話番号</w:t></w:r></w:p>
          </w:tc>
          <w:tc>
            <w:p><w:r><w:t>(   )</w:t></w:r></w:p>
          </w:tc>
        </w:tr>
      </w:tbl>
    </w:document>
    `, 'text/xml');
  }

  const baseConfig = careerUpR8Form1Mapping.fields.find(f => f.fieldId === 'agent_phone_number');
  const config = { ...baseConfig, status: 'confirmed' };

  await t.test('正常系: 電話番号入力', () => {
    const doc = getPhoneFixture();
    const cell = FieldLocator.locateAdjacentCell(doc, '⑫電話番号');
    WordFiller.fillField(cell, '03-1234-5678', config);
    assert.strictEqual(FieldLocator.getCellText(cell), '03-1234-5678');
  });

  await t.test('異常系: 空文字は処理をスキップ', () => {
    const doc = getPhoneFixture();
    const cell = FieldLocator.locateAdjacentCell(doc, '⑫電話番号');
    WordFiller.fillField(cell, '', config);
    assert.strictEqual(FieldLocator.getCellText(cell), '(   )');
  });

  await t.test('異常系: ラベル未検出', () => {
    const doc = parser.parseFromString(`<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:tbl><w:tr></w:tr></w:tbl></w:document>`, 'text/xml');
    assert.throws(() => FieldLocator.locateAdjacentCell(doc, '⑫電話番号'), /Label "⑫電話番号" not found/);
  });

  await t.test('異常系: ラベル重複', () => {
    const doc = parser.parseFromString(`<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:tbl><w:tr><w:tc><w:p><w:r><w:t>⑫電話番号</w:t></w:r></w:p></w:tc><w:tc></w:tc></w:tr><w:tr><w:tc><w:p><w:r><w:t>⑫電話番号</w:t></w:r></w:p></w:tc><w:tc></w:tc></w:tr></w:tbl></w:document>`, 'text/xml');
    assert.throws(() => FieldLocator.locateAdjacentCell(doc, '⑫電話番号'), /Label "⑫電話番号" found multiple times/);
  });
});

test('M. 管理者氏名・文字列維持ロジック', async (t) => {
  const parser = new DOMParser();
  const serializer = new XMLSerializer();
  const tcXml = `<w:tc xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:r><w:t>（氏　名）：　　</w:t></w:r></w:p></w:tc>`;
  const config = {
    status: 'confirmed',
    inputMode: 'text-preserve-prefix',
    preserve: { prefixText: '（氏　名）：' },
    validation: { required: true, rejectEmpty: true, maxLength: 30, rejectInvalidChars: true }
  };

  await t.test('正常系: 日本語氏名', () => {
    const doc = parser.parseFromString(tcXml, 'text/xml');
    WordFiller.fillField(doc.documentElement, '管理 花子', config);
    const xml = serializer.serializeToString(doc);
    assert.match(xml, /管理 花子/);
  });

  await t.test('異常系: 空文字', () => {
    const doc = parser.parseFromString(tcXml, 'text/xml');
    assert.throws(() => WordFiller.fillField(doc.documentElement, '', config), /Value is empty/);
    assert.strictEqual(serializer.serializeToString(doc), tcXml);
  });
});

test('N. 日付維持ロジック', async (t) => {
  const parser = new DOMParser();
  const serializer = new XMLSerializer();
  const tcXml = `<w:tc xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:r><w:t>　年　　月　　日</w:t></w:r></w:p></w:tc>`;
  const config = {
    status: 'confirmed',
    inputMode: 'date-preserve-tokens',
    preserve: { yearToken: '年', monthToken: '月', dayToken: '日' },
    format: { yearDigits: 4, padMonth: false, padDay: false },
    validation: { required: true, rejectEmpty: true, inputFormat: 'YYYY-MM-DD' }
  };

  await t.test('正常系: 通常日', () => {
    const doc = parser.parseFromString(tcXml, 'text/xml');
    WordFiller.fillField(doc.documentElement, '2026-07-14', config);
    const xml = serializer.serializeToString(doc);
    assert.match(xml, /2026/);
    assert.match(xml, /7/);
    assert.match(xml, /14/);
  });

  await t.test('異常系: 実在しない日付', () => {
    const doc = parser.parseFromString(tcXml, 'text/xml');
    assert.throws(() => WordFiller.fillField(doc.documentElement, '2026-02-30', config), /Invalid day/);
    assert.strictEqual(serializer.serializeToString(doc), tcXml);
  });
});
