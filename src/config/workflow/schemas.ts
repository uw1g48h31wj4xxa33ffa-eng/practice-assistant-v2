import { DataSchema } from '../../domain/workflow/types';

export const schemas: Record<string, DataSchema> = {
  v1: {
    version: '1.0.0',
    requiredFields: ['id', 'caseType', 'title']
  }
};
