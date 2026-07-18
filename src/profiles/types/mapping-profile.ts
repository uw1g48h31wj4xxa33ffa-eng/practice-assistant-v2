import { BaseProfile } from './base-profile';

export interface MappingProfile extends BaseProfile {
  profileType: 'mapping';
  formProfileId: string;
  fieldDefinitions: Record<string, unknown>;
  inputModes?: Record<string, string>;
  locators?: Record<string, unknown>;
  manualCheckRules?: Record<string, unknown>;
  humanReviewRules?: Record<string, unknown>;
  compatibility?: Record<string, unknown>;
}
