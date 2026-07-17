export * from './base-profile';
export * from './law-profile';
export * from './form-profile';
export * from './mapping-profile';
export * from './verification-rule-profile';
export * from './document-version-profile';
export * from './workflow-profile';
export * from './ai-capability-profile';

import { LawProfile } from './law-profile';
import { FormProfile } from './form-profile';
import { MappingProfile } from './mapping-profile';
import { VerificationRuleProfile } from './verification-rule-profile';
import { DocumentVersionProfile } from './document-version-profile';
import { WorkflowProfile } from './workflow-profile';
import { AICapabilityProfile } from './ai-capability-profile';

export type Profile = 
  | LawProfile
  | FormProfile
  | MappingProfile
  | VerificationRuleProfile
  | DocumentVersionProfile
  | WorkflowProfile
  | AICapabilityProfile;
