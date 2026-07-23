import { FormProfile, MappingProfile } from '../types/index';
import { ExecutionContext } from './types';

export interface LegacyMappingFormat {
  template: {
    id: string;
    version: string;
    expectedSha256?: string;
  };
  fields: unknown[];
}

export class CareerUpAdapter {
  /**
   * Adapts a profile-driven ExecutionContext into the legacy Career-Up Form mapping format.
   * Throws an error if the context does not contain the necessary profiles.
   */
  adapt(context: ExecutionContext, formProfileId: string, mappingProfileId: string): LegacyMappingFormat {
    const formResult = context.resolvedProfiles[formProfileId];
    if (!formResult || !formResult.ok || formResult.profile.profileType !== 'form') {
      throw new Error(`Execution context is missing valid form profile: ${formProfileId}`);
    }

    const mappingResult = context.resolvedProfiles[mappingProfileId];
    if (!mappingResult || !mappingResult.ok || mappingResult.profile.profileType !== 'mapping') {
      throw new Error(`Execution context is missing valid mapping profile: ${mappingProfileId}`);
    }

    const formProfile = formResult.profile as FormProfile;
    const mappingProfile = mappingResult.profile as MappingProfile;

    let fieldsArray: unknown[] = [];
    if (Array.isArray(mappingProfile.fieldDefinitions)) {
      fieldsArray = mappingProfile.fieldDefinitions;
    } else if (mappingProfile.fieldDefinitions && typeof mappingProfile.fieldDefinitions === 'object') {
      const record = mappingProfile.fieldDefinitions as Record<string, unknown>;
      // If it has a 'fields' array property, use it directly to avoid metadata.
      if (Array.isArray(record.fields)) {
        fieldsArray = record.fields;
      } else {
        // Otherwise, assume it's a map of fieldId -> fieldConfig, and extract only objects containing fieldId
        fieldsArray = Object.values(record).filter(
          v => v && typeof v === 'object' && 'fieldId' in v
        );
      }
    }

    return {
      template: {
        id: formProfile.id,
        version: formProfile.formVersion,
        expectedSha256: formProfile.templateHash
      },
      fields: fieldsArray
    };
  }
}
