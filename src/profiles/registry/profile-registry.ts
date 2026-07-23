import { Profile } from '../types/index';
import { ProfileValidator } from './profile-validator';
import { VersionRegistry } from './version-registry';

export class ProfileRegistry {
  private registry = new VersionRegistry();

  register(profile: unknown): void {
    ProfileValidator.validate(profile);
    this.registry.register(profile);
  }

  getExact(id: string, version: string): Profile | undefined {
    return this.registry.getExact(id, version);
  }

  listVersions(id: string): Profile[] {
    return this.registry.listVersions(id);
  }

  listAll(): Profile[] {
    return this.registry.listAll();
  }

  resolveActive(id: string, effectiveDate: Date): Profile {
    return this.registry.resolveActive(id, effectiveDate);
  }
}
