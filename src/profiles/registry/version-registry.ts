import { Profile } from '../types/index.js';

export class VersionRegistry {
  private versions: Map<string, Profile> = new Map();

  register(profile: Profile): void {
    const key = `${profile.id}@${profile.version}`;
    if (this.versions.has(key)) {
      throw new Error(`Profile already registered: ${key}`);
    }

    if (profile.status === 'active') {
      const newFrom = new Date(profile.effectiveFrom).getTime();
      const newTo = profile.effectiveTo ? new Date(profile.effectiveTo).getTime() : Infinity;

      for (const existing of this.versions.values()) {
        if (existing.id === profile.id && existing.status === 'active') {
          const existingFrom = new Date(existing.effectiveFrom).getTime();
          const existingTo = existing.effectiveTo ? new Date(existing.effectiveTo).getTime() : Infinity;

          if (newFrom < existingTo && existingFrom < newTo) {
            throw new Error(`Profile overlap detected for id ${profile.id}: version ${profile.version} overlaps with version ${existing.version}`);
          }
        }
      }
    }

    this.versions.set(key, profile);
  }

  getExact(id: string, version: string): Profile | undefined {
    return this.versions.get(`${id}@${version}`);
  }

  listVersions(id: string): Profile[] {
    return Array.from(this.versions.values()).filter(p => p.id === id);
  }

  listAll(): Profile[] {
    return Array.from(this.versions.values());
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
