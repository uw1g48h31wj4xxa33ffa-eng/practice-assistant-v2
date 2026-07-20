import fs from 'node:fs';
import path from 'node:path';
import { ProfileRegistry } from './profile-registry.js';
import { Profile } from '../types/index.js';

export interface ProfileLoadError {
  filePath: string;
  error: string;
}

export interface ReferenceError {
  sourceProfileId: string;
  sourceProfileVersion: string;
  referencedField: string;
  referencedId: string;
  expectedType?: string;
  error: string;
}

export interface ProfileLoadReport {
  success: boolean;
  loadedCount: number;
  loadErrors: ProfileLoadError[];
  referenceErrors: ReferenceError[];
}

export class ProfileLoader {
  constructor(private registry: ProfileRegistry) {}

  /**
   * Loads all JSON files from a directory, registers them, and validates cross-profile references.
   * Returns a detailed load report.
   */
  loadFromDirectory(dirPath: string): ProfileLoadReport {
    const report: ProfileLoadReport = {
      success: true,
      loadedCount: 0,
      loadErrors: [],
      referenceErrors: []
    };

    if (!fs.existsSync(dirPath)) {
      report.success = false;
      report.loadErrors.push({ filePath: dirPath, error: 'Directory does not exist' });
      return report;
    }

    // Phase 1: Parse and Register
    this.processDirectory(dirPath, report);

    // Phase 2: Cross-Profile Reference Validation
    if (report.success) {
      this.validateReferences(report);
    }

    if (report.loadErrors.length > 0 || report.referenceErrors.length > 0) {
      report.success = false;
    }

    return report;
  }

  private processDirectory(dirPath: string, report: ProfileLoadReport): void {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        this.processDirectory(filePath, report);
      } else if (file.endsWith('.json')) {
        this.loadFile(filePath, report);
      }
    }
  }

  private loadFile(filePath: string, report: ProfileLoadReport): void {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(content);

      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          this.registry.register(item);
          report.loadedCount++;
        }
      } else {
        this.registry.register(parsed);
        report.loadedCount++;
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      report.loadErrors.push({ filePath, error: msg });
      report.success = false;
    }
  }

  private validateReferences(report: ProfileLoadReport): void {
    const allProfiles = this.registry.listAll();

    for (const profile of allProfiles) {
      this.checkProfileReferences(profile, report);
    }
  }

  private checkProfileReferences(profile: Profile, report: ProfileLoadReport): void {
    const checkRef = (field: string, refId: string | undefined, expectedType: string) => {
      if (!refId) return;

      const candidates = this.registry.listVersions(refId);
      if (candidates.length === 0) {
        report.referenceErrors.push({
          sourceProfileId: profile.id,
          sourceProfileVersion: profile.version,
          referencedField: field,
          referencedId: refId,
          expectedType,
          error: `Referenced Profile '${refId}' does not exist in registry`
        });
        return;
      }

      // Check if type matches. If ANY candidate matches, it's fine.
      // But typically all versions of an ID have the same type.
      const typeMatches = candidates.some(c => c.profileType === expectedType);
      if (!typeMatches) {
        report.referenceErrors.push({
          sourceProfileId: profile.id,
          sourceProfileVersion: profile.version,
          referencedField: field,
          referencedId: refId,
          expectedType,
          error: `Referenced Profile '${refId}' exists but is not of expected type '${expectedType}'`
        });
      }
    };

    // Form Profile
    if (profile.profileType === 'form') {
      checkRef('mappingProfileId', profile.mappingProfileId, 'mapping');
      checkRef('verificationRuleProfileId', profile.verificationRuleProfileId, 'verification-rule');
    }

    // Mapping Profile
    if (profile.profileType === 'mapping') {
      checkRef('formProfileId', profile.formProfileId, 'form');
    }

    // Document Version Profile
    if (profile.profileType === 'document-version') {
      checkRef('lawProfileId', profile.lawProfileId, 'law');
      checkRef('formProfileId', profile.formProfileId, 'form');
      checkRef('mappingProfileId', profile.mappingProfileId, 'mapping');
    }

    // Note: Workflow Profile references are embedded in 'steps' and need specific schema rules
    // to validate effectively. We currently validate standard top-level fields.
  }
}
