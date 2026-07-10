import { UIProfile } from '../../domain/workflow/types';

export const uiProfiles: Record<string, UIProfile> = {
  subsidy_v1: {
    templateId: 'subsidy_v1',
    useDonutProgress: true,
    layoutType: 'subsidy'
  },
  labor_consulting_v1: {
    templateId: 'labor_consulting_v1',
    useDonutProgress: true,
    layoutType: 'subsidy'
  },
  labor_rules_v1: {
    templateId: 'labor_rules_v1',
    useDonutProgress: false,
    layoutType: 'legacy'
  }
};
