import { 
  ProfileResolutionInput, 
  ProfileResolutionResult,
  TemplateResolutionResult
} from '../../domain/workflow/resultTypes';
import { caseTypeMappings, legacyMappings, profiles } from '../../config/workflow';
import { ProfileId } from '../../domain/workflow/types';

export function resolveWorkflowProfile(input: ProfileResolutionInput): ProfileResolutionResult {
  if (input.profileId && profiles[input.profileId] && profiles[input.profileId].registrationStatus === 'registered') {
    return { status: 'resolved', profileId: input.profileId as ProfileId, source: 'profile_id' };
  }

  if (input.templateId && legacyMappings[input.templateId]) {
    const mappedId = legacyMappings[input.templateId];
    if (profiles[mappedId] && profiles[mappedId].registrationStatus === 'registered') {
      return { status: 'resolved', profileId: mappedId, source: 'template_id' };
    }
  }

  if (input.caseType && caseTypeMappings[input.caseType]) {
    const mappedId = caseTypeMappings[input.caseType];
    if (profiles[mappedId] && profiles[mappedId].registrationStatus === 'registered') {
      return { status: 'resolved', profileId: mappedId, source: 'case_type_mapping' };
    }
  }

  return { status: 'unresolved', profileId: null, reason: 'unknown_profile' };
}

export function resolveWorkflowTemplate(profileId: ProfileId): TemplateResolutionResult {
  const profile = profiles[profileId];
  if (profile && profile.registrationStatus === 'registered') {
    return { templateId: profile.workflowTemplateId, status: 'resolved' };
  }
  return { templateId: null, status: 'unresolved' };
}
