import test from 'node:test';
import assert from 'node:assert';
import { ProfileRegistry } from '../registry/profile-registry.js';
import { ProfileVerificationRunner, ProfileVerificationError } from '../runner/profile-verification-runner.js';

function setupBaseRegistry() {
  const registry = new ProfileRegistry();

  registry.register({
    id: 'test-form',
    profileType: 'form',
    schemaVersion: '1.0',
    version: '1.0',
    status: 'active',
    effectiveFrom: '2026-01-01T00:00:00Z',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    formVersion: '1.0',
    templateReference: 'test.docx',
    templateHash: 'testhash',
    mappingProfileId: 'test-map'
  });

  registry.register({
    id: 'test-map',
    profileType: 'mapping',
    schemaVersion: '1.0',
    version: '1.0',
    status: 'active',
    effectiveFrom: '2026-01-01T00:00:00Z',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    formProfileId: 'test-form',
    fieldDefinitions: {
      fields: [
        { fieldId: 'field1', manualCheck: false, humanReview: false },
        { fieldId: 'field2', manualCheck: true, humanReview: false },
        { fieldId: 'field3', manualCheck: false, humanReview: true }
      ]
    }
  });

  return registry;
}

test('ProfileVerificationRunner Unit Tests', async (t) => {
  await t.test('P0-1: 正常系 (Word生成1回, Verifier1回, success result, flags伝播)', async () => {
    const registry = setupBaseRegistry();
    let wordGenCount = 0;
    let verifierCount = 0;
    
    const runner = new ProfileVerificationRunner({
      registry,
      startWordGeneration: async () => {
        wordGenCount++;
        return { inputsToFill: { field1: 'val1', field2: 'val2', field3: 'val3' } };
      },
      runVerifier: async () => {
        verifierCount++;
        return { passed: true };
      }
    });

    const result = await runner.run({
      formProfileId: 'test-form',
      mappingProfileId: 'test-map',
      effectiveDate: new Date('2026-06-01T00:00:00Z'),
      inputData: {},
      outputPath: 'out.docx'
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(wordGenCount, 1);
    assert.strictEqual(verifierCount, 1);
    assert.strictEqual(result.manualCheck, true);
    assert.strictEqual(result.humanReview, true);
  });

  await t.test('P0-2: FormProfile未登録', async () => {
    const registry = setupBaseRegistry();
    let wordGenCount = 0;
    let verifierCount = 0;

    const runner = new ProfileVerificationRunner({
      registry,
      startWordGeneration: async () => { wordGenCount++; return { inputsToFill: {} }; },
      runVerifier: async () => { verifierCount++; return { passed: true }; }
    });

        await assert.rejects(
      runner.run({
        formProfileId: 'test-form',
        mappingProfileId: 'missing-map',
        effectiveDate: new Date('2026-06-01T00:00:00Z'),
        inputData: {},
        outputPath: 'out.docx'
      }),
      (err: unknown) => (err as ProfileVerificationError).code === 'MAPPING_PROFILE_NOT_FOUND'
    );
    assert.strictEqual(wordGenCount, 0);
    assert.strictEqual(verifierCount, 0);
  });

  
  await t.test('P0-3: MappingProfile未登録', async () => {
    const registry = setupBaseRegistry();
    let wordGenCount = 0;
    let verifierCount = 0;

    const runner = new ProfileVerificationRunner({
      registry,
      startWordGeneration: async () => { wordGenCount++; return { inputsToFill: {} }; },
      runVerifier: async () => { verifierCount++; return { passed: true }; }
    });

    await assert.rejects(
      runner.run({
        formProfileId: 'test-form',
        mappingProfileId: 'missing-map',
        effectiveDate: new Date('2026-06-01T00:00:00Z'),
        inputData: {},
        outputPath: 'out.docx'
      }),
      (err: unknown) => (err as ProfileVerificationError).code === 'MAPPING_PROFILE_NOT_FOUND'
    );
    assert.strictEqual(wordGenCount, 0);
    assert.strictEqual(verifierCount, 0);
  });

  await t.test('P0-8: template hash不一致', async () => {
    const registry = new ProfileRegistry();
    registry.register({
      id: 'test-form2', profileType: 'form', schemaVersion: '1.0', version: '1.0', status: 'active',
      effectiveFrom: '2026-01-01T00:00:00Z', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
      formVersion: '1.0', templateReference: 'test.docx',
      mappingProfileId: 'test-map2'
    });
    registry.register({
      id: 'test-map2', profileType: 'mapping', schemaVersion: '1.0', version: '1.0', status: 'active',
      effectiveFrom: '2026-01-01T00:00:00Z', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
      formProfileId: 'test-form2', fieldDefinitions: { fields: [] }
    });

    let wordGenCount = 0;
    let verifierCount = 0;

    const runner = new ProfileVerificationRunner({
      registry,
      startWordGeneration: async () => { wordGenCount++; return { inputsToFill: {} }; },
      runVerifier: async () => { verifierCount++; return { passed: true }; }
    });

    await assert.rejects(
      runner.run({
        formProfileId: 'test-form2',
        mappingProfileId: 'test-map2',
        effectiveDate: new Date('2026-06-01T00:00:00Z'),
        inputData: {},
        outputPath: 'out.docx'
      }),
      (err: unknown) => (err as ProfileVerificationError).code === 'TEMPLATE_HASH_MISMATCH'
    );
    assert.strictEqual(wordGenCount, 0);
    assert.strictEqual(verifierCount, 0);
  });

  await t.test('P0-9: Word生成失敗', async () => {
    const registry = setupBaseRegistry();
    let verifierCount = 0;

    const runner = new ProfileVerificationRunner({
      registry,
      startWordGeneration: async () => { throw new Error('WordGenError'); },
      runVerifier: async () => { verifierCount++; return { passed: true }; }
    });

    await assert.rejects(
      runner.run({
        formProfileId: 'test-form',
        mappingProfileId: 'test-map',
        effectiveDate: new Date('2026-06-01T00:00:00Z'),
        inputData: {},
        outputPath: 'out.docx'
      }),
      (err: unknown) => (err as ProfileVerificationError).code === 'WORD_GENERATION_FAILED'
    );
    assert.strictEqual(verifierCount, 0);
  });

  await t.test('P0-10: Verifier失敗', async () => {
    const registry = setupBaseRegistry();
    let wordGenCount = 0;
    let verifierCount = 0;

    const runner = new ProfileVerificationRunner({
      registry,
      startWordGeneration: async () => { wordGenCount++; return { inputsToFill: {} }; },
      runVerifier: async () => { verifierCount++; throw new Error('VerifyError'); }
    });

    await assert.rejects(
      runner.run({
        formProfileId: 'test-form',
        mappingProfileId: 'test-map',
        effectiveDate: new Date('2026-06-01T00:00:00Z'),
        inputData: {},
        outputPath: 'out.docx'
      }),
      (err: unknown) => (err as ProfileVerificationError).code === 'VERIFICATION_FAILED'
    );
    assert.strictEqual(wordGenCount, 1);
    assert.strictEqual(verifierCount, 1);
  });

});
