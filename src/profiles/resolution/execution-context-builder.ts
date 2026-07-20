import { Profile } from '../types/index.js';
import { ExecutionContext, ExecutionContextBuilder, ResolveResult } from './types.js';

function deepFreeze<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (obj instanceof Date) {
    return obj;
  }
  Object.freeze(obj);
  Object.getOwnPropertyNames(obj).forEach((prop) => {
    const propVal = (obj as Record<string, unknown>)[prop];
    if (propVal !== null &&
        (typeof propVal === 'object' || typeof propVal === 'function') &&
        !Object.isFrozen(propVal)) {
      deepFreeze(propVal);
    }
  });
  return obj;
}

export class DefaultExecutionContextBuilder implements ExecutionContextBuilder {
  build(
    effectiveDate: Date,
    results: readonly ResolveResult<Profile>[]
  ): ExecutionContext {
    const profilesMap: Record<string, ResolveResult<Profile>> = {};

    for (const res of results) {
      if (!res.ok) {
        throw new Error('Cannot build ExecutionContext with failed resolution results');
      }
      profilesMap[res.profile.id] = res;
    }

    const context: ExecutionContext = {
      effectiveDate,
      resolvedProfiles: profilesMap
    };

    return deepFreeze(context);
  }
}
