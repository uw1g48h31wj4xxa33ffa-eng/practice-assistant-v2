import { ValidationResult, ValidationIssue } from '../../domain/workflow/resultTypes';
import { profiles, caseTypeMappings, legacyMappings, workflowTemplates, stepOperations, uiProfiles, policies, schemas } from '../../config/workflow';

export function validateConfig(): ValidationResult {
  const issues: ValidationIssue[] = [];
  
  const registeredProfiles = Object.values(profiles).filter(p => p.registrationStatus === 'registered');
  if (registeredProfiles.length === 0) {
    issues.push({ path: 'profiles', message: 'No registered profiles found' });
  }

  for (const profile of registeredProfiles) {
    if (!workflowTemplates[profile.workflowTemplateId]) {
      issues.push({ path: `profiles.${profile.id}`, message: `Missing workflowTemplateId: ${profile.workflowTemplateId}` });
    }
  }

  for (const [caseType, profileId] of Object.entries(caseTypeMappings)) {
    const profile = profiles[profileId];
    if (!profile) {
      issues.push({ path: `caseTypeMappings.${caseType}`, message: `Missing profileId: ${profileId}` });
    } else if (profile.registrationStatus !== 'registered') {
      issues.push({ path: `caseTypeMappings.${caseType}`, message: `Profile is not registered: ${profileId}` });
    }
  }

  for (const [templateId, profileId] of Object.entries(legacyMappings)) {
    const profile = profiles[profileId];
    if (!profile) {
      issues.push({ path: `legacyMappings.${templateId}`, message: `Missing profileId: ${profileId}` });
    } else if (profile.registrationStatus !== 'registered') {
      issues.push({ path: `legacyMappings.${templateId}`, message: `Profile is not registered: ${profileId}` });
    }
  }

  for (const template of Object.values(workflowTemplates)) {
    const uniqueSteps = new Set(template.steps);
    if (uniqueSteps.size !== template.steps.length) {
      issues.push({ path: `workflowTemplates.${template.id}`, message: `Duplicate steps in template` });
    }
  }

  if (Object.keys(stepOperations).length === 0) {
    issues.push({ path: 'stepOperations', message: 'No stepOperations defined' });
  }
  if (Object.keys(uiProfiles).length === 0) {
    issues.push({ path: 'uiProfiles', message: 'No uiProfiles defined' });
  }
  if (Object.keys(policies).length === 0) {
    issues.push({ path: 'policies', message: 'No policies defined' });
  }
  if (Object.keys(schemas).length === 0) {
    issues.push({ path: 'schemas', message: 'No schemas defined' });
  }

  return {
    isValid: issues.length === 0,
    issues
  };
}
