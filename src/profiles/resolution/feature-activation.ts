import { ProfileRegistry } from '../registry/profile-registry.js';
import { ProfileResolver } from './profile-resolver.js';
import { DefaultExecutionContextBuilder } from './execution-context-builder.js';
import { ExecutionContext, ResolveRequest, ResolveResult } from './types.js';
import { Profile } from '../types/index.js';

export class ProfileDrivenContextFactory {
  constructor(private registry: ProfileRegistry) {}

  /**
   * Explicitly activates the profile-driven path and builds an ExecutionContext.
   */
  createContext(request: ResolveRequest): ExecutionContext {
    const resolver = new ProfileResolver(this.registry);
    const builder = new DefaultExecutionContextBuilder();

    const results: ResolveResult<Profile>[] = resolver.resolve(request);
    
    // Will throw if there are any errors in resolution results
    return builder.build(request.effectiveDate, results);
  }
}
