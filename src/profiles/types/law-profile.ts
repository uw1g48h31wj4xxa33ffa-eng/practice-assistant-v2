import { BaseProfile } from './base-profile';

export interface LawProfile extends BaseProfile {
  profileType: 'law';
  lawVersion: string;
  transitionRules?: Record<string, unknown>;
  jurisdiction: string;
  requiredFacts?: Record<string, unknown>;
  validationRules?: Record<string, unknown>;
}
