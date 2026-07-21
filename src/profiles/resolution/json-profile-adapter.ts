import { FormProfile, MappingProfile } from '../types/index.js';

export interface JsonProfileSource {
  template: {
    id: string;
    version: string;
    expectedSha256: string;
    templateReference: string;
    mappingProfileId?: string;
  };
  fields: unknown[];
}

export class JsonProfileAdapter {
  /**
   * Adapts a JSON source into FormProfile and MappingProfile.
   * This acts as the Single Source of Truth adapter for Profile-driven paths.
   */
  adapt(json: JsonProfileSource): { formProfile: FormProfile; mappingProfile: MappingProfile } {
    const formProfileId = json.template.id;
    // Derive mapping ID by replacing form with map, or append -map
    const mappingProfileId = json.template.mappingProfileId || (formProfileId.includes('form') ? formProfileId.replace('form', 'map') : `${formProfileId}-map`);

    const formProfile: FormProfile = {
      id: formProfileId,
      profileType: 'form',
      schemaVersion: '1.0',
      version: json.template.version,
      status: 'active',
      effectiveFrom: '2026-01-01T00:00:00Z',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      formVersion: json.template.version,
      templateReference: json.template.templateReference,
      templateHash: json.template.expectedSha256,
      mappingProfileId
    };

    const mappingProfile: MappingProfile = {
      id: mappingProfileId,
      profileType: 'mapping',
      schemaVersion: '1.0',
      version: '1.0', // Mapping typically has independent versioning, default to 1.0
      status: 'active',
      effectiveFrom: '2026-01-01T00:00:00Z',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      formProfileId,
      fieldDefinitions: {
        fields: json.fields
      }
    };

    return { formProfile, mappingProfile };
  }
}
