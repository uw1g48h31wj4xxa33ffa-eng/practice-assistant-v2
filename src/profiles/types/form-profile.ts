import { BaseProfile } from './base-profile';

export interface FormProfile extends BaseProfile {
  profileType: 'form';
  formVersion: string;
  templateReference: string;
  templateHash?: string;
  mappingProfileId?: string;
  verificationRuleProfileId?: string;
}
