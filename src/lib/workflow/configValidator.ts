import { ValidationResult } from '../../domain/workflow/resultTypes';

export function validateConfig(): ValidationResult {
  // Real implementation and execution tests are deferred to Phase 0B.
  // We don't implement a stub that always returns true, because 
  // that would violate the "no fake implementations that look usable" rule.
  
  return {
    isValid: false,
    errors: [
      {
        path: 'config',
        message: 'Config validation implementation is deferred to Phase 0B.'
      }
    ],
    warnings: []
  };
}
