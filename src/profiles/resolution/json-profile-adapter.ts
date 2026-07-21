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

export class JsonProfileAdapter {
  /**
   * Adapts a JSON source into FormProfile and MappingProfile.
   * This acts as the Single Source of Truth adapter for Profile-driven paths.
   */
  adapt(json: unknown): { formProfile: FormProfile; mappingProfile: MappingProfile } {
    const src = json as JsonProfileSource;
    const formProfileId = src.template.id;
    const mappingProfileId = src.template.mappingProfileId;

    if (!mappingProfileId) {
      throw new Error('mappingProfileId is required in JSON template');
    }

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
