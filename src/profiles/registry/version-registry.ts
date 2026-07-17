import { Profile } from '../types/index.js';

export class VersionRegistry {
  private versions: Map<string, Profile> = new Map();

  register(profile: Profile): void {
    const key = `${profile.id}@${profile.version}`;
    if (this.versions.has(key)) {
      throw new Error(`Profile already registered: ${key}`);
    }
    this.versions.set(key, profile);
  }

  getExact(id: string, version: string): Profile | undefined {
    return this.versions.get(`${id}@${version}`);
  }

  listVersions(id: string): Profile[] {
    return Array.from(this.versions.values()).filter(p => p.id === id);
  }

  resolveActive(id: string, effectiveDate: Date): Profile {
    const versions = this.listVersions(id);
    const time = effectiveDate.getTime();

    const active = versions.filter(p => {
      if (p.status !== 'active') return false;
      const from = new Date(p.effectiveFrom).getTime();
      const to = p.effectiveTo ? new Date(p.effectiveTo).getTime() : Infinity;
      return time >= from && time < to;
    });

    if (active.length === 0) {
      throw new Error(`No applicable active version found for ${id} on ${effectiveDate.toISOString()}`);
    }

    if (active.length > 1) {
      throw new Error(`Ambiguous active versions found for ${id} on ${effectiveDate.toISOString()}`);
    }

    return active[0];
  }
}
