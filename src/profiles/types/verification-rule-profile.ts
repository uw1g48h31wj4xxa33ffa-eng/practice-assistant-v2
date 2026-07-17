import { BaseProfile } from './base-profile';

export interface VerificationRuleProfile extends BaseProfile {
  profileType: 'verification-rule';
  rules: Record<string, unknown>;
}
