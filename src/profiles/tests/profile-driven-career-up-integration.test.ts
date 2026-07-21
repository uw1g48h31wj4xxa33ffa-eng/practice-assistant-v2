import test from 'node:test';
import assert from 'node:assert';
import { ProfileRegistry } from '../registry/profile-registry.js';
import { CareerUpAdapter } from '../resolution/adapter.js';
import { ProfileDrivenContextFactory } from '../resolution/feature-activation.js';
import { careerUpR8Form1Mapping as legacyMapping } from '../../../scripts/document-verification/config/career-up-r8-form1.mapping.mjs';
import { orchestrateProfileGeneration } from '../../../scripts/document-verification/verify-career-up-profile-driven.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const careerUpFieldsPath = path.resolve(__dirname, '../../../scripts/document-verification/config/career-up-r8-form1-fields.json');
const careerUpFields = JSON.parse(fs.readFileSync(careerUpFieldsPath, 'utf8'));

function setupRegistry() {
  const registry = new ProfileRegistry();

  registry.register({
    id: 'career-up-r8-form1',
    profileType: 'form',
    schemaVersion: '1.0',
    version: 'R8.4.8',
    status: 'active',
    effectiveFrom: '2026-01-01T00:00:00Z',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    formVersion: 'R8.4.8',
    templateReference: '001688046.docx',
    templateHash: 'd46f03b16e9eda461275acbef2c127b22cbc2c1e321b27465f59e2181cb43092',
    mappingProfileId: 'career-up-map1'
  });

  registry.register({
    id: 'career-up-map1',
    profileType: 'mapping',
    schemaVersion: '1.0',
    version: '1.0',
    status: 'active',
    effectiveFrom: '2026-01-01T00:00:00Z',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    formProfileId: 'career-up-r8-form1',
    fieldDefinitions: {
      fields: careerUpFields
    }
  });

  // For testing missing dependencies
  registry.register({
    id: 'broken-form1',
    profileType: 'form',
    schemaVersion: '1.0',
    version: '1.0',
    status: 'active',
    effectiveFrom: '2026-01-01T00:00:00Z',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    formVersion: '1.0',
    templateReference: 'temp.docx',
    templateHash: 'hash',
    mappingProfileId: 'missing-map'
  });

  return registry;
}

test('Profile-Driven Career-Up Integration (Phase 2-C)', async (t) => {
  await t.test('1. 正常なProfile-driven経路でContextを構築できる', () => {
    const registry = setupRegistry();
    const factory = new ProfileDrivenContextFactory(registry);

    const ctx = factory.createContext({
      profileId: 'career-up-r8-form1',
      profileType: 'form',
      effectiveDate: new Date('2026-06-01T00:00:00Z')
    });

    assert.ok(ctx);
    assert.ok(ctx.resolvedProfiles['career-up-r8-form1']);
    assert.ok(ctx.resolvedProfiles['career-up-map1']);
  });

  await t.test('2. CareerUpAdapter出力がlegacy Mappingと厳密に互換である', () => {
    const registry = setupRegistry();
    const factory = new ProfileDrivenContextFactory(registry);
    const ctx = factory.createContext({
      profileId: 'career-up-r8-form1',
      profileType: 'form',
      effectiveDate: new Date('2026-06-01T00:00:00Z')
    });

    const adapter = new CareerUpAdapter();
    const mapping = adapter.adapt(ctx, 'career-up-r8-form1', 'career-up-map1');

    assert.strictEqual(mapping.template.id, 'career-up-r8-form1');
    assert.strictEqual(mapping.template.version, 'R8.4.8');
    assert.strictEqual(mapping.template.expectedSha256, 'd46f03b16e9eda461275acbef2c127b22cbc2c1e321b27465f59e2181cb43092');

    // Test 2 を「Profile定義 vs legacy定義の比較テスト」として整理（ドリフト検出）
    assert.deepStrictEqual(careerUpFields, legacyMapping.fields, 'careerUpFields JSON must strictly match legacyMapping.fields');
    assert.deepStrictEqual(mapping.fields, careerUpFields, 'Adapter output fields must strictly match careerUpFields');
  });

  await t.test('6 & 9. Profile不足時にWord生成へ進まない / 自動fallbackが発生しない', async () => {
    const registry = setupRegistry();
    const factory = new ProfileDrivenContextFactory(registry);

    const mockWordGeneration = t.mock.fn();
    const mockLegacyFallback = t.mock.fn();

    const resolveMapping = () => {
      const ctx = factory.createContext({
        profileId: 'missing-form',
        profileType: 'form',
        effectiveDate: new Date('2026-06-01T00:00:00Z')
      });
      return new CareerUpAdapter().adapt(ctx, 'missing-form', 'career-up-map1');
    };

    await assert.rejects(
      orchestrateProfileGeneration(resolveMapping, mockWordGeneration, mockLegacyFallback),
      /Cannot build ExecutionContext with failed resolution results/
    );

    assert.strictEqual(mockWordGeneration.mock.callCount(), 0, 'Word生成開始関数は呼ばれるべきではない');
    assert.strictEqual(mockLegacyFallback.mock.callCount(), 0, 'legacy fallback処理は呼ばれるべきではない');
  });

  await t.test('7. 型不一致時にWord生成へ進まない', async () => {
    const registry = setupRegistry();
    const factory = new ProfileDrivenContextFactory(registry);

    const mockWordGeneration = t.mock.fn();
    const mockLegacyFallback = t.mock.fn();

    const resolveMapping = () => {
      const ctx = factory.createContext({
        profileId: 'career-up-map1', // This is a mapping
        profileType: 'form',         // But we ask for 'form'
        effectiveDate: new Date('2026-06-01T00:00:00Z')
      });
      return new CareerUpAdapter().adapt(ctx, 'career-up-map1', 'career-up-map1');
    };

    await assert.rejects(
      orchestrateProfileGeneration(resolveMapping, mockWordGeneration, mockLegacyFallback),
      /Cannot build ExecutionContext with failed resolution results/
    );

    assert.strictEqual(mockWordGeneration.mock.callCount(), 0, 'Word生成開始関数は呼ばれるべきではない');
    assert.strictEqual(mockLegacyFallback.mock.callCount(), 0, 'legacy fallback処理は呼ばれるべきではない');
  });

  await t.test('8. dependency失敗が上位へ伝播する', async () => {
    const registry = setupRegistry();
    const factory = new ProfileDrivenContextFactory(registry);

    const mockWordGeneration = t.mock.fn();
    const mockLegacyFallback = t.mock.fn();

    const resolveMapping = () => {
      const ctx = factory.createContext({
        profileId: 'broken-form1',
        profileType: 'form',
        effectiveDate: new Date('2026-06-01T00:00:00Z')
      });
      return new CareerUpAdapter().adapt(ctx, 'broken-form1', 'missing-map');
    };

    await assert.rejects(
      orchestrateProfileGeneration(resolveMapping, mockWordGeneration, mockLegacyFallback),
      /Cannot build ExecutionContext with failed resolution results/
    );

    assert.strictEqual(mockWordGeneration.mock.callCount(), 0, 'Word生成開始関数は呼ばれるべきではない');
    assert.strictEqual(mockLegacyFallback.mock.callCount(), 0, 'legacy fallback処理は呼ばれるべきではない');
  });

  await t.test('11. 同一入力で同一versionとMappingが得られる', () => {
    const registry = setupRegistry();
    const factory = new ProfileDrivenContextFactory(registry);

    const ctx1 = factory.createContext({
      profileId: 'career-up-r8-form1',
      profileType: 'form',
      effectiveDate: new Date('2026-06-01T00:00:00Z')
    });
    const mapping1 = new CareerUpAdapter().adapt(ctx1, 'career-up-r8-form1', 'career-up-map1');

    const ctx2 = factory.createContext({
      profileId: 'career-up-r8-form1',
      profileType: 'form',
      effectiveDate: new Date('2026-06-01T00:00:00Z')
    });
    const mapping2 = new CareerUpAdapter().adapt(ctx2, 'career-up-r8-form1', 'career-up-map1');

    assert.deepStrictEqual(mapping1, mapping2);
  });


});
