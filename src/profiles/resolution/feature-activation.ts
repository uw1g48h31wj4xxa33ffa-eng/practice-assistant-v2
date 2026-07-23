import { ProfileRegistry } from '../registry/profile-registry';
import { ProfileResolver } from './profile-resolver';
import { DefaultExecutionContextBuilder } from './execution-context-builder';
import { ExecutionContext, ResolveRequest, ResolveResult } from './types';
import { Profile } from '../types/index';

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
