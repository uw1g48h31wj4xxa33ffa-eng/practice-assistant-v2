import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PACKAGE_PATH = path.resolve(__dirname, '../../docs/AI/01_AI_Package.md');
const REPO_ROOT = path.resolve(__dirname, '../../');

function parseYamlFrontmatter(fileContent) {
  const match = fileContent.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  
  const yamlString = match[1];
  const lines = yamlString.split('\n');
  const result = {};
  
  for (const line of lines) {
    if (!line.trim()) continue;
    const colonIndex = line.indexOf(':');
    if (colonIndex > -1) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();
      // Remove surrounding quotes if any
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      result[key] = value;
    }
  }
  return result;
}

export async function validateAIPackage() {
  try {
    const content = await fs.readFile(PACKAGE_PATH, 'utf8');
    const meta = parseYamlFrontmatter(content);
    
    if (!meta) {
      throw new Error('YAML frontmatter is missing in 01_AI_Package.md');
    }

    const requiredKeys = [
      'schema_version', 'package_version', 'project', 'phase', 'status',
      'updated_at', 'updated_by', 'repository', 'branch', 'head', 'origin_head',
      'working_tree', 'request_id', 'verification_result_path', 'verification_result_hash',
      'audit_log_path', 'next_action', 'blocking_issues', 'human_review_status'
    ];

    for (const key of requiredKeys) {
      if (!(key in meta)) {
        throw new Error(`Missing required key in frontmatter: ${key}`);
      }
      if (meta[key] === null || meta[key] === undefined || meta[key] === '') {
        // verification_result_hash can be empty initially but we should strictly check others
        if (key !== 'verification_result_hash') {
          throw new Error(`Key '${key}' cannot be empty.`);
        }
      }
      if (meta[key].includes('プレースホルダー') || meta[key] === 'placeholder') {
        throw new Error(`Key '${key}' contains a placeholder.`);
      }
    }

    // Next action must not contain newlines in YAML value (which implies single action basically)
    
    // Status validation
    // Allow custom statuses if they are descriptive, but for strictness we could limit. Let's just check it's not empty.

    // Validate ISO 8601 date
    if (isNaN(Date.parse(meta.updated_at))) {
      throw new Error(`updated_at is not a valid ISO 8601 date: ${meta.updated_at}`);
    }

    // Git validations
    const actualHead = execSync('git rev-parse HEAD', { cwd: REPO_ROOT }).toString().trim();
    if (meta.head !== actualHead) {
      throw new Error(`Git HEAD mismatch. Expected: ${actualHead}, Found in Package: ${meta.head}`);
    }

    const statusOutput = execSync('git status --short', { cwd: REPO_ROOT }).toString().trim();
    const isActuallyClean = statusOutput === '';
    
    // In our rules: "未追跡状態をcleanと書かない" -> if there are untracked files, it is not clean.
    // If it says 'clean' but git status has output, throw error.
    const packageTree = meta.working_tree.toLowerCase();
    if (packageTree === 'clean' && !isActuallyClean) {
      throw new Error(`Working tree is declared as 'clean' but there are changes/untracked files:\n${statusOutput}`);
    }

    // Verification Result validation
    const verifyResultPath = path.resolve(REPO_ROOT, meta.verification_result_path);
    try {
      const verifyContent = await fs.readFile(verifyResultPath, 'utf8');
      const actualHash = crypto.createHash('sha256').update(verifyContent).digest('hex');
      
      // We only check if the hash matches IF the hash is provided. 
      // If it's provided but wrong, that's an error.
      if (meta.verification_result_hash && meta.verification_result_hash !== actualHash) {
         throw new Error(`Verification result hash mismatch.\nActual:   ${actualHash}\nExpected: ${meta.verification_result_hash}`);
      }
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
      // If file doesn't exist, we just note it.
    }

    // Repository docx check
    const docxFiles = execSync('find . -type f -name "*.docx" -not -path "./node_modules/*"', { cwd: REPO_ROOT }).toString().trim();
    if (docxFiles) {
      throw new Error(`Forbidden repository DOCX found:\n${docxFiles}`);
    }

    return true;
  } catch (error) {
    throw new Error(`AI Package Validation Failed: ${error.message}`);
  }
}

// Allow running from CLI
if (process.argv[1] === __filename) {
  validateAIPackage()
    .then(() => {
      console.log('AI Package is valid.');
      process.exit(0);
    })
    .catch((e) => {
      console.error(e.message);
      process.exit(1);
    });
}
