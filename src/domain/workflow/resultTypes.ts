import { ProfileId, TemplateId, StepId, RegistryStatus } from './types';
import { GeneratorKey } from './generatorTypes';

export interface ProfileResolutionInput {
  profileId?: string;
  templateId?: string;
  caseType?: string;
}

export type ProfileResolutionResult =
  | {
      status: 'resolved';
      profileId: ProfileId;
      source: 'profile_id' | 'template_id' | 'case_type_mapping';
    }
  | {
      status: 'unresolved';
      profileId: null;
      reason: 'missing_mapping' | 'unknown_profile' | 'unknown_template' | 'invalid_case_type' | 'reserved_profile';
    };

export interface TemplateResolutionResult {
  templateId: TemplateId | null;
  status: 'resolved' | 'unresolved';
}

export interface MigrationWarning {
  field: string;
  message: string;
}

export interface MigrationError {
  field: string;
  message: string;
}

export interface MigrationResult<T> {
  success: boolean;
  data: T | null;
  warnings: MigrationWarning[];
  errors: MigrationError[];
}

export interface ValidationIssue {
  path: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
}

export interface GeneratorResolutionResult {
  key: GeneratorKey;
  status: RegistryStatus;
}
