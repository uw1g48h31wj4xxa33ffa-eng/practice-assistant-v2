import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export class VersionGuard {
  static verifyPaths(inputPath, outputPath) {
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file not found: ${inputPath}`);
    }
    const resolvedInput = path.resolve(inputPath);
    const resolvedOutput = path.resolve(outputPath);
    if (resolvedInput === resolvedOutput) {
      throw new Error('Input path and output path must be different.');
    }
  }

  static calculateSha256(buffer) {
    const hash = crypto.createHash('sha256');
    hash.update(buffer);
    return hash.digest('hex');
  }

  static verifyHash(buffer, expectedHash) {
    const actualHash = this.calculateSha256(buffer);
    if (actualHash !== expectedHash) {
      throw new Error(`Hash mismatch. Expected: ${expectedHash}, Actual: ${actualHash}`);
    }
  }

  static verifyVersionString(wordDoc, versionString) {
    const documentXmlStr = wordDoc.zip.file('word/document.xml').asText();
    const plainText = documentXmlStr.replace(/<[^>]+>/g, '');
    if (!plainText.includes(versionString)) {
      throw new Error(`Version string "${versionString}" not found in document.xml`);
    }
  }
}
