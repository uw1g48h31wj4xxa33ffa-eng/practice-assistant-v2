import { FormProfile, MappingProfile } from '../types/index.js';

export interface JsonProfileSource {
  template: {
    id: string;
    version: string;
    expectedSha256: string;
    templateReference: string;
    mappingProfileId: string;
    schemaVersion?: string;
    status?: 'active' | 'draft' | 'archived';
    effectiveFrom?: string;
    createdAt?: string;
    updatedAt?: string;
    mappingVersion?: string;
  };
  fields: unknown[];
}

export function assertJsonProfileSource(value: unknown): asserts value is JsonProfileSource {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Invalid JSON Profile Source: root must be an object');
  }

  const obj = value as Record<string, unknown>;

  if (!obj.template || typeof obj.template !== 'object') {
    throw new Error('Invalid JSON Profile Source: "template" is missing or not an object');
  }

  const template = obj.template as Record<string, unknown>;

  if (typeof template.id !== 'string' || !template.id) {
    throw new Error('Invalid JSON Profile Source: "template.id" is required and must be a non-empty string');
  }
  if (typeof template.version !== 'string' || !template.version) {
    throw new Error('Invalid JSON Profile Source: "template.version" is required and must be a non-empty string');
  }
  if (typeof template.expectedSha256 !== 'string' || !template.expectedSha256) {
    throw new Error('Invalid JSON Profile Source: "template.expectedSha256" is required and must be a non-empty string');
  }
  if (typeof template.templateReference !== 'string' || !template.templateReference) {
    throw new Error('Invalid JSON Profile Source: "template.templateReference" is required and must be a non-empty string');
  }
  if (typeof template.mappingProfileId !== 'string' || !template.mappingProfileId) {
    throw new Error('Invalid JSON Profile Source: "template.mappingProfileId" is required and must be a non-empty string');
  }

  // Ensure fields is an array
  if (!Array.isArray(obj.fields)) {
    throw new Error('Invalid JSON Profile Source: "fields" must be an array');
  }

  // Minimal validation for each field (e.g., must be object)
  obj.fields.forEach((field, index) => {
    if (!field || typeof field !== 'object') {
      throw new Error(`Invalid JSON Profile Source: "fields[${index}]" must be an object`);
    }
  });
}


export class JsonProfileAdapter {
  /**
   * Adapts a JSON source into FormProfile and MappingProfile.
   * This acts as the Single Source of Truth adapter for Profile-driven paths.
   */
  adapt(json: unknown): { formProfile: FormProfile; mappingProfile: MappingProfile } {
    assertJsonProfileSource(json);

    const src = json as JsonProfileSource;
    const formProfileId = src.template.id;
    const mappingProfileId = src.template.mappingProfileId;

    const formProfile: FormProfile = {
      id: formProfileId,
      profileType: 'form',
      schemaVersion: src.template.schemaVersion || '1.0',
      version: src.template.version,
      status: src.template.status || 'active',
      effectiveFrom: src.template.effectiveFrom || '2026-01-01T00:00:00Z',
      createdAt: src.template.createdAt || '2026-01-01T00:00:00Z',
      updatedAt: src.template.updatedAt || '2026-01-01T00:00:00Z',
      formVersion: src.template.version,
      templateReference: src.template.templateReference,
      templateHash: src.template.expectedSha256,
      mappingProfileId
    };

    const mappingProfile: MappingProfile = {
      id: mappingProfileId,
      profileType: 'mapping',
      schemaVersion: src.template.schemaVersion || '1.0',
      version: src.template.mappingVersion || '1.0',
      status: src.template.status || 'active',
      effectiveFrom: src.template.effectiveFrom || '2026-01-01T00:00:00Z',
      createdAt: src.template.createdAt || '2026-01-01T00:00:00Z',
      updatedAt: src.template.updatedAt || '2026-01-01T00:00:00Z',
      formProfileId,
      fieldDefinitions: {
        fields: src.fields
      }
    };

    return { formProfile, mappingProfile };
  }
}
