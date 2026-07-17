import { BaseProfile } from './base-profile';

export interface AICapabilityProfile extends BaseProfile {
  profileType: 'ai-capability';
  provider: string;
  model: string;
  approvedTasks?: string[];
  prohibitedTasks?: string[];
  toolCapabilities?: string[];
  dataTransmissionPolicy?: string;
  retentionPolicy?: string;
  jurisdiction?: string;
  requiredGateStrength?: string;
  requiredHumanReview?: string;
  evaluationVersion?: string;
  fallbackPolicy?: string;
}
