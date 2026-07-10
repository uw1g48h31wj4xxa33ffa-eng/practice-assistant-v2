export type ProfileId = string;
export type TemplateId = string;
export type CaseTypeId = string;
export type StepId = string;
export type SchemaVersion = string;

export type RegistrationStatus = 'registered' | 'reserved';
export type FeatureStatus = 'enabled' | 'disabled';
export type RegistryStatus = 'registered' | 'unavailable' | 'disabled' | 'incompatible';

export type StatusModel = {
  verification: 'unchecked' | 'verified' | 'needs_revision' | 'not_applicable';
  completion: 'incomplete' | 'completed' | 'issue_found' | 'not_required';
};

export interface WorkflowProfile {
  id: ProfileId;
  name: string;
  registrationStatus: RegistrationStatus;
  templateId: TemplateId;
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
