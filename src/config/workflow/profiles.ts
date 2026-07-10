import { WorkflowProfile } from '../../domain/workflow/types';

export const profiles: Record<string, WorkflowProfile> = {
  subsidy: {
    id: 'subsidy',
    name: '補助金案件',
    registrationStatus: 'registered',
    workflowTemplateId: 'subsidy_v1'
  },
  labor_consulting: {
    id: 'labor_consulting',
    name: '労務相談案件',
    registrationStatus: 'registered',
    workflowTemplateId: 'labor_consulting_v1'
  },
  labor_rules: {
    id: 'labor_rules',
    name: '就業規則案件',
    registrationStatus: 'registered',
    workflowTemplateId: 'labor_rules_v1'
  },
  tax_consulting: {
    id: 'tax_consulting',
    name: '税務相談案件',
    registrationStatus: 'reserved',
    workflowTemplateId: 'tax_consulting_v1'
  },
  generic: {
    id: 'generic',
    name: 'その他案件',
    registrationStatus: 'reserved',
    workflowTemplateId: 'generic_v1'
  }
};
