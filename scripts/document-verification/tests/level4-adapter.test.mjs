import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import { DOMParser } from '@xmldom/xmldom';
import { DocumentInputAdapter } from '../../../src/lib/document-generation/adapter.ts';

test('Level 4-A Adapter Tests', async (t) => {
  await t.test('verified / modified are exported, others are ignored', () => {
    const caseData = {
      extractedItems: [
        { id: 'v1', status: 'verified', content: 'hello' },
        { id: 'm1', status: 'modified', content: 'world' },
        { id: 'u1', status: 'unverified', content: 'test' },
        { id: 'r1', status: 'rejected', content: 'test2' },
        { id: 'u2', status: 'unknown', content: 'test3' },
        { id: 'n1', status: 'verified', content: null },
        { id: 'n2', status: 'verified', content: undefined },
        { id: 'e1', status: 'verified', content: '' },
        { id: 'e2', status: 'verified', content: '   ' }
      ]
    };
    const inputs = DocumentInputAdapter.extractVerifiedInputs(caseData);
    assert.strictEqual(inputs['v1'], 'hello');
    assert.strictEqual(inputs['m1'], 'world');
    assert.strictEqual(inputs['u1'], undefined);
    assert.strictEqual(inputs['r1'], undefined);
    assert.strictEqual(inputs['u2'], undefined);
    assert.strictEqual(inputs['n1'], undefined);
    assert.strictEqual(inputs['n2'], undefined);
    assert.strictEqual(inputs['e1'], undefined);
    assert.strictEqual(inputs['e2'], undefined);
  });
});
