export type ExecutableGeneratorKey = 
  | 'issue_analysis' 
  | 'risk_analysis' 
  | 'action_plan' 
  | 'evidence_labor' 
  | 'evidence_rules' 
  | 'evidence_subsidy' 
  | 'delivery_subsidy';

export type ReservedGeneratorKey = 
  | 'delivery_labor' 
  | 'guideline_review' 
  | 'document_prep';

export type GeneratorKey = ExecutableGeneratorKey | ReservedGeneratorKey;

export interface GeneratorMap {
  issue_analysis: {
    input: never;
    output: unknown[];
  };
  risk_analysis: {
    input: never;
    output: unknown[];
  };
  action_plan: {
    input: never;
    output: unknown[];
  };
  evidence_labor: {
    input: unknown;
    output: unknown[];
  };
  evidence_rules: {
    input: unknown;
    output: unknown[];
  };
  evidence_subsidy: {
    input: unknown;
    output: unknown[];
  };
  delivery_subsidy: {
    input: unknown;
    output: unknown[];
  };
}
