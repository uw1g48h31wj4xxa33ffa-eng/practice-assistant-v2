import { FeaturePolicy } from '../../domain/workflow/types';

export const policies: Record<string, FeaturePolicy> = {
  subsidy_v1: {
    templateId: 'subsidy_v1',
    allowStepSkip: false,
    requireAllVerifications: true
  },
  labor_consulting_v1: {
    templateId: 'labor_consulting_v1',
    allowStepSkip: false,
    requireAllVerifications: true
  },
  labor_rules_v1: {
    templateId: 'labor_rules_v1',
    allowStepSkip: true,
    requireAllVerifications: false
  }
};
