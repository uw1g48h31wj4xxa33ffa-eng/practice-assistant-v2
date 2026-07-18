import { BaseProfile } from './base-profile';

export interface FormProfile extends BaseProfile {
  profileType: 'form';
  formVersion: string;
  templateReference: string;
  templateHash?: string;
  mappingId?: string;
  verifierConfigId?: string;
}
