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

test('O. SDT Checkbox ロジック', async (t) => {
  const parser = new DOMParser();
  const serializer = new XMLSerializer();
  const tcXml = `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"><w:tbl><w:tr><w:tc>
    <w:p>
      <w:sdt>
        <w:sdtPr>
          <w14:checkbox>
            <w14:checked w14:val="0"/>
            <w14:checkedState w14:val="00FE" w14:font="Wingdings"/>
            <w14:uncheckedState w14:val="2610" w14:font="ＭＳ ゴシック"/>
          </w14:checkbox>
        </w:sdtPr>
        <w:sdtContent>
          <w:r><w:rPr><w:rFonts w:ascii="ＭＳ ゴシック" w:eastAsia="ＭＳ ゴシック" w:hAnsi="ＭＳ ゴシック"/></w:rPr><w:t>☐</w:t></w:r>
        </w:sdtContent>
      </w:sdt>
      <w:r><w:t>事業主又は役員である</w:t></w:r>
    </w:p>
    <w:p>
      <w:sdt>
        <w:sdtPr>
          <w14:checkbox>
            <w14:checked w14:val="0"/>
            <w14:checkedState w14:val="00FE" w14:font="Wingdings"/>
            <w14:uncheckedState w14:val="2610" w14:font="ＭＳ ゴシック"/>
          </w14:checkbox>
        </w:sdtPr>
        <w:sdtContent>
          <w:r><w:rPr><w:rFonts w:ascii="ＭＳ ゴシック" w:eastAsia="ＭＳ ゴシック" w:hAnsi="ＭＳ ゴシック"/></w:rPr><w:t>☐</w:t></w:r>
        </w:sdtContent>
      </w:sdt>
      <w:r><w:t>事業主又は役員ではない</w:t></w:r>
    </w:p>
    <w:p><w:r><w:t>当てはまる方に☑をしてください</w:t></w:r></w:p>
  </w:tc></w:tr></w:tbl></w:document>`;

  const locatorConfig = {
    type: 'sdt-checkbox-group',
    groupContextText: '当てはまる方に☑をしてください',
    optionContextMode: 'adjacent-text'
  };

  const selectionConfig = {
    mode: 'single',
    options: [
      { value: '事業主又は役員', contextText: '事業主又は役員である' },
      { value: '役員でない', contextText: '事業主又は役員ではない' }
    ],
    clearUnselected: true
  };

  const { SdtCheckboxLocator } = await import('../core/sdt-checkbox-locator.mjs');
  const { SdtCheckboxFiller } = await import('../core/sdt-checkbox-filler.mjs');

  await t.test('Locator正常系: グループ特定', () => {
    const doc = parser.parseFromString(tcXml, 'text/xml');
    const groupInfo = SdtCheckboxLocator.locateGroup(doc, locatorConfig, selectionConfig);
    assert.strictEqual(groupInfo.options.length, 2);
    assert.strictEqual(groupInfo.options[0].value, '事業主又は役員');
    assert.strictEqual(groupInfo.options[0].checked, false);
  });

  await t.test('Locator異常系: グループ未検出', () => {
    const doc = parser.parseFromString(tcXml.replace('当てはまる方に☑をしてください', 'なし'), 'text/xml');
    assert.throws(() => SdtCheckboxLocator.locateGroup(doc, locatorConfig, selectionConfig), /not found in any cell/);
  });

  await t.test('Filler正常系: 1つ目を選択', () => {
    const doc = parser.parseFromString(tcXml, 'text/xml');
    const groupInfo = SdtCheckboxLocator.locateGroup(doc, locatorConfig, selectionConfig);
    SdtCheckboxFiller.fillGroup(groupInfo, '事業主又は役員', selectionConfig, 'confirmed');

    const updatedGroupInfo = SdtCheckboxLocator.locateGroup(doc, locatorConfig, selectionConfig);
    assert.strictEqual(updatedGroupInfo.options[0].checked, true);
    assert.strictEqual(updatedGroupInfo.options[1].checked, false);

    const tNodes = Array.from(updatedGroupInfo.options[0].sdtNode.getElementsByTagName('w:t'));
    assert.strictEqual(tNodes[0].textContent, String.fromCharCode(parseInt('00FE', 16)));
  });

  await t.test('Filler異常系: 空文字', () => {
    const doc = parser.parseFromString(tcXml, 'text/xml');
    const groupInfo = SdtCheckboxLocator.locateGroup(doc, locatorConfig, selectionConfig);
    assert.throws(() => SdtCheckboxFiller.fillGroup(groupInfo, '', selectionConfig, 'confirmed'), /Value is empty/);
  });

  await t.test('Filler異常系: 未confirmed', () => {
    const doc = parser.parseFromString(tcXml, 'text/xml');
    const groupInfo = SdtCheckboxLocator.locateGroup(doc, locatorConfig, selectionConfig);
    assert.throws(() => SdtCheckboxFiller.fillGroup(groupInfo, '事業主又は役員', selectionConfig, 'pending'), /is not confirmed/);
  });
  await t.test('Locator: option[1]を特定できる', () => {
    const doc = parser.parseFromString(tcXml, 'text/xml');
    const groupInfo = SdtCheckboxLocator.locateGroup(doc, locatorConfig, selectionConfig);
    assert.strictEqual(groupInfo.options[1].value, '役員でない');
    assert.strictEqual(groupInfo.options[1].checked, false);
  });

  await t.test('Locator: SDT数とoption数不一致でエラー', () => {
    const doc = parser.parseFromString(tcXml, 'text/xml');
    const badConfig = { ...selectionConfig, options: [{ value: '事業主又は役員', contextText: '事業主又は役員である' }] };
    assert.throws(() => SdtCheckboxLocator.locateGroup(doc, locatorConfig, badConfig), /does not match mapped options count/);
  });

  await t.test('Filler: option[1]を選択（2つ目）', () => {
    const doc = parser.parseFromString(tcXml, 'text/xml');
    const groupInfo = SdtCheckboxLocator.locateGroup(doc, locatorConfig, selectionConfig);
    SdtCheckboxFiller.fillGroup(groupInfo, '役員でない', selectionConfig, 'confirmed');
    const updatedGroupInfo = SdtCheckboxLocator.locateGroup(doc, locatorConfig, selectionConfig);
    assert.strictEqual(updatedGroupInfo.options[0].checked, false);
    assert.strictEqual(updatedGroupInfo.options[1].checked, true);
  });

  await t.test('Filler: 1→2の選択変更（clearUnselected後の切り替え確認）', () => {
    const doc = parser.parseFromString(tcXml, 'text/xml');
    let groupInfo = SdtCheckboxLocator.locateGroup(doc, locatorConfig, selectionConfig);
    SdtCheckboxFiller.fillGroup(groupInfo, '事業主又は役員', selectionConfig, 'confirmed');
    groupInfo = SdtCheckboxLocator.locateGroup(doc, locatorConfig, selectionConfig);
    SdtCheckboxFiller.fillGroup(groupInfo, '役員でない', selectionConfig, 'confirmed');
    const updatedGroupInfo = SdtCheckboxLocator.locateGroup(doc, locatorConfig, selectionConfig);
    assert.strictEqual(updatedGroupInfo.options[0].checked, false);
    assert.strictEqual(updatedGroupInfo.options[1].checked, true);
  });

  await t.test('Filler: 未定義値でエラー・DOM変更なし', () => {
    const doc = parser.parseFromString(tcXml, 'text/xml');
    const groupInfo = SdtCheckboxLocator.locateGroup(doc, locatorConfig, selectionConfig);
    const beforeXml = serializer.serializeToString(doc);
    assert.throws(() => SdtCheckboxFiller.fillGroup(groupInfo, '存在しない値', selectionConfig, 'confirmed'), /is not a valid option/);
    const afterXml = serializer.serializeToString(doc);
    assert.strictEqual(beforeXml, afterXml);
  });

  await t.test('Filler: 配列渡し(単一選択)でエラー・DOM変更なし', () => {
    const doc = parser.parseFromString(tcXml, 'text/xml');
    const groupInfo = SdtCheckboxLocator.locateGroup(doc, locatorConfig, selectionConfig);
    const beforeXml = serializer.serializeToString(doc);
    assert.throws(() => SdtCheckboxFiller.fillGroup(groupInfo, ['事業主又は役員'], selectionConfig, 'confirmed'), /Single selection mode received array/);
    const afterXml = serializer.serializeToString(doc);
    assert.strictEqual(beforeXml, afterXml);
  });

  await t.test('Filler: sdtContent欠損SDTで例外発生', () => {
    const badXml = tcXml.replace(/<w:sdtContent>[\s\S]*?<\/w:sdtContent>/, ''); // remove the first one
    const doc = parser.parseFromString(badXml, 'text/xml');
    const groupInfo = SdtCheckboxLocator.locateGroup(doc, locatorConfig, selectionConfig);
    assert.throws(() => SdtCheckboxFiller.fillGroup(groupInfo, '事業主又は役員', selectionConfig, 'confirmed'), /has no w:sdtContent/);
  });

  await t.test('Filler: w14:checkbox欠損SDTで例外発生', () => {
    const doc = parser.parseFromString(tcXml, 'text/xml');
    const groupInfo = SdtCheckboxLocator.locateGroup(doc, locatorConfig, selectionConfig);
    const cb = groupInfo.options[0].sdtNode.getElementsByTagName('w14:checkbox')[0];
    cb.parentNode.removeChild(cb);
    assert.throws(() => SdtCheckboxFiller.fillGroup(groupInfo, '事業主又は役員', selectionConfig, 'confirmed'), /has no w14:checkbox/);
  });

  await t.test('対象以外のSDTが変化しないこと', () => {
    const multiXml = `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"><w:tbl><w:tr><w:tc>
      <w:p>
        <w:sdt><w:sdtPr><w14:checkbox><w14:checked w14:val="0"/><w14:checkedState w14:val="00FE" w14:font="Wingdings"/><w14:uncheckedState w14:val="2610" w14:font="ＭＳ ゴシック"/></w14:checkbox></w:sdtPr><w:sdtContent><w:r><w:t>☐</w:t></w:r></w:sdtContent></w:sdt>
        <w:r><w:t>対象外</w:t></w:r>
      </w:p>
    </w:tc></w:tr></w:tbl>${tcXml.replace('<w:document', '<w:body').replace('</w:document>', '</w:body>')}</w:document>`;
    const doc = parser.parseFromString(multiXml, 'text/xml');
    const groupInfo = SdtCheckboxLocator.locateGroup(doc, locatorConfig, selectionConfig);
    SdtCheckboxFiller.fillGroup(groupInfo, '事業主又は役員', selectionConfig, 'confirmed');
    const sdts = doc.getElementsByTagName('w:sdt');
    const outCb0 = sdts[0].getElementsByTagName('w14:checked')[0].getAttribute('w14:val');
    assert.strictEqual(outCb0, '0', 'Target-outside SDT should remain unchecked');
  });

  await t.test('Locator: checked=1の場合にchecked=trueを返す', () => {
    const checkedXml = tcXml.replace('<w14:checked w14:val="0"/>', '<w14:checked w14:val="1"/>');
    const doc = parser.parseFromString(checkedXml, 'text/xml');
    const groupInfo = SdtCheckboxLocator.locateGroup(doc, locatorConfig, selectionConfig);
    assert.strictEqual(groupInfo.options[0].checked, true);
  });

  await t.test('Filler: null値でエラー', () => {
    const doc = parser.parseFromString(tcXml, 'text/xml');
    const groupInfo = SdtCheckboxLocator.locateGroup(doc, locatorConfig, selectionConfig);
    assert.throws(() => SdtCheckboxFiller.fillGroup(groupInfo, null, selectionConfig, 'confirmed'), /Value is empty/);
  });

  await t.test('Filler: undefined値でエラー', () => {
    const doc = parser.parseFromString(tcXml, 'text/xml');
    const groupInfo = SdtCheckboxLocator.locateGroup(doc, locatorConfig, selectionConfig);
    assert.throws(() => SdtCheckboxFiller.fillGroup(groupInfo, undefined, selectionConfig, 'confirmed'), /Value is empty/);
  });

  await t.test('Filler: 非文字列（数値0）でエラー', () => {
    const doc = parser.parseFromString(tcXml, 'text/xml');
    const groupInfo = SdtCheckboxLocator.locateGroup(doc, locatorConfig, selectionConfig);
    assert.throws(() => SdtCheckboxFiller.fillGroup(groupInfo, 0, selectionConfig, 'confirmed'), /is not a valid option/);
  });

  await t.test('Filler: 冪等性（同値2回実行）', () => {
    const doc = parser.parseFromString(tcXml, 'text/xml');
    let groupInfo = SdtCheckboxLocator.locateGroup(doc, locatorConfig, selectionConfig);
    SdtCheckboxFiller.fillGroup(groupInfo, '事業主又は役員', selectionConfig, 'confirmed');
    groupInfo = SdtCheckboxLocator.locateGroup(doc, locatorConfig, selectionConfig);
    SdtCheckboxFiller.fillGroup(groupInfo, '事業主又は役員', selectionConfig, 'confirmed');
    const updatedGroupInfo = SdtCheckboxLocator.locateGroup(doc, locatorConfig, selectionConfig);
    assert.strictEqual(updatedGroupInfo.options[0].checked, true);
    assert.strictEqual(updatedGroupInfo.options[1].checked, false);
  });

  await t.test('シリアライズ後再パースで状態維持', () => {
    const doc = parser.parseFromString(tcXml, 'text/xml');
    const groupInfo = SdtCheckboxLocator.locateGroup(doc, locatorConfig, selectionConfig);
    SdtCheckboxFiller.fillGroup(groupInfo, '事業主又は役員', selectionConfig, 'confirmed');
    const xml = serializer.serializeToString(doc);
    const doc2 = parser.parseFromString(xml, 'text/xml');
    const groupInfo2 = SdtCheckboxLocator.locateGroup(doc2, locatorConfig, selectionConfig);
    assert.strictEqual(groupInfo2.options[0].checked, true);
  });

  const multiSelectionConfig = {
    mode: 'multi',
    options: [
      { value: 'A', contextText: '事業主又は役員である' },
      { value: 'B', contextText: '事業主又は役員ではない' }
    ],
    clearUnselected: true,
    minSelections: 1,
    maxSelections: 2
  };

  await t.test('複数選択: 0件でrequired時エラー', () => {
    const doc = parser.parseFromString(tcXml, 'text/xml');
    const groupInfo = SdtCheckboxLocator.locateGroup(doc, locatorConfig, multiSelectionConfig);
    assert.throws(() => SdtCheckboxFiller.fillGroup(groupInfo, [], multiSelectionConfig, 'confirmed'), /below minimum/);
  });

  await t.test('複数選択: 1件選択', () => {
    const doc = parser.parseFromString(tcXml, 'text/xml');
    const groupInfo = SdtCheckboxLocator.locateGroup(doc, locatorConfig, multiSelectionConfig);
    SdtCheckboxFiller.fillGroup(groupInfo, ['A'], multiSelectionConfig, 'confirmed');
    const updatedGroupInfo = SdtCheckboxLocator.locateGroup(doc, locatorConfig, multiSelectionConfig);
    assert.strictEqual(updatedGroupInfo.options[0].checked, true);
    assert.strictEqual(updatedGroupInfo.options[1].checked, false);
  });

  await t.test('複数選択: 2件選択', () => {
    const doc = parser.parseFromString(tcXml, 'text/xml');
    const groupInfo = SdtCheckboxLocator.locateGroup(doc, locatorConfig, multiSelectionConfig);
    SdtCheckboxFiller.fillGroup(groupInfo, ['A', 'B'], multiSelectionConfig, 'confirmed');
    const updatedGroupInfo = SdtCheckboxLocator.locateGroup(doc, locatorConfig, multiSelectionConfig);
    assert.strictEqual(updatedGroupInfo.options[0].checked, true);
    assert.strictEqual(updatedGroupInfo.options[1].checked, true);
  });

  await t.test('複数選択: 重複値エラー', () => {
    const doc = parser.parseFromString(tcXml, 'text/xml');
    const groupInfo = SdtCheckboxLocator.locateGroup(doc, locatorConfig, multiSelectionConfig);
    assert.throws(() => SdtCheckboxFiller.fillGroup(groupInfo, ['A', 'A'], multiSelectionConfig, 'confirmed'), /Duplicate values/);
  });

  await t.test('複数選択: 未定義値混入エラー', () => {
    const doc = parser.parseFromString(tcXml, 'text/xml');
    const groupInfo = SdtCheckboxLocator.locateGroup(doc, locatorConfig, multiSelectionConfig);
    assert.throws(() => SdtCheckboxFiller.fillGroup(groupInfo, ['A', 'C'], multiSelectionConfig, 'confirmed'), /is not a valid option/);
  });

  await t.test('複数選択: clearUnselected動作確認', () => {
    const doc = parser.parseFromString(tcXml, 'text/xml');
    let groupInfo = SdtCheckboxLocator.locateGroup(doc, locatorConfig, multiSelectionConfig);
    SdtCheckboxFiller.fillGroup(groupInfo, ['A', 'B'], multiSelectionConfig, 'confirmed');
    groupInfo = SdtCheckboxLocator.locateGroup(doc, locatorConfig, multiSelectionConfig);
    SdtCheckboxFiller.fillGroup(groupInfo, ['A'], multiSelectionConfig, 'confirmed');
    const updatedGroupInfo = SdtCheckboxLocator.locateGroup(doc, locatorConfig, multiSelectionConfig);
    assert.strictEqual(updatedGroupInfo.options[0].checked, true);
    assert.strictEqual(updatedGroupInfo.options[1].checked, false);
  });
});

test('P. OutputVerifier SDT Verification', async (t) => {
  const { OutputVerifier } = await import('../core/output-verifier.mjs');
  const { SdtCheckboxFiller } = await import('../core/sdt-checkbox-filler.mjs');
  const { SdtCheckboxLocator } = await import('../core/sdt-checkbox-locator.mjs');
  const { DOMParser, XMLSerializer } = await import('@xmldom/xmldom');
  const PizZip = (await import('pizzip')).default;
  const { careerUpR8Form1Mapping } = await import('../config/career-up-r8-form1.mapping.mjs');
  const crypto = await import('crypto');

  const inputPath = '/Users/to/Documents/practice-assistant-input/001688046.docx';
  const originalBuffer = fs.readFileSync(inputPath);
  const expectedSha256 = crypto.createHash('sha256').update(originalBuffer).digest('hex');

  // Single selection scenario (G3 manager role)
  const fManagerRole = careerUpR8Form1Mapping.fields.find(f => f.fieldId === 'career_up_manager_role_type');
  // Multi selection scenario (G12 wage increase)
  const fWageInc = careerUpR8Form1Mapping.fields.find(f => f.fieldId === 'wage_increase_rate');
  // 複数選択テストのために一時的にmultiモードに変更
  fWageInc.selection.mode = 'multi';

  // Single selection clearUnselected: false (G1)
  const fWorkerConsent = careerUpR8Form1Mapping.fields.find(f => f.fieldId === 'worker_representative_consent');

  const tempOutputPath = '/tmp/practice-assistant-test-output.docx';

  await t.test('1. 単一選択で指定optionがcheckedならPASS, 2. 単一選択で非選択optionがuncheckedならPASS', async () => {
    const zip = new PizZip(originalBuffer);
    const xml = zip.file('word/document.xml').asText();
    const docDom = new DOMParser().parseFromString(xml, 'text/xml');

    const groupInfo = SdtCheckboxLocator.locateGroup(docDom, fManagerRole.locator, fManagerRole.selection);
    SdtCheckboxFiller.fillGroup(groupInfo, '役員でない', fManagerRole.selection, 'confirmed');

    const outZip = new PizZip(originalBuffer);
    outZip.file('word/document.xml', new XMLSerializer().serializeToString(docDom));
    fs.writeFileSync(tempOutputPath, outZip.generate({ type: 'nodebuffer', compression: 'DEFLATE' }));

    await assert.doesNotReject(OutputVerifier.verify(originalBuffer, tempOutputPath, expectedSha256, {
      career_up_manager_role_type: '役員でない'
    }));
  });

  await t.test('3. 複数選択で指定した全optionがcheckedならPASS, 4. 未指定optionがuncheckedならPASS', async () => {
    const zip = new PizZip(originalBuffer);
    const xml = zip.file('word/document.xml').asText();
    const docDom = new DOMParser().parseFromString(xml, 'text/xml');

    const groupInfo = SdtCheckboxLocator.locateGroup(docDom, fWageInc.locator, fWageInc.selection);
    SdtCheckboxFiller.fillGroup(groupInfo, ['3%以上4%未満', '5%以上6%未満'], fWageInc.selection, 'confirmed');

    const outZip = new PizZip(originalBuffer);
    outZip.file('word/document.xml', new XMLSerializer().serializeToString(docDom));
    fs.writeFileSync(tempOutputPath, outZip.generate({ type: 'nodebuffer', compression: 'DEFLATE' }));

    await assert.doesNotReject(OutputVerifier.verify(originalBuffer, tempOutputPath, expectedSha256, {
      wage_increase_rate: ['3%以上4%未満', '5%以上6%未満']
    }));
  });

  await t.test('6. 1択グループ・clearUnselected: falseでPASS', async () => {
    const zip = new PizZip(originalBuffer);
    const xml = zip.file('word/document.xml').asText();
    const docDom = new DOMParser().parseFromString(xml, 'text/xml');

    const groupInfo = SdtCheckboxLocator.locateGroup(docDom, fWorkerConsent.locator, fWorkerConsent.selection);
    SdtCheckboxFiller.fillGroup(groupInfo, 'はい', fWorkerConsent.selection, 'confirmed');

    const outZip = new PizZip(originalBuffer);
    outZip.file('word/document.xml', new XMLSerializer().serializeToString(docDom));
    fs.writeFileSync(tempOutputPath, outZip.generate({ type: 'nodebuffer', compression: 'DEFLATE' }));

    await assert.doesNotReject(OutputVerifier.verify(originalBuffer, tempOutputPath, expectedSha256, {
      worker_representative_consent: 'はい'
    }));
  });

  await t.test('最重要回帰テスト(異常系1, 2, 5): 出力DOMの対象SDTを意図的に誤状態へ改ざん → FAIL', async () => {
    const zip = new PizZip(originalBuffer);
    const xml = zip.file('word/document.xml').asText();
    const docDom = new DOMParser().parseFromString(xml, 'text/xml');

    // Fillerを正常実行
    const groupInfo = SdtCheckboxLocator.locateGroup(docDom, fManagerRole.locator, fManagerRole.selection);
    SdtCheckboxFiller.fillGroup(groupInfo, '役員でない', fManagerRole.selection, 'confirmed');

    // 意図的に誤状態へ改ざん (事業主又は役員をcheckedにする)
    const wrongGroupInfo = SdtCheckboxLocator.locateGroup(docDom, fManagerRole.locator, fManagerRole.selection);
    const optWrong = wrongGroupInfo.options.find(o => o.value === '事業主又は役員');
    const cb = optWrong.sdtNode.getElementsByTagName('w14:checkbox')[0];
    cb.getElementsByTagName('w14:checked')[0].setAttribute('w14:val', '1');

    const outZip = new PizZip(originalBuffer);
    outZip.file('word/document.xml', new XMLSerializer().serializeToString(docDom));
    fs.writeFileSync(tempOutputPath, outZip.generate({ type: 'nodebuffer', compression: 'DEFLATE' }));

    // 修正前はPASSしていたが、修正後はFAILする
    await assert.rejects(
      OutputVerifier.verify(originalBuffer, tempOutputPath, expectedSha256, { career_up_manager_role_type: '役員でない' }),
      /Expected 1 checked, found 2/
    );
  });

  await t.test('異常系3: 単一選択で複数optionがcheckedの場合にFAIL', async () => {
    const zip = new PizZip(originalBuffer);
    const xml = zip.file('word/document.xml').asText();
    const docDom = new DOMParser().parseFromString(xml, 'text/xml');

    const groupInfo = SdtCheckboxLocator.locateGroup(docDom, fManagerRole.locator, fManagerRole.selection);
    SdtCheckboxFiller.fillGroup(groupInfo, '役員でない', fManagerRole.selection, 'confirmed');

    // 改ざん: もう一つcheckedにする
    const optWrong = groupInfo.options.find(o => o.value === '事業主又は役員');
    const cb = optWrong.sdtNode.getElementsByTagName('w14:checkbox')[0];
    cb.getElementsByTagName('w14:checked')[0].setAttribute('w14:val', '1');
    const checkedState = cb.getElementsByTagName('w14:checkedState')[0].getAttribute('w14:val');
    optWrong.sdtNode.getElementsByTagName('w:t')[0].textContent = String.fromCharCode(parseInt(checkedState, 16));

    const outZip = new PizZip(originalBuffer);
    outZip.file('word/document.xml', new XMLSerializer().serializeToString(docDom));
    fs.writeFileSync(tempOutputPath, outZip.generate({ type: 'nodebuffer', compression: 'DEFLATE' }));

    await assert.rejects(
      OutputVerifier.verify(originalBuffer, tempOutputPath, expectedSha256, { career_up_manager_role_type: '役員でない' }),
      /Expected 1 checked, found 2 for "career_up_manager_role_type"/
    );
  });

  await t.test('異常系4: 複数選択で一部optionが未checkedの場合にFAIL', async () => {
    const zip = new PizZip(originalBuffer);
    const xml = zip.file('word/document.xml').asText();
    const docDom = new DOMParser().parseFromString(xml, 'text/xml');

    const groupInfo = SdtCheckboxLocator.locateGroup(docDom, fWageInc.locator, fWageInc.selection);
    SdtCheckboxFiller.fillGroup(groupInfo, ['3%以上4%未満', '5%以上6%未満'], fWageInc.selection, 'confirmed');

    // 改ざん: 3%以上をuncheckedに戻す
    const optToUncheck = groupInfo.options.find(o => o.value === '3%以上4%未満');
    const cb = optToUncheck.sdtNode.getElementsByTagName('w14:checkbox')[0];
    cb.getElementsByTagName('w14:checked')[0].setAttribute('w14:val', '0');

    const outZip = new PizZip(originalBuffer);
    outZip.file('word/document.xml', new XMLSerializer().serializeToString(docDom));
    fs.writeFileSync(tempOutputPath, outZip.generate({ type: 'nodebuffer', compression: 'DEFLATE' }));

    await assert.rejects(
      OutputVerifier.verify(originalBuffer, tempOutputPath, expectedSha256, { wage_increase_rate: ['3%以上4%未満', '5%以上6%未満'] }),
      /Expected 2 checked, found 1 for "wage_increase_rate"/
    );
  });

  await t.test('異常系6, 7: w14:checked=1だが表示文字がunchecked文字の場合にFAIL', async () => {
    const zip = new PizZip(originalBuffer);
    const xml = zip.file('word/document.xml').asText();
    const docDom = new DOMParser().parseFromString(xml, 'text/xml');

    const groupInfo = SdtCheckboxLocator.locateGroup(docDom, fWorkerConsent.locator, fWorkerConsent.selection);
    SdtCheckboxFiller.fillGroup(groupInfo, 'はい', fWorkerConsent.selection, 'confirmed');

    // 改ざん: 表示文字をuncheckedの文字に戻す
    const opt = groupInfo.options[0];
    const cb = opt.sdtNode.getElementsByTagName('w14:checkbox')[0];
    const uncheckedState = cb.getElementsByTagName('w14:uncheckedState')[0].getAttribute('w14:val');
    opt.sdtNode.getElementsByTagName('w:t')[0].textContent = String.fromCharCode(parseInt(uncheckedState, 16));

    const outZip = new PizZip(originalBuffer);
    outZip.file('word/document.xml', new XMLSerializer().serializeToString(docDom));
    fs.writeFileSync(tempOutputPath, outZip.generate({ type: 'nodebuffer', compression: 'DEFLATE' }));

    await assert.rejects(
      OutputVerifier.verify(originalBuffer, tempOutputPath, expectedSha256, { worker_representative_consent: 'はい' }),
      /sdtContent display char mismatch/
    );
  });

  await t.test('異常系8: 未定義option値の場合にFAIL', async () => {
    const zip = new PizZip(originalBuffer);
    const xml = zip.file('word/document.xml').asText();
    const docDom = new DOMParser().parseFromString(xml, 'text/xml');

    const groupInfo = SdtCheckboxLocator.locateGroup(docDom, fManagerRole.locator, fManagerRole.selection);
    SdtCheckboxFiller.fillGroup(groupInfo, '役員でない', fManagerRole.selection, 'confirmed');

    const outZip = new PizZip(originalBuffer);
    outZip.file('word/document.xml', new XMLSerializer().serializeToString(docDom));
    fs.writeFileSync(tempOutputPath, outZip.generate({ type: 'nodebuffer', compression: 'DEFLATE' }));

    await assert.rejects(
      OutputVerifier.verify(originalBuffer, tempOutputPath, expectedSha256, { career_up_manager_role_type: '存在しない役職' }),
      /not found in options for/
    );
  });
});

test('Q. Phase G5A Mapping Uniqueness Tests', async (t) => {
  const fs = await import('node:fs');
  const PizZip = (await import('pizzip')).default;
  const { DOMParser } = await import('@xmldom/xmldom');
  const { careerUpR8Form1Mapping } = await import('../config/career-up-r8-form1.mapping.mjs');

  const inputPath = '/Users/to/Documents/practice-assistant-input/001688046.docx';
  const originalBuffer = fs.readFileSync(inputPath);
  const zip = new PizZip(originalBuffer);
  const xml = zip.file('word/document.xml').asText();
  const docDom = new DOMParser().parseFromString(xml, 'text/xml');

  const g5aFieldIds = ['regularization_candidates', 'regularization_goals', 'disability_regularization_targets'];

  for (const fieldId of g5aFieldIds) {
    await t.test(`G5A mapping tests for: ${fieldId}`, async () => {
      const field = careerUpR8Form1Mapping.fields.find(f => f.fieldId === fieldId);
      assert.ok(field, `Field ${fieldId} should exist in mapping`);

      // 1. groupContextTextが原本で1セルだけに一致
      const cells = Array.from(docDom.getElementsByTagName('w:tc'));
      const matchingCells = cells.filter(cell => cell.textContent.includes(field.locator.groupContextText));
      assert.strictEqual(matchingCells.length, 1, `groupContextText "${field.locator.groupContextText}" should match exactly 1 cell, found ${matchingCells.length}`);

      // 2. options数とSDT数が一致
      const targetCell = matchingCells[0];
      const sdtsInCell = Array.from(targetCell.getElementsByTagName('w:sdt'));
      assert.strictEqual(sdtsInCell.length, field.selection.options.length, `Number of SDTs (${sdtsInCell.length}) should match number of options (${field.selection.options.length})`);

      // 3. 各contextTextがグループ内で1件だけに一致
      // 4. 同一SDTへ複数optionが一致しない
      // 5. 全optionが異なるSDTへ割り当てられる
      const matchedSdts = new Set();
      for (const option of field.selection.options) {
        const optionMatchingSdts = sdtsInCell.filter(sdt => {
          let parentP = sdt.parentNode;
          while (parentP && parentP.tagName !== 'w:p') parentP = parentP.parentNode;
          const textToSearch = parentP ? parentP.textContent : sdt.textContent;
          return textToSearch.includes(option.contextText);
        });

        assert.strictEqual(optionMatchingSdts.length, 1, `option.contextText "${option.contextText}" should match exactly 1 SDT, found ${optionMatchingSdts.length}`);

        const matchedSdt = optionMatchingSdts[0];
        assert.ok(!matchedSdts.has(matchedSdt), `SDT matched by "${option.contextText}" was already matched by another option`);
        matchedSdts.add(matchedSdt);
      }

      assert.strictEqual(matchedSdts.size, field.selection.options.length, 'All options should be assigned to unique SDTs');
    });
  }
});

