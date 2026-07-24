import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

type StoreEntry = {
  filePath: string;
  fileName: string;
  contentType: string;
  expiresAt: number;
};

// 15 minutes TTL
const TTL_MS = 15 * 60 * 1000;

class GeneratedStore {
  private store = new Map<string, StoreEntry>();

  constructor() {
    // Basic periodic cleanup every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000).unref();
  }

  register(downloadId: string, buffer: Buffer, fileName: string, contentType: string): void {
    if (this.store.has(downloadId)) {
      throw new Error('DUPLICATE_DOWNLOAD_ID');
    }

    const tempDir = os.tmpdir();
    // Do not include client name in fileName/path. It should be opaque.
    const filePath = path.join(tempDir, `pa2_gen_${downloadId}.docx`);
    fs.writeFileSync(filePath, buffer);

    this.store.set(downloadId, {
      filePath,
      fileName,
      contentType,
      expiresAt: Date.now() + TTL_MS
    });
  }

  lookup(downloadId: string): { buffer: Buffer; fileName: string; contentType: string } | null {
    const entry = this.store.get(downloadId);
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.deleteEntry(downloadId, entry);
      throw new Error('DOWNLOAD_EXPIRED');
    }

    if (!fs.existsSync(entry.filePath)) {
      this.store.delete(downloadId);
      throw new Error('FILE_MISSING');
    }

    const buffer = fs.readFileSync(entry.filePath);
    return {
      buffer,
      fileName: entry.fileName,
      contentType: entry.contentType
    };
  }

  private deleteEntry(downloadId: string, entry: StoreEntry) {
    this.store.delete(downloadId);
    if (fs.existsSync(entry.filePath)) {
      try {
        fs.unlinkSync(entry.filePath);
      } catch (e) {
        console.error(`Failed to delete temp file ${entry.filePath}`, e);
      }
    }
  }

  cleanup() {
    const now = Date.now();
    for (const [id, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.deleteEntry(id, entry);
      }
    }
  }

  // Exposed for tests
  _forceSetTimeOffset() {
    // For test purposes only, typically we'd inject a clock. 
    // We'll keep it simple here.
  }
}

export const generatedStore = new GeneratedStore();
