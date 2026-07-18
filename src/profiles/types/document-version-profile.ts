import { BaseProfile } from './base-profile';

export interface DocumentVersionProfile extends BaseProfile {
  profileType: 'document-version';
  documentId: string;
  caseId: string;
  generatedAt: string; // ISO 8601 Datetime
  lawProfileId: string;
  formProfileId: string;
  mappingProfileId: string;
  verificationResultHash?: string;
  outputHash?: string;
  approvedBy?: string;
  approvedAt?: string; // ISO 8601 Datetime
  correctionReason?: string;
}
