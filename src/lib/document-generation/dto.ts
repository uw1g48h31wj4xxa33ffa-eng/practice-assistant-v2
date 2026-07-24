export type VerificationStatusForGeneration = "verified" | "modified";

export type ConfirmedDocumentFieldDTO = {
  fieldId: string;
  value: string | number | boolean | null;
  sourceExtractedInfoId: string;
  verificationStatus: VerificationStatusForGeneration;
};

export type WordGenerationRequestDTO = {
  caseId: string;
  templateId: "hatarakikata-r8-form1";
  effectiveDate: string;
  confirmedFields: ConfirmedDocumentFieldDTO[];
};

export type GenerationVerifierStatus =
  | "Success"
  | "Failed"
  | "NotRun";

export type GenerationErrorDTO = {
  code: string;
  message: string;
  retryable: boolean;
  fieldIds?: string[];
};

export type GenerationResultDTO = {
  success: boolean;
  caseId: string;
  templateId: string;
  outputFileName?: string;
  downloadId?: string;
  manualCheck: boolean;
  humanReview: boolean;
  verification: {
    outputVerifier: GenerationVerifierStatus;
    domSerializationVerifier: GenerationVerifierStatus;
  };
  warnings: string[];
  errors: GenerationErrorDTO[];
};
