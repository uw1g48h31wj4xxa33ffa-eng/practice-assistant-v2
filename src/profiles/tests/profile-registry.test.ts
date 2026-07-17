import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { ProfileRegistry } from '../registry/profile-registry.js';
import { ProfileValidator } from '../registry/profile-validator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesPath = path.resolve(__dirname, '../fixtures/synthetic-profiles.json');
const fixtures = JSON.parse(fs.readFileSync(fixturesPath, 'utf8'));

test('Profile Validator - Schema Validation', async (t) => {
  await t.test('Validates a correct FormProfile', () => {
    assert.doesNotThrow(() => {
      ProfileValidator.validate(fixtures[0]);
    });
  });

  await t.test('Throws on missing required fields', () => {
    const invalidProfile = { ...fixtures[0], formVersion: undefined };
    assert.throws(() => ProfileValidator.validate(invalidProfile), /Profile validation failed/);
  });

  await t.test('Throws on unknown profile type', () => {
    const invalidProfile = { ...fixtures[0], profileType: 'unknown' };
    assert.throws(() => ProfileValidator.validate(invalidProfile), /Unknown profile type/);
  });

  await t.test('Throws on invalid date format', () => {
    const invalidProfile = { ...fixtures[0], effectiveFrom: 'not-a-date' };
    assert.throws(() => ProfileValidator.validate(invalidProfile), /Profile validation failed/);
  });
  
  await t.test('Throws on invalid status', () => {
    const invalidProfile = { ...fixtures[0], status: 'pending' };
    assert.throws(() => ProfileValidator.validate(invalidProfile), /Profile validation failed/);
  });
});

test('Profile Registry - Registry Logic', async (t) => {
  await t.test('Registers and retrieves exact version', () => {
    const registry = new ProfileRegistry();
    registry.register(fixtures[0]);
    const p = registry.getExact('career-up-r8-form', '1.0');
    assert.deepStrictEqual(p, fixtures[0]);
  });

  await t.test('Throws on duplicate registration', () => {
    const registry = new ProfileRegistry();
    registry.register(fixtures[0]);
    assert.throws(() => registry.register(fixtures[0]), /Profile already registered/);
  });

  await t.test('Prevents invalid profiles from entering registry', () => {
    const registry = new ProfileRegistry();
    const invalidProfile = { ...fixtures[0], formVersion: undefined };
    assert.throws(() => registry.register(invalidProfile), /Profile validation failed/);
    assert.strictEqual(registry.listVersions('career-up-r8-form').length, 0);
  });
});

test('Version Registry - Resolution Logic', async (t) => {
  await t.test('Resolves active version by effective date', () => {
    const registry = new ProfileRegistry();
    registry.register(fixtures[0]); // active, from 2026-01-01
    
    // date after effectiveFrom
    const active = registry.resolveActive('career-up-r8-form', new Date('2026-06-01T00:00:00Z'));
    assert.strictEqual(active.version, '1.0');
  });

  await t.test('Throws if date is before first effective version', () => {
    const registry = new ProfileRegistry();
    registry.register(fixtures[0]); // active, from 2026-01-01
    
    assert.throws(() => registry.resolveActive('career-up-r8-form', new Date('2025-01-01T00:00:00Z')), /No applicable active version found/);
  });

  await t.test('Respects effectiveTo exclusive boundary', () => {
    const registry = new ProfileRegistry();
    registry.register(fixtures[2]); // active, from 2026-01-01 to 2026-12-31T23:59:59Z
    
    // On the boundary should throw (since effectiveTo is 2026-12-31T23:59:59Z)
    assert.throws(() => registry.resolveActive('hatarakikata-r8-form', new Date('2027-01-01T00:00:00Z')), /No applicable active version found/);
  });

  await t.test('Ignores draft status versions', () => {
    const registry = new ProfileRegistry();
    registry.register(fixtures[1]); // draft, from 2027-01-01
    
    assert.throws(() => registry.resolveActive('career-up-r8-form', new Date('2027-02-01T00:00:00Z')), /No applicable active version found/);
  });

  await t.test('Rejects overlapping active versions', () => {
    const registry = new ProfileRegistry();
    registry.register(fixtures[0]); // active, from 2026-01-01, no effectiveTo
    
    const overlapProfile = {
      ...fixtures[0],
      version: '1.1',
      effectiveFrom: '2026-06-01T00:00:00Z'
    };
    registry.register(overlapProfile);
    
    // On 2026-07-01, both 1.0 and 1.1 are active
    assert.throws(() => registry.resolveActive('career-up-r8-form', new Date('2026-07-01T00:00:00Z')), /Ambiguous active versions found/);
  });
});
