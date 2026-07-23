import { Profile } from '../types/index';

export type ProfileType = Profile['profileType'];

export interface ResolveRequest {
  readonly profileId: string;
  readonly profileType: ProfileType;
  readonly effectiveDate: Date;
}

export interface ResolveWarning {
  readonly code: string;
  readonly message: string;
  readonly profileId?: string;
}

export interface ResolveError {
  readonly code: string;
  readonly message: string;
  readonly profileId?: string;
  readonly cause?: unknown;
}

export interface ResolveEvidence {
  readonly profileId: string;
  readonly profileType: ProfileType;
  readonly version: string;
  readonly effectiveFrom: string;
  readonly effectiveTo?: string;
}

export type ResolveResult<T extends Profile = Profile> =
  | {
      readonly ok: true;
      readonly profile: T;
      readonly evidenceChain: readonly ResolveEvidence[];
      readonly warnings: readonly ResolveWarning[];
    }
  | {
      readonly ok: false;
      readonly errors: readonly ResolveError[];
      readonly evidenceChain: readonly ResolveEvidence[];
    };

export interface ExecutionContext {
  readonly effectiveDate: Date;
  readonly resolvedProfiles: Readonly<Record<string, ResolveResult<Profile>>>;
}

export interface ExecutionContextBuilder {
  build(
    effectiveDate: Date,
    results: readonly ResolveResult<Profile>[]
  ): ExecutionContext;
}
