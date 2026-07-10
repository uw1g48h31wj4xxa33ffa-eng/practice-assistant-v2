import { ProfileId, TemplateId, StepId, RegistryStatus } from './types';
import { GeneratorKey } from './generatorTypes';

export interface ProfileResolutionInput {
  profileId?: string;
  templateId?: string;
  caseType?: string;
}

export interface ProfileResolutionResult {
  profileId: ProfileId | null;
  status: 'resolved' | 'unresolved';
}

export interface TemplateResolutionResult {
  templateId: TemplateId | null;
  status: 'resolved' | 'unresolved';
}

export interface StepResolutionResult {
  stepId: StepId | null;
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

export interface ValidationError {
  path: string;
  message: string;
}

export interface ValidationWarning {
  path: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface GeneratorResolutionResult {
  key: GeneratorKey;
  status: RegistryStatus;
}
