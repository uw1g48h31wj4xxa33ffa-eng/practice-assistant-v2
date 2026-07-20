import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { ProfileRegistry } from '../registry/profile-registry.js';
import { ProfileLoader } from '../registry/profile-loader.js';

test('ProfileLoader', async (t) => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'profile-loader-test-'));

  t.after(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  const writeJson = (name: string, content: unknown) => {
    fs.writeFileSync(path.join(tempDir, name), JSON.stringify(content));
  };

  await t.test('loads valid profiles and checks references successfully', () => {
    const registry = new ProfileRegistry();
    const loader = new ProfileLoader(registry);

    writeJson('valid1.json', {
      id: 'test-form',
      profileType: 'form',
      schemaVersion: '1.0.0',
      version: '1.0',
      status: 'active',
      effectiveFrom: '2026-01-01T00:00:00Z',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      formVersion: '1.0',
      templateReference: 'test.docx',
      mappingProfileId: 'test-mapping'
    });

    writeJson('valid2.json', {
      id: 'test-mapping',
      profileType: 'mapping',
      schemaVersion: '1.0.0',
      version: '1.0',
      status: 'active',
      effectiveFrom: '2026-01-01T00:00:00Z',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      formProfileId: 'test-form',
      fieldDefinitions: {}
    });

    const report = loader.loadFromDirectory(tempDir);
    assert.strictEqual(report.success, true);
    assert.strictEqual(report.loadedCount, 2);
    assert.strictEqual(report.loadErrors.length, 0);
    assert.strictEqual(report.referenceErrors.length, 0);

    const form = registry.getExact('test-form', '1.0');
    assert.ok(form);
  });

  await t.test('reports missing reference', () => {
    const registry = new ProfileRegistry();
    const loader = new ProfileLoader(registry);

    const missingDir = path.join(tempDir, 'missing-ref');
    fs.mkdirSync(missingDir);
    fs.writeFileSync(path.join(missingDir, 'invalid.json'), JSON.stringify({
      id: 'test-form-2',
      profileType: 'form',
      schemaVersion: '1.0.0',
      version: '1.0',
      status: 'active',
      effectiveFrom: '2026-01-01T00:00:00Z',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      formVersion: '1.0',
      templateReference: 'test.docx',
      mappingProfileId: 'non-existent-mapping'
    }));

    const report = loader.loadFromDirectory(missingDir);
    assert.strictEqual(report.success, false);
    assert.strictEqual(report.loadedCount, 1);
    assert.strictEqual(report.loadErrors.length, 0);
    assert.strictEqual(report.referenceErrors.length, 1);
    assert.match(report.referenceErrors[0].error, /does not exist in registry/);
  });

  await t.test('reports type mismatch in reference', () => {
    const registry = new ProfileRegistry();
    const loader = new ProfileLoader(registry);

    const mismatchDir = path.join(tempDir, 'type-mismatch');
    fs.mkdirSync(mismatchDir);
    fs.writeFileSync(path.join(mismatchDir, 'f1.json'), JSON.stringify({
      id: 'test-form-3',
      profileType: 'form',
      schemaVersion: '1.0.0',
      version: '1.0',
      status: 'active',
      effectiveFrom: '2026-01-01T00:00:00Z',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      formVersion: '1.0',
      templateReference: 'test.docx',
      mappingProfileId: 'test-wrong-type'
    }));

    fs.writeFileSync(path.join(mismatchDir, 'f2.json'), JSON.stringify({
      id: 'test-wrong-type',
      profileType: 'law',
      schemaVersion: '1.0.0',
      version: '1.0',
      status: 'active',
      effectiveFrom: '2026-01-01T00:00:00Z',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      lawVersion: '1',
      jurisdiction: 'JP'
    }));

    const report = loader.loadFromDirectory(mismatchDir);
    assert.strictEqual(report.success, false);
    assert.strictEqual(report.loadedCount, 2);
    assert.strictEqual(report.referenceErrors.length, 1);
    assert.match(report.referenceErrors[0].error, /is not of expected type/);
  });

  await t.test('reports JSON parse error', () => {
    const registry = new ProfileRegistry();
    const loader = new ProfileLoader(registry);

    const parseErrorDir = path.join(tempDir, 'parse-error');
    fs.mkdirSync(parseErrorDir);
    fs.writeFileSync(path.join(parseErrorDir, 'bad.json'), '{"id": "broken",');

    const report = loader.loadFromDirectory(parseErrorDir);
    assert.strictEqual(report.success, false);
    assert.strictEqual(report.loadedCount, 0);
    assert.strictEqual(report.loadErrors.length, 1);
    assert.match(report.loadErrors[0].error, /Expected double-quoted property name|Unexpected end of JSON input/);
  });

  await t.test('reports Schema validation error', () => {
    const registry = new ProfileRegistry();
    const loader = new ProfileLoader(registry);

    const schemaErrorDir = path.join(tempDir, 'schema-error');
    fs.mkdirSync(schemaErrorDir);
    fs.writeFileSync(path.join(schemaErrorDir, 'invalid.json'), JSON.stringify({
      id: 'test-form-invalid',
      profileType: 'form',
      // Missing required fields
    }));

    const report = loader.loadFromDirectory(schemaErrorDir);
    assert.strictEqual(report.success, false);
    assert.strictEqual(report.loadedCount, 0);
    assert.strictEqual(report.loadErrors.length, 1);
    assert.match(report.loadErrors[0].error, /Profile validation failed/);
  });

  await t.test('reports duplicate profile version error', () => {
    const registry = new ProfileRegistry();
    const loader = new ProfileLoader(registry);

    const duplicateDir = path.join(tempDir, 'duplicate');
    fs.mkdirSync(duplicateDir);

    const profile = {
      id: 'dup-form',
      profileType: 'form',
      schemaVersion: '1.0.0',
      version: '1.0',
      status: 'active',
      effectiveFrom: '2026-01-01T00:00:00Z',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      formVersion: '1.0',
      templateReference: 'test.docx'
    };

    fs.writeFileSync(path.join(duplicateDir, 'dup1.json'), JSON.stringify(profile));
    fs.writeFileSync(path.join(duplicateDir, 'dup2.json'), JSON.stringify(profile));

    const report = loader.loadFromDirectory(duplicateDir);
    assert.strictEqual(report.success, false);
    assert.strictEqual(report.loadedCount, 1);
    assert.strictEqual(report.loadErrors.length, 1);
    assert.match(report.loadErrors[0].error, /Profile already registered/);
  });
});
