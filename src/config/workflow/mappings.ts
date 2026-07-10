import { ProfileId } from '../../domain/workflow/types';

export const caseTypeMappings: Record<string, ProfileId> = {
  '補助金支援': 'subsidy',
  '労務相談': 'labor_consulting',
  '就業規則改訂': 'labor_rules',
  '賃金規程': 'labor_rules',
  '育児介護休業規程': 'labor_rules',
  '規程改訂': 'labor_rules'
};

export const legacyMappings: Record<string, ProfileId> = {
  'subsidy_v1': 'subsidy',
  'labor_consulting_v1': 'labor_consulting',
  'labor_rules_v1': 'labor_rules',
};
