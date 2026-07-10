import { WorkflowTemplate } from '../../domain/workflow/types';

export const workflowTemplates: Record<string, WorkflowTemplate> = {
  subsidy_v1: {
    id: 'subsidy_v1',
    name: '補助金申請フロー',
    steps: ['hearing', 'requirements', 'evidence', 'delivery']
  },
  labor_consulting_v1: {
    id: 'labor_consulting_v1',
    name: '労務相談フロー',
    steps: ['hearing', 'issue_analysis', 'risk_analysis', 'action_plan', 'evidence', 'delivery']
  },
  labor_rules_v1: {
    id: 'labor_rules_v1',
    name: '就業規則フロー',
    steps: ['hearing', 'drafting', 'review', 'evidence', 'delivery']
  }
};
