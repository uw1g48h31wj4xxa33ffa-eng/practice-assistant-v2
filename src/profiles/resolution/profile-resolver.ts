import { ProfileRegistry } from '../registry/profile-registry.js';
import { Profile } from '../types/index.js';
import {
  ResolveRequest,
  ResolveResult,
  ResolveEvidence,
  ProfileType
} from './types.js';


export class ProfileResolver {
  constructor(private registry: ProfileRegistry) {}

  resolve(request: ResolveRequest): ResolveResult[] {
    const results: ResolveResult[] = [];
    const activePath = new Set<string>();
    const resolvedCache = new Map<string, ProfileType>();

    this.resolveRecursive(
      request.profileId,
      request.profileType,
      request.effectiveDate,
      activePath,
      resolvedCache,
      [],
      results
    );

    return results;
  }

  private resolveRecursive(
    profileId: string,
    expectedType: ProfileType,
    effectiveDate: Date,
    activePath: Set<string>,
    resolvedCache: Map<string, ProfileType>,
    parentChain: readonly ResolveEvidence[],
    results: ResolveResult[]
  ): boolean {
    if (activePath.has(profileId)) {
      results.push({ ok: false, errors: [{ code: 'CIRCULAR_REFERENCE', message: `Circular reference detected for profile: ${profileId}`, profileId }], evidenceChain: parentChain });
      return false;
    }

    const cachedType = resolvedCache.get(profileId);
    if (cachedType) {
      if (cachedType !== expectedType) {
        results.push({ ok: false, errors: [{ code: 'TYPE_MISMATCH', message: `Expected profile type ${expectedType} but found cached type ${cachedType}`, profileId }], evidenceChain: parentChain });
        return false;
      }
      return true;
    }

    if (isNaN(effectiveDate.getTime())) {
      results.push({ ok: false, errors: [{ code: 'INVALID_DATE', message: `Invalid effective date provided.`, profileId }], evidenceChain: parentChain });
      return false;
    }

    let resolvedProfile: Profile;
    try {
      resolvedProfile = this.registry.resolveActive(profileId, effectiveDate);
    } catch (e: unknown) {
      if (this.isAmbiguousResolutionError(e)) {
        results.push({ ok: false, errors: [{ code: 'AMBIGUOUS_RESOLUTION', message: `Ambiguous profile resolution for id: ${profileId}`, profileId, cause: e }], evidenceChain: parentChain });
      } else {
        results.push({ ok: false, errors: [{ code: 'RESOLUTION_FAILED', message: `Failed to resolve active profile for id: ${profileId}`, profileId, cause: e }], evidenceChain: parentChain });
      }
      return false;
    }

    if (resolvedProfile.profileType !== expectedType) {
      results.push({ ok: false, errors: [{ code: 'TYPE_MISMATCH', message: `Expected profile type ${expectedType} but found ${resolvedProfile.profileType}`, profileId }], evidenceChain: parentChain });
      return false;
    }

    const currentEvidence: ResolveEvidence = {
      profileId: resolvedProfile.id,
      profileType: resolvedProfile.profileType,
      version: resolvedProfile.version,
      effectiveFrom: resolvedProfile.effectiveFrom,
      effectiveTo: resolvedProfile.effectiveTo
    };
    const newChain: readonly ResolveEvidence[] = [...parentChain, currentEvidence];

    activePath.add(profileId);

    const dependencies = this.getDependencies(resolvedProfile);
    for (const dep of dependencies) {
      const depOk = this.resolveRecursive(
        dep.id,
        dep.type,
        effectiveDate,
        activePath,
        resolvedCache,
        newChain,
        results
      );
      if (!depOk) {
        activePath.delete(profileId);
        return false;
      }
    }

    results.push({
      ok: true,
      profile: resolvedProfile,
      evidenceChain: newChain,
      warnings: []
    });

    activePath.delete(profileId);
    resolvedCache.set(profileId, expectedType);
    return true;
  }

  private isAmbiguousResolutionError(error: unknown): boolean {
    return error instanceof Error && error.message.includes('overlaps with version');
  }

  private getDependencies(profile: Profile): { id: string, type: ProfileType }[] {
    const deps: { id: string, type: ProfileType }[] = [];
    
    if (profile.profileType === 'form') {
      if (profile.mappingProfileId) deps.push({ id: profile.mappingProfileId, type: 'mapping' });
      if (profile.verificationRuleProfileId) deps.push({ id: profile.verificationRuleProfileId, type: 'verification-rule' });
    } else if (profile.profileType === 'document-version') {
      if (profile.lawProfileId) deps.push({ id: profile.lawProfileId, type: 'law' });
      if (profile.formProfileId) deps.push({ id: profile.formProfileId, type: 'form' });
      if (profile.mappingProfileId) deps.push({ id: profile.mappingProfileId, type: 'mapping' });
    }
    
    return deps;
  }
}
