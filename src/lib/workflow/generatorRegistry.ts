import { GeneratorKey } from '../../domain/workflow/generatorTypes';
import { GeneratorResolutionResult } from '../../domain/workflow/resultTypes';
import { RegistryStatus } from '../../domain/workflow/types';

export class GeneratorRegistry {
  private registeredKeys: Set<GeneratorKey> = new Set();
  
  // Real registration and adapter implementations are deferred to Phase 0B.
  // Phase 0A only defines the type-safe contract without importing actual generators.

  public resolveStatus(key: GeneratorKey): GeneratorResolutionResult {
    // In Phase 0A, we don't consider any generators as 'registered' yet,
    // to strictly adhere to the disconnected constraint.
    const status: RegistryStatus = 'unavailable'; 

    return {
      key,
      status
    };
  }
}
