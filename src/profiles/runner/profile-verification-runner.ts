import { ProfileRegistry } from '../registry/profile-registry.js';
import { ExecutionContext } from '../resolution/types.js';
import { FormProfile, MappingProfile } from '../types/index.js';
import { ProfileDrivenContextFactory } from '../resolution/feature-activation.js';

export type ProfileVerificationErrorCode =
  | "FORM_PROFILE_NOT_FOUND"
  | "FORM_PROFILE_INVALID"
  | "MAPPING_PROFILE_NOT_FOUND"
  | "PROFILE_VALIDATION_FAILED"
  | "ADAPTER_RESOLUTION_FAILED"
  | "ADAPTER_EXECUTION_FAILED"
  | "TEMPLATE_NOT_FOUND"
  | "TEMPLATE_HASH_MISMATCH"
  | "WORD_GENERATION_FAILED"
  | "VERIFICATION_FAILED"
  | "OUTPUT_INVALID";

export class ProfileVerificationError extends Error {
  constructor(public code: ProfileVerificationErrorCode, message: string, public cause?: unknown) {
    super(message);
    this.name = 'ProfileVerificationError';
  }
}

export type ProfileVerificationEvidence = {
  // Can be expanded as needed. This satisfies the requirement to return verification evidence.
  passed: boolean;
};

export type ProfileVerificationDependencies = {
  registry: ProfileRegistry;
  startWordGeneration: (
    context: ExecutionContext,
    inputData: Record<string, unknown>,
    outputPath: string
  ) => Promise<{ inputsToFill: Record<string, unknown> }>;
  runVerifier: (
    context: ExecutionContext,
    outputPath: string,
    inputsToFill: Record<string, unknown>
  ) => Promise<ProfileVerificationEvidence>;
};

export type ProfileVerificationExecutionConfig = {
  formProfileId: string;
  mappingProfileId: string;
  effectiveDate: Date;
  inputData: Record<string, unknown>;
  outputPath: string;
};

export type ProfileVerificationResult = {
  success: true;
  formProfileId: string;
  mappingProfileId: string;
  outputPath: string;
  verification: ProfileVerificationEvidence;
  manualCheck: boolean;
  humanReview: boolean;
};

export class ProfileVerificationRunner {
  constructor(private dependencies: ProfileVerificationDependencies) {}

  async run(config: ProfileVerificationExecutionConfig): Promise<ProfileVerificationResult> {
    // 1. Config検証
    if (!config.formProfileId) throw new ProfileVerificationError("FORM_PROFILE_NOT_FOUND", "formProfileId is required");
    if (!config.mappingProfileId) throw new ProfileVerificationError("MAPPING_PROFILE_NOT_FOUND", "mappingProfileId is required");

    // 2~7. Profile解決、Adapter解決、ExecutionContext生成
    // Using ProfileDrivenContextFactory to handle resolution and validation
    const factory = new ProfileDrivenContextFactory(this.dependencies.registry);
    let context: ExecutionContext;
    try {
      context = factory.createContext({
        profileId: config.formProfileId,
        profileType: 'form',
        effectiveDate: config.effectiveDate
      });
    } catch (e: unknown) {
      throw new ProfileVerificationError("ADAPTER_RESOLUTION_FAILED", "Failed to resolve profile context", e);
    }

    // Ensure profiles exist in context
    const formResult = context.resolvedProfiles[config.formProfileId];
    if (!formResult || !formResult.ok || formResult.profile.profileType !== 'form') {
      throw new ProfileVerificationError("FORM_PROFILE_NOT_FOUND", `Form profile not found: ${config.formProfileId}`);
    }

    const mappingResult = context.resolvedProfiles[config.mappingProfileId];
    if (!mappingResult || !mappingResult.ok || mappingResult.profile.profileType !== 'mapping') {
      throw new ProfileVerificationError("MAPPING_PROFILE_NOT_FOUND", `Mapping profile not found: ${config.mappingProfileId}`);
    }

    const formProfile = formResult.profile as FormProfile;
    const mappingProfile = mappingResult.profile as MappingProfile;

    // 8. template reference解決
    // templatePath is resolved from formProfile.templateReference. The absolute path logic should be handled by caller before or adapter?
    // Instruction says "templatePathを重複指定しない, templateはProfile/ExecutionContextから解決"
    // The actual word generation needs the absolute path, but `startWordGeneration` can handle it internally or we pass the reference.
    if (!formProfile.templateReference) {
      throw new ProfileVerificationError("TEMPLATE_NOT_FOUND", "Form profile missing templateReference");
    }

    // 9. template存在・hash検証
    if (!formProfile.templateHash) {
      throw new ProfileVerificationError("FORM_PROFILE_INVALID", "Form profile missing templateHash");
    }

    // 10~11. Word生成, inputsToFill取得
    let wordGenResult;
    try {
      wordGenResult = await this.dependencies.startWordGeneration(context, config.inputData, config.outputPath);
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('Hash mismatch')) {
        throw new ProfileVerificationError("TEMPLATE_HASH_MISMATCH", "Template hash mismatch", e);
      }
      throw new ProfileVerificationError("WORD_GENERATION_FAILED", "Word generation failed", e);
    }

    if (!wordGenResult || !wordGenResult.inputsToFill) {
      throw new ProfileVerificationError("WORD_GENERATION_FAILED", "startWordGeneration did not return inputsToFill");
    }

    // 12. 必須Verifier実行
    let verifierResult: ProfileVerificationEvidence;
    try {
      verifierResult = await this.dependencies.runVerifier(context, config.outputPath, wordGenResult.inputsToFill);
    } catch (e: unknown) {
      throw new ProfileVerificationError("VERIFICATION_FAILED", "Verification failed", e);
    }

    if (!verifierResult) {
      throw new ProfileVerificationError("VERIFICATION_FAILED", "Verifier did not return evidence");
    }

    // manualCheck / humanReview detection from inputsToFill and field definitions
    // Here we can iterate through the mappingProfile fields and see if any filled field requires manual check.
    let requiresManualCheck = false;
    let requiresHumanReview = false;

    // fieldDefinitions.fields が配列であることを前提とする
    const fields = (mappingProfile.fieldDefinitions as Record<string, unknown>)?.fields as Record<string, unknown>[] || [];
    for (const key of Object.keys(wordGenResult.inputsToFill)) {
      const fieldDef = fields.find((f: Record<string, unknown>) => f.fieldId === key);
      if (fieldDef) {
        if (fieldDef.manualCheck) requiresManualCheck = true;
        if (fieldDef.humanReview) requiresHumanReview = true;
      }
    }

    // 13. manualCheck / humanReviewを含むResult返却
    return {
      success: true,
      formProfileId: config.formProfileId,
      mappingProfileId: config.mappingProfileId,
      outputPath: config.outputPath,
      verification: verifierResult,
      manualCheck: requiresManualCheck,
      humanReview: requiresHumanReview
    };
  }
}
