import test from 'node:test';
import assert from 'node:assert';
import { ProfileRegistry } from '../registry/profile-registry.js';
import { ProfileResolver } from '../resolution/profile-resolver.js';
import { DefaultExecutionContextBuilder } from '../resolution/execution-context-builder.js';
import { CareerUpAdapter } from '../resolution/adapter.js';
import { careerUpR8Form1Mapping } from '../../../scripts/document-verification/config/career-up-r8-form1.mapping.mjs';

test('ProfileResolver and ExecutionContextBuilder', async (t) => {
  const setupRegistry = () => {
    const registry = new ProfileRegistry();
    registry.register({
      id: 'doc1',
      profileType: 'document-version',
      schemaVersion: '1.0',
      version: '1.0',
      status: 'active',
      effectiveFrom: '2026-01-01T00:00:00Z',
      effectiveTo: '2026-12-31T23:59:59Z',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      documentId: 'd1',
      caseId: 'c1',
      generatedAt: '2026-01-01T00:00:00Z',
      lawProfileId: 'law1',
      formProfileId: 'form1',
      mappingProfileId: 'map1'
    });
    registry.register({
      id: 'law1',
      profileType: 'law',
      schemaVersion: '1.0',
      version: '1.0',
      status: 'active',
      effectiveFrom: '2026-01-01T00:00:00Z',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      lawVersion: '1.0',
      jurisdiction: 'JP'
    });
    registry.register({
      id: 'form1',
      profileType: 'form',
      schemaVersion: '1.0',
      version: 'R8.4.8',
      status: 'active',
      effectiveFrom: '2026-01-01T00:00:00Z',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      formVersion: 'R8.4.8',
      templateReference: 'temp.docx',
      templateHash: 'd46f03b16e9eda461275acbef2c127b22cbc2c1e321b27465f59e2181cb43092',
      mappingProfileId: 'map1'
    });
    // Add an older version of form1 to test boundaries
    registry.register({
      id: 'form1',
      profileType: 'form',
      schemaVersion: '1.0',
      version: 'R8.4.7',
      status: 'active',
      effectiveFrom: '2025-01-01T00:00:00Z',
      effectiveTo: '2026-01-01T00:00:00Z', // Ends exactly when R8.4.8 starts
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      formVersion: 'R8.4.7',
      templateReference: 'temp_old.docx',
      templateHash: 'old_hash',
      mappingProfileId: 'map1'
    });
    registry.register({
      id: 'map1',
      profileType: 'mapping',
      schemaVersion: '1.0',
      version: '1.0',
      status: 'active',
      effectiveFrom: '2025-01-01T00:00:00Z',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      formProfileId: 'form1',
      fieldDefinitions: {
        f1: { fieldId: 'company_name', mappingTarget: '{{COMPANY}}' },
        metadata: { some_meta: true } // Should be filtered out
      }
    });
    // Add another document version to test diamond dependency: doc2 -> form1, doc2 -> law1, form1 -> map1(none), law1(none)
    registry.register({
      id: 'doc2',
      profileType: 'document-version',
      schemaVersion: '1.0',
      version: '1.0',
      status: 'active',
      effectiveFrom: '2026-01-01T00:00:00Z',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      documentId: 'd2',
      caseId: 'c1',
      generatedAt: '2026-01-01T00:00:00Z',
      lawProfileId: 'law1', // diamond: doc2 -> law1, doc2 -> form1 -> ...
      formProfileId: 'form1',
      mappingProfileId: 'map1'
    });
    return registry;
  };

  await t.test('effectiveFromと同一日時 (resolves exactly at boundary)', () => {
    const registry = setupRegistry();
    const resolver = new ProfileResolver(registry);
    const results = resolver.resolve({
      profileId: 'form1',
      profileType: 'form',
      effectiveDate: new Date('2026-01-01T00:00:00Z') // Exactly at the boundary
    });
    assert.strictEqual(results.every(r => r.ok), true, 'All results should be ok');
    const formResult = results.find(r => r.ok && (r as unknown as Record<string, unknown>).profile.id === 'form1');
    assert.strictEqual((formResult as unknown as Record<string, unknown>).profile.version, 'R8.4.8');
  });

  await t.test('effectiveTo直前または契約上の終了境界', () => {
    const registry = setupRegistry();
    const resolver = new ProfileResolver(registry);
    const results = resolver.resolve({
      profileId: 'form1',
      profileType: 'form',
      effectiveDate: new Date('2025-12-31T23:59:59.999Z') // Right before boundary
    });
    assert.strictEqual(results.every(r => r.ok), true, 'All results should be ok');
    const formResult = results.find(r => r.ok && (r as unknown as Record<string, unknown>).profile.id === 'form1');
    assert.strictEqual((formResult as unknown as Record<string, unknown>).profile.version, 'R8.4.7');
  });

  await t.test('Active Profileなし (自動fallbackされないこと)', () => {
    const registry = setupRegistry();
    const resolver = new ProfileResolver(registry);
    const results = resolver.resolve({
      profileId: 'form1',
      profileType: 'form',
      effectiveDate: new Date('2024-01-01T00:00:00Z') // Before any active profile
    });
    assert.strictEqual(results[0].ok, false);
    if (!results[0].ok) {
      assert.strictEqual(results[0].errors[0].code, 'RESOLUTION_FAILED');
      assert.match(String(results[0].errors[0].cause), /No applicable active version found/);
    }
  });

  await t.test('ambiguous resolution', () => {
    const fakeRegistry = {
      resolveActive: () => {
        throw new Error('overlaps with version');
      }
    } as unknown as ProfileRegistry;
    
    const resolver = new ProfileResolver(fakeRegistry);
    const results = resolver.resolve({
      profileId: 'form1',
      profileType: 'form',
      effectiveDate: new Date('2026-07-01T00:00:00Z')
    });
    assert.strictEqual(results[0].ok, false);
    if (!results[0].ok) {
      assert.strictEqual(results[0].errors[0].code, 'AMBIGUOUS_RESOLUTION');
    }
  });

  await t.test('diamond dependencyの重複排除', () => {
    const registry = setupRegistry();
    const resolver = new ProfileResolver(registry);
    const results = resolver.resolve({
      profileId: 'doc1',
      profileType: 'document-version',
      effectiveDate: new Date('2026-06-01T00:00:00Z')
    });
    
    const form1Results = results.filter(r => r.ok && (r as unknown as Record<string, unknown>).profile.id === 'form1');
    assert.strictEqual(form1Results.length, 1);
    
    assert.strictEqual(results.every(r => r.ok), true);
  });

  await t.test('真の循環参照 (CIRCULAR_REFERENCE)', () => {
    const registry = new ProfileRegistry();
    registry.register({
      id: 'circ1',
      profileType: 'form',
      schemaVersion: '1.0',
      version: '1.0',
      status: 'active',
      effectiveFrom: '2026-01-01T00:00:00Z',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      formVersion: '1.0',
      templateReference: 'x',
      mappingProfileId: 'circ1' // self reference as a mapping
    });

    const resolver = new ProfileResolver(registry);
    const results = resolver.resolve({
      profileId: 'circ1',
      profileType: 'form',
      effectiveDate: new Date('2026-06-01T00:00:00Z')
    });

    const errorResult = results.find(r => !r.ok);
    assert.ok(errorResult);
    if (errorResult && !errorResult.ok) {
      assert.strictEqual(errorResult.errors[0].code, 'CIRCULAR_REFERENCE');
    }
  });

  await t.test('evidence順序 (evidenceChain array)', () => {
    const registry = setupRegistry();
    const resolver = new ProfileResolver(registry);
    const results = resolver.resolve({
      profileId: 'doc1',
      profileType: 'document-version',
      effectiveDate: new Date('2026-06-01T00:00:00Z')
    });
    
    const map1Result = results.find(r => r.ok && (r as unknown as Record<string, unknown>).profile.id === 'map1');
    assert.ok(map1Result);
    if (map1Result && map1Result.ok) {
      // doc1 -> form1 -> map1
      assert.strictEqual(map1Result.evidenceChain.length, 3);
      assert.strictEqual(map1Result.evidenceChain[0].profileId, 'doc1');
      assert.strictEqual(map1Result.evidenceChain[1].profileId, 'form1');
      assert.strictEqual(map1Result.evidenceChain[2].profileId, 'map1');
    }
  });

  await t.test('同一Profileの証跡上書き防止 と 深いimmutability', () => {
    const registry = setupRegistry();
    const resolver = new ProfileResolver(registry);
    const results = resolver.resolve({
      profileId: 'doc1',
      profileType: 'document-version',
      effectiveDate: new Date('2026-06-01T00:00:00Z')
    });

    const builder = new DefaultExecutionContextBuilder();
    const ctx = builder.build(new Date('2026-06-01T00:00:00Z'), results);

    assert.throws(() => {
      // @ts-expect-error - testing readonly behavior
      ctx.resolvedProfiles['doc1'] = { ok: false, errors: [], evidenceChain: [] };
    }, TypeError);

    assert.throws(() => {
      // @ts-expect-error - testing deep freeze
      ctx.resolvedProfiles['doc1'].profile.version = 'hacked';
    }, TypeError);
    
    assert.throws(() => {
      // @ts-expect-error - testing deep freeze
      ctx.resolvedProfiles['doc1'].evidenceChain.push({} as unknown as Record<string, unknown>);
    }, TypeError);
    
    assert.throws(() => {
      // @ts-expect-error - testing Date assignment immutability constraint per audit
      ctx.effectiveDate = new Date(0);
    }, TypeError);
  });

  await t.test('実在Career-Up mappingとの構造互換性', () => {
    const registry = setupRegistry();
    registry.register({
      id: 'career-up-map',
      profileType: 'mapping',
      schemaVersion: '1.0',
      version: '1.0',
      status: 'active',
      effectiveFrom: '2026-01-01T00:00:00Z',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      formProfileId: 'form1',
      fieldDefinitions: {
        fields: careerUpR8Form1Mapping.fields
      }
    });

    const resolver = new ProfileResolver(registry);
    const results = [
      ...resolver.resolve({ profileId: 'form1', profileType: 'form', effectiveDate: new Date('2026-06-01T00:00:00Z') }),
      ...resolver.resolve({ profileId: 'career-up-map', profileType: 'mapping', effectiveDate: new Date('2026-06-01T00:00:00Z') })
    ];

    const builder = new DefaultExecutionContextBuilder();
    const ctx = builder.build(new Date('2026-06-01T00:00:00Z'), results);

    const adapter = new CareerUpAdapter();
    const legacyMap = adapter.adapt(ctx, 'form1', 'career-up-map');
    
    assert.strictEqual(legacyMap.template.id, 'form1');
    assert.strictEqual(legacyMap.template.version, 'R8.4.8');
    assert.strictEqual(legacyMap.template.expectedSha256, 'd46f03b16e9eda461275acbef2c127b22cbc2c1e321b27465f59e2181cb43092');
    
    assert.ok(Array.isArray(legacyMap.fields));
    assert.strictEqual(legacyMap.fields.length, careerUpR8Form1Mapping.fields.length);
    assert.deepStrictEqual(legacyMap.fields, careerUpR8Form1Mapping.fields);
  });

  await t.test('profile type mismatch', () => {
    const registry = setupRegistry();
    const resolver = new ProfileResolver(registry);
    const results = resolver.resolve({
      profileId: 'form1',
      profileType: 'mapping', // requesting form1 but expecting mapping
      effectiveDate: new Date('2026-06-01T00:00:00Z')
    });
    assert.strictEqual(results[0].ok, false);
    if (!results[0].ok) {
      assert.strictEqual(results[0].errors[0].code, 'TYPE_MISMATCH');
    }
  });

  await t.test('Invalid Date', () => {
    const registry = setupRegistry();
    const resolver = new ProfileResolver(registry);
    const results = resolver.resolve({
      profileId: 'form1',
      profileType: 'form',
      effectiveDate: new Date('invalid')
    });
    assert.strictEqual(results[0].ok, false);
    if (!results[0].ok) {
      assert.strictEqual(results[0].errors[0].code, 'INVALID_DATE');
    }
  });
  
  await t.test('Registry例外からResolveResultへの変換', () => {
    const registry = setupRegistry();
    const resolver = new ProfileResolver(registry);
    const results = resolver.resolve({
      profileId: 'nonexistent',
      profileType: 'form',
      effectiveDate: new Date('2026-06-01T00:00:00Z')
    });
    assert.strictEqual(results[0].ok, false);
    if (!results[0].ok) {
      assert.strictEqual(results[0].errors[0].code, 'RESOLUTION_FAILED');
      assert.ok(results[0].errors[0].cause instanceof Error);
    }
  });
});
