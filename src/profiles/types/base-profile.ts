export type ProfileStatus = 'draft' | 'active' | 'deprecated' | 'archived';

export interface BaseProfile {
  id: string;
  profileType: string;
  schemaVersion: string;
  version: string;
  status: ProfileStatus;
  effectiveFrom: string;
  effectiveTo?: string;
  supersedes?: string[];
  sourceReferences?: Record<string, string>;
  sourceHashes?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}
