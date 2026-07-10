export type ProfileId =
  | 'subsidy'
  | 'labor_consulting'
  | 'labor_rules'
  | 'tax_consulting'
  | 'generic';

export type TemplateId =
  | 'subsidy_v1'
  | 'labor_consulting_v1'
  | 'labor_rules_v1'
  | 'tax_consulting_v1'
  | 'generic_v1';

export type CaseTypeId = string;
export type StepId = string;
export type SchemaVersion = string;

export type RegistrationStatus = 'registered' | 'reserved';
export type FeatureStatus = 'enabled' | 'disabled';
export type RegistryStatus = 'resolved' | 'not_registered' | 'disabled' | 'incompatible';

export type StatusModel = {
  verification: 'unchecked' | 'verified' | 'needs_revision' | 'not_applicable';
  completion: 'incomplete' | 'completed' | 'issue_found' | 'not_required';
};

export interface WorkflowProfile {
  id: ProfileId;
  name: string;
  registrationStatus: RegistrationStatus;
  workflowTemplateId: TemplateId;
}

export interface WorkflowTemplate {
  id: TemplateId;
  name: string;
  steps: StepId[];
}

export interface StepOperationProfile {
  stepId: StepId;
  title: string;
  isSkippped?: boolean;
}

export interface UIProfile {
  templateId: TemplateId;
  useDonutProgress: boolean;
  layoutType: 'subsidy' | 'legacy';
}

export interface FeaturePolicy {
  templateId: TemplateId;
  allowStepSkip: boolean;
  requireAllVerifications: boolean;
}

export interface DataSchema {
  version: SchemaVersion;
  requiredFields: string[];
}
