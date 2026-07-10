import { GeneratorKey } from '../../domain/workflow/generatorTypes';
import { GeneratorResolutionResult } from '../../domain/workflow/resultTypes';
import { RegistryStatus } from '../../domain/workflow/types';

export class GeneratorRegistry {
  private registeredKeys: Map<GeneratorKey, RegistryStatus> = new Map();
  
  public register(key: GeneratorKey, status: RegistryStatus): void {
    this.registeredKeys.set(key, status);
  }

  public resolveStatus(key: GeneratorKey): GeneratorResolutionResult {
    const status = this.registeredKeys.get(key) ?? 'not_registered'; 

    return {
      key,
      status
    };
  }
}
