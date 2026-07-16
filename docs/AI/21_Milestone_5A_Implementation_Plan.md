# Milestone 5-A Implementation Plan

This plan details the implementation for "Practice Assistant V2 Milestone 5-A Request v1.0", focusing on standardizing the AI documentation numbering, establishing YAML frontmatter schemas, creating JSON verification/audit logs, and automating governance scripts (`ai:verify`, `ai:precommit`).

## User Review Required
> [!IMPORTANT]
> Please review the proposed scripts, JSON schemas, and file migration mapping before I proceed with execution.

## Proposed Changes

### 1. Numbering Documentation Migration
Migrate existing `docs/AI/` files to the new numbered structure.
- **[MODIFY]** `AI_Package.md` → `01_AI_Package.md` (Update format to include YAML frontmatter and migrate current state).
- **[NEW]** `05_Audit_Log.jsonl` (Initialize empty or with an initial event).
- **[NEW]** `06_Verification_Result.json` (Generated mechanically by script).
- **[NEW]** `07_Security_Governance.md` (Create with required placeholders).
- **[NEW]** `09_Human_Summary.md` (Move summary here).
- **[NEW]** `03_Architecture.md` (Migrate from `01_Project/Architecture.md`).
- **[NEW]** `04_Decisions.md` (Migrate from `01_Project/Decisions.md`).
- **[NEW]** `99_Archive/` (Move deprecated `01_Project/Current_Status.md`, `01_Project/Known_Issues.md`, etc.).

### 2. Governance Automation Scripts
Create new Node.js scripts in `scripts/ai-governance/` to mechanize the verification and audit processes.

- **[NEW]** `scripts/ai-governance/verify-project-state.mjs`
  - Runs tests, verify scripts, build, lint.
  - Generates `06_Verification_Result.json` mechanically.
- **[NEW]** `scripts/ai-governance/validate-ai-package.mjs`
  - Parses `01_AI_Package.md` YAML frontmatter.
  - Validates required keys, types, Git consistency (no stale HEAD/working tree), and result hash matching.
- **[NEW]** `scripts/ai-governance/append-audit-event.mjs`
  - Utility to append strict JSONL events to `05_Audit_Log.jsonl`.
- **[NEW]** `scripts/ai-governance/tests/validators.test.mjs`
  - Tests for AI Package validator, Verification Result generator, and Audit Log appended rules.

### 3. package.json Updates
- **[MODIFY]** `package.json`
  - Add `"ai:verify": "node scripts/ai-governance/verify-project-state.mjs"`
  - Add `"ai:precommit": "node scripts/ai-governance/validate-ai-package.mjs"`

## Verification Plan

### Automated Tests
- Run `node --test scripts/ai-governance/tests/*.test.mjs` to ensure the new schema validators and audit log scripts behave correctly (including failure states like missing keys or hash mismatch).
- Run `npm run ai:verify` to execute the full Word Engine pipeline, build, lint, and generate `06_Verification_Result.json`.
- Run `npm run ai:precommit` to ensure `01_AI_Package.md` is valid and matches the `06_Verification_Result.json` hash and actual Git state.

### Manual Verification
- Stop exactly before commit/push.
- Audit Git diff to ensure no real customer data, no `docx` files, and no unintended application logic changes.
- Ensure the numbering migration successfully retained all past decisions and architecture rules without broken references.
