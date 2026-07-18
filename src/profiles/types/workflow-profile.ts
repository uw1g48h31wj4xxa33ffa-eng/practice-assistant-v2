import { BaseProfile } from './base-profile';

export interface WorkflowProfile extends BaseProfile {
  profileType: 'workflow';
  steps: Record<string, unknown>;
}
