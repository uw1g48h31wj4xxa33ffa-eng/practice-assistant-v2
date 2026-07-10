import { ProfileId } from '../../domain/workflow/types';

export const caseTypeMappings: Record<string, ProfileId> = {
  'subsidy': 'subsidy_v1',
  'labor_consulting': 'labor_consulting_v1',
  'labor_rules': 'labor_rules_v1',
};

export const legacyMappings: Record<string, ProfileId> = {
  'subsidy_v1': 'subsidy_v1',
  'labor_consulting_v1': 'labor_consulting_v1',
  'labor_rules_v1': 'labor_rules_v1',
};
