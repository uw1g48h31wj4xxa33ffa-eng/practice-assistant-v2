import { StepOperationProfile } from '../../domain/workflow/types';

export const stepOperations: Record<string, StepOperationProfile> = {
  hearing: {
    stepId: 'hearing',
    title: 'ヒアリング',
  },
  issue_analysis: {
    stepId: 'issue_analysis',
    title: '論点整理',
  },
  risk_analysis: {
    stepId: 'risk_analysis',
    title: 'リスク整理',
  },
  action_plan: {
    stepId: 'action_plan',
    title: '対応方針',
  },
  evidence: {
    stepId: 'evidence',
    title: 'AI検証・エビデンス',
  },
  delivery: {
    stepId: 'delivery',
    title: '納品・完了',
  }
};
