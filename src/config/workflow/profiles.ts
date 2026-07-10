import { WorkflowProfile } from '../../domain/workflow/types';

export const profiles: Record<string, WorkflowProfile> = {
  subsidy_v1: {
    id: 'subsidy_v1',
    name: '補助金案件',
    registrationStatus: 'registered',
    templateId: 'subsidy_v1'
  },
  labor_consulting_v1: {
    id: 'labor_consulting_v1',
    name: '労務相談案件',
    registrationStatus: 'registered',
    templateId: 'labor_consulting_v1'
  },
  labor_rules_v1: {
    id: 'labor_rules_v1',
    name: '就業規則案件',
    registrationStatus: 'registered',
    templateId: 'labor_rules_v1'
  },
  tax_consulting_v1: {
    id: 'tax_consulting_v1',
    name: '税務相談案件',
    registrationStatus: 'reserved',
    templateId: 'tax_consulting_v1'
  },
  generic_v1: {
    id: 'generic_v1',
    name: 'その他案件',
    registrationStatus: 'reserved',
    templateId: 'generic_v1'
  }
};
