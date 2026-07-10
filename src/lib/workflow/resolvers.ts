import { 
  ProfileResolutionInput, 
  ProfileResolutionResult,
  TemplateResolutionResult,
  StepResolutionResult
} from '../../domain/workflow/resultTypes';
import { caseTypeMappings, legacyMappings, profiles } from '../../config/workflow';
import { ProfileId, StepId } from '../../domain/workflow/types';

export function resolveWorkflowProfile(input: ProfileResolutionInput): ProfileResolutionResult {
  if (input.profileId && profiles[input.profileId] && profiles[input.profileId].registrationStatus === 'registered') {
    return { profileId: input.profileId, status: 'resolved' };
  }

  if (input.templateId && legacyMappings[input.templateId]) {
    const mappedId = legacyMappings[input.templateId];
    if (profiles[mappedId] && profiles[mappedId].registrationStatus === 'registered') {
      return { profileId: mappedId, status: 'resolved' };
    }
  }

  if (input.caseType && caseTypeMappings[input.caseType]) {
    const mappedId = caseTypeMappings[input.caseType];
    if (profiles[mappedId] && profiles[mappedId].registrationStatus === 'registered') {
      return { profileId: mappedId, status: 'resolved' };
    }
  }

  if (input.caseType && legacyMappings[input.caseType]) {
    const mappedId = legacyMappings[input.caseType];
    if (profiles[mappedId] && profiles[mappedId].registrationStatus === 'registered') {
      return { profileId: mappedId, status: 'resolved' };
    }
  }

  return { profileId: null, status: 'unresolved' };
}

export function resolveWorkflowTemplate(profileId: ProfileId): TemplateResolutionResult {
  const profile = profiles[profileId];
  if (profile && profile.registrationStatus === 'registered') {
    return { templateId: profile.templateId, status: 'resolved' };
  }
  return { templateId: null, status: 'unresolved' };
}

export function resolveCurrentStep(_input: unknown): StepResolutionResult {
  return { stepId: null, status: 'unresolved' };
}

export function resolveScreenDefinition(_input: unknown): unknown {
  return null;
}

export function resolveStepOperationProfile(_stepId: StepId): unknown {
  return null;
}
