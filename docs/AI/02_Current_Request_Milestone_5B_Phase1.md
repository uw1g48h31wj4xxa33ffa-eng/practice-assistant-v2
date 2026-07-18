# 02_Current_Request
## Practice Assistant V2 — Milestone 5-B Phase 1
## Profile Schema and Version Registry Foundation

**Task ID:** PA-V2-M5B-P1  
**Status:** Ready for implementation  
**Primary actor:** Gemini  
**Human approval state:** Implementation authorized within this Request  

---

## 0. Required Reading Order

Before making any change, read in this order:

1. `docs/AI/00_AI_Development_Master_v4.0.md`
2. `docs/AI/01_AI_Package.md`
3. this file: `docs/AI/02_Current_Request.md`
4. `docs/AI/03_Architecture.md`
5. `docs/AI/04_Decisions.md`
6. `docs/AI/10_Practice_Assistant_V2_Next_Architecture_v1.0.md`, if it exists
7. only the source files required to execute this task

The repository and numbered Markdown assets are the source of truth. Chat history is not the source of truth.

身勝手な推測や独断は絶対にしないでください。  
指示書を忠実に守ってください。

---

## 1. Objective

Implement the minimum safe foundation for Milestone 5-B so that Practice Assistant V2 can manage versioned domain Profiles independently from the Word Document Engine and application UI.

This phase establishes:

- common Profile metadata;
- typed Profile definitions;
- JSON Schema validation;
- Profile registration and resolution;
- version/effective-period resolution;
- representative synthetic Profile fixtures;
- machine-verifiable tests.

The implementation must not migrate existing production document mappings or alter existing document-generation behavior in this phase.

---

## 2. Architectural Intent

Introduce a Profile layer between case/domain data and engines.

```text
Domain / Profile Layer
├── Law Profile
├── Form Profile
├── Mapping Profile
├── Verification Rule Profile
├── Document Version Profile
├── Workflow Profile
└── AI Capability Profile

Engine / Adapter Layer
├── Word Document Engine
├── OutputVerifier
├── DomSerializationVerifier / Structural Verifier
└── Evidence Generator
```

Profiles must be versioned, reproducible, independently validated, and resolvable by effective date.

AI must not receive approval authority. Law-related Profiles support structured checks and evidence linkage, but do not replace professional legal judgment.

---

## 3. In Scope

### 3.1 Runtime source structure

Create the smallest coherent structure consistent with the existing repository. Prefer:

```text
src/profiles/
├── registry/
│   ├── profile-registry.ts
│   ├── profile-loader.ts
│   └── version-registry.ts
├── types/
│   ├── base-profile.ts
│   ├── law-profile.ts
│   ├── form-profile.ts
│   ├── mapping-profile.ts
│   ├── verification-rule-profile.ts
│   ├── document-version-profile.ts
│   ├── workflow-profile.ts
│   ├── ai-capability-profile.ts
│   └── index.ts
├── schemas/
├── fixtures/
└── index.ts
```

If the repository has an established equivalent convention, use it instead and record the reason in `03_Architecture.md` or `04_Decisions.md` as appropriate. Do not create duplicate responsibility boundaries.

### 3.2 Common Profile metadata

Define a common base that supports at least:

```text
id
profileType
schemaVersion
version
status
effectiveFrom
effectiveTo
supersedes
sourceReferences
sourceHashes
createdAt
updatedAt
```

Status must support at least:

```text
draft
active
deprecated
archived
```

Use one canonical naming convention across TypeScript, JSON Schema, fixtures, and tests. Do not mix `profileVersion` and `version` without a documented compatibility reason.

### 3.3 Profile types

Implement typed definitions and JSON Schemas for:

1. `LawProfile`
2. `FormProfile`
3. `MappingProfile`
4. `VerificationRuleProfile`
5. `DocumentVersionProfile`
6. `WorkflowProfile`
7. `AICapabilityProfile`

Minimum required metadata must remain consistent with `10_Practice_Assistant_V2_Next_Architecture_v1.0.md`.

### 3.4 Registry and loader

Implement a minimal in-memory foundation that can:

- register a Profile;
- reject duplicate identity/version registrations;
- retrieve by ID and exact version;
- list registered versions;
- resolve the active version for a specified effective date;
- reject ambiguous active versions;
- reject a Profile that fails Schema validation;
- return explicit typed errors rather than silent fallback;
- cache only after successful validation.

Persistence, database integration, and remote loading are not required.

### 3.5 Version resolution

The version resolver must account for:

- `effectiveFrom` inclusive;
- `effectiveTo` exclusive, unless the repository already has a documented different convention;
- `draft`, `deprecated`, and `archived` handling;
- overlapping active periods;
- no applicable version;
- supersession metadata.

Document the chosen boundary convention in `04_Decisions.md`.

### 3.6 Synthetic fixtures

Add synthetic, non-client fixtures sufficient to test the architecture.

Use neutral IDs such as:

```text
career-up-r8-form
hatarakikata-r8-form
```

These fixtures are architecture/test data only. They must not claim official legal completeness, current legal validity, or production approval.

### 3.7 Documentation assets

Use the existing numbered-document model.

Do not create separate ad hoc files such as `07_Milestone5B_...`, `08_Milestone5B_...`, or `09_Milestone5B_...` when their responsibilities already belong to numbered assets.

Update only when materially required:

- `docs/AI/03_Architecture.md`
- `docs/AI/04_Decisions.md`
- `docs/AI/08_Profiles/` for canonical Profile schemas/examples, if this directory is already established or is required by Master v4.0

Always update after execution:

- `docs/AI/01_AI_Package.md`
- `docs/AI/06_Verification_Result.json` through the approved generator
- `docs/AI/05_Audit_Log.jsonl` by append-only event
- `docs/AI/09_Human_Summary.md`

Do not manually fabricate machine evidence.

---

## 4. Explicitly Out of Scope

Do not implement or modify:

- existing Career Up or Hatarakikata production mappings;
- Word template content;
- Word Document Engine behavior;
- existing Locator, Filler, Validator, or Verifier behavior;
- OutputVerifier rules;
- DomSerializationVerifier / Structural Verifier rules;
- case UI;
- OCR;
- RAG;
- law-research automation;
- database persistence;
- API endpoints;
- production RBAC/ABAC;
- correction/reissue workflow;
- real client data handling;
- unrelated lint remediation;
- unrelated refactoring or renaming.

---

## 5. Implementation Constraints

- Use strict TypeScript.
- `any` is prohibited.
- Avoid unsafe type assertions used only to bypass Schema differences.
- Prefer discriminated unions for Profile types.
- JSON Schema must use Draft 2020-12 unless the repository already standardizes another draft; stop and report a conflict before changing an established standard.
- Use the repository's existing validation dependency when suitable.
- Do not add a new dependency without confirming that no existing dependency satisfies the requirement.
- No silent fallback between Profile versions or AI providers.
- No automatic legal conclusion.
- No Profile may self-approve or mark human review as completed.
- Old versions must remain resolvable for historical reproducibility.
- Errors must identify the Profile ID, version, and failure category without exposing protected data.

---

## 6. Required Tests

Add focused tests covering at least:

### Schema validation

- valid Profile for every implemented Profile type;
- missing required metadata;
- invalid status;
- invalid date format;
- invalid source hash shape where enforced;
- unknown Profile type;
- additional unexpected properties according to the chosen strictness policy.

### Registry

- successful registration;
- exact retrieval;
- missing Profile;
- duplicate ID/version rejection;
- invalid Profile rejected before caching;
- list versions.

### Version resolution

- date before first effective version;
- effectiveFrom boundary;
- date within active period;
- effectiveTo boundary;
- deprecated version behavior;
- archived version exclusion;
- overlapping active versions rejected;
- no applicable version rejected;
- supersession metadata retained.

### Compatibility

- existing document verification tests remain unchanged and pass;
- existing official generation path remains unchanged;
- no source DOCX hash changes;
- no repository DOCX is added.

Do not weaken, skip, delete, or rewrite existing tests to obtain a passing result.

---

## 7. Gate 1 — Baseline

Before implementation, record and evaluate:

```bash
pwd
git remote -v
git branch --show-current
git fetch origin
git rev-parse HEAD
git rev-parse origin/main
git status --short
```

Also confirm:

- required numbered Markdown files exist;
- the current Request is the active Request;
- no unrelated writer is modifying `01_AI_Package.md`;
- current verification evidence is readable;
- current source/form hashes required by the existing verification path are available.

Stop if:

- repository identity is wrong;
- branch is not the approved branch;
- unrelated uncommitted changes exist and cannot be safely separated;
- required documentation or evidence is missing or inconsistent;
- the requested architecture conflicts materially with existing code and cannot be resolved without expanding scope.

Do not stop solely because HEAD differs from an older Request. Use state-based validation.

---

## 8. Gate 2 — Implementation

Implement the smallest complete vertical foundation.

Required sequence:

1. inspect existing architecture and dependencies;
2. confirm canonical naming and file placement;
3. implement shared types;
4. implement JSON Schemas;
5. implement Schema validation adapter;
6. implement registry and version resolution;
7. add synthetic fixtures;
8. add focused tests;
9. update static architecture/decision documents only where materially changed.

Do not perform opportunistic cleanup.

---

## 9. Gate 3 — Automated Verification

Run all applicable repository-standard commands, including:

- new Profile tests;
- all existing tests;
- formal verification scripts;
- build;
- changed-file lint;
- full lint when required by the repository standard;
- Schema validation;
- official OutputVerifier path;
- official DomSerializationVerifier / structural verification path;
- source/form hash checks;
- repository DOCX prohibition check.

For each command, machine evidence must capture:

```text
command
exitCode
pass/fail/warning counts when available
startedAt
finishedAt
result
stdout/stderr digest or approved equivalent
```

Known pre-existing full-project lint findings must be separated from current-change lint findings. New or modified files must have zero lint errors and zero lint warnings unless the Master explicitly permits otherwise.

A `PASS` without evidence is unverified.

---

## 10. Gate 4 — Documentation and Evidence

After successful implementation and verification:

1. update `03_Architecture.md` only for material architecture changes;
2. update `04_Decisions.md` with the canonical naming, date-boundary convention, strictness policy, and dependency decision;
3. place canonical Profile schemas/examples in `08_Profiles/` if required by the repository architecture;
4. regenerate `06_Verification_Result.json` through the approved script;
5. append an implementation event to `05_Audit_Log.jsonl` using the approved append workflow;
6. update `01_AI_Package.md` with current facts and exactly one next action;
7. update `09_Human_Summary.md` concisely.

Keep these statuses separate:

```text
AI implemented
Machine verified
Human reviewed
Human approved
```

Do not record human review or approval unless the human has explicitly performed it.

---

## 11. Gate 5 — Diff Audit, Commit, and Push

Commit and push are authorized only if Gates 1–4 pass.

Before staging:

```bash
git status --short
git diff --stat
git diff --name-only
git diff
```

Confirm:

- only approved Milestone 5-B files changed;
- no real client or personal information is present;
- no temporary/debug/generated junk is present;
- no DOCX was added;
- no existing tests were weakened;
- no unrelated application behavior changed.

Stage explicit paths only.

Forbidden:

```bash
git add .
git add -A
```

Then audit the staged diff:

```bash
git diff --cached --stat
git diff --cached --name-only
git diff --cached
```

Use this commit message unless the actual scope materially differs:

```text
feat(profiles): add versioned profile registry foundation
```

Push to the approved main branch, then verify:

```bash
git rev-parse HEAD
git rev-parse origin/main
git status --short
```

Required final state:

```text
HEAD = origin/main
working tree clean
```

If final documentation or audit-log updates occur after the implementation commit, commit and push them explicitly, then re-verify the final state. Do not report a clean repository before the final append/update is committed.

---

## 12. Stop Conditions

Stop before implementation, commit, or push when any of the following occurs:

- instructions conflict with the Master or repository facts;
- an architecture change beyond this Request is required;
- an existing production mapping or engine behavior must be changed;
- source/form hash changes unexpectedly;
- Schema validation cannot be made deterministic;
- ambiguous version resolution remains unresolved;
- a new dependency is required but not justified;
- tests, verify, build, or changed-file lint fail;
- machine evidence generation fails;
- unrelated changes are present in the staged diff;
- protected or real client data is found;
- human approval is required for an action not authorized here.

When stopped, do not improvise. Update the AI Package with the exact blocker and one recommended next action, without committing incomplete work unless the Master explicitly permits a safe checkpoint.

---

## 13. Completion Criteria

This task is complete only when all are true:

- all seven Profile types have strict TypeScript definitions;
- all seven Profile types have machine-validatable JSON Schemas;
- common metadata is canonical and consistently named;
- registry registration and retrieval work;
- date-based version resolution works and rejects ambiguity;
- invalid Profiles cannot enter the cache/registry;
- synthetic fixtures exist without claiming legal completeness;
- focused new tests pass;
- all existing tests and formal verification pass;
- build passes;
- changed-file lint has zero errors and warnings;
- existing Word generation behavior and source hashes are unchanged;
- numbered Markdown assets are updated without duplication;
- Verification Result is machine-generated and valid;
- Audit Log is appended through the approved workflow;
- AI Package contains exactly one next action;
- approved files only are committed and pushed;
- `HEAD = origin/main`;
- working tree is clean;
- human review/approval remains correctly marked as pending unless explicitly completed.

---

## 14. Required Final Human Report

Return only a concise report in this format:

```text
■ 結論

■ 実施

■ 検証結果

■ Git

■ リスク・要確認

■ 人間確認状態

■ 次工程
```

Include:

- implementation commit hash;
- any later documentation/audit commit hash;
- changed-file list summary;
- new test count and total test result as measured;
- verify/build/lint results;
- source/form hash result;
- final HEAD/origin equality;
- final working-tree state;
- exactly one proposed next action.

Do not provide unsupported success claims.
