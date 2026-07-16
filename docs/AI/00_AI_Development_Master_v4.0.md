# 00_AI_Development_Master_v4.0
## Cross-AI Governance, Verification, and Markdown-First Standard

### Status
Permanent cross-project operating standard

### Applies To
ChatGPT, Gemini, Claude, Copilot, Codex, Perplexity, and future AI agents

---

## 0. Required Reading Order

Every AI task must begin with:

```text
00_AI_Development_Master_v4.0.md
01_AI_Package.md
02_Current_Request.md
```

Read additional static documents only when referenced by `01_AI_Package.md` or required by the task.

The repository, structured evidence, and approved Markdown assets are the source of truth.  
Chat history is not the source of truth.

身勝手な推測や独断は絶対にしないでください。  
指示書を忠実に守ってください。

---

## 1. Priority Order

1. Prevent defects, data loss, privacy violations, unauthorized changes, and false success.
2. Preserve verified behavior, legal applicability, and compatibility.
3. Replace AI self-reporting with machine-verifiable evidence.
4. Preserve auditability, version history, and human approval.
5. Minimize AI recognition load, file I/O, token use, and unnecessary exchanges.
6. Complete safely executable work in one pass.
7. Keep the project resumable when AI models, laws, forms, or infrastructure change.

Speed never overrides integrity, evidence, confidentiality, or professional review.

---

## 2. Numbered File Convention

Human discoverability is mandatory.

Use two-digit numbering for active AI documents:

```text
00_  Master / permanent rules
01_  Current AI package
02_  Current request
03_  Architecture
04_  Decisions
05_  Audit log
06_  Verification evidence
07_  Security / governance
08_  Profiles / registries
09_  Human summary
90_  Templates
99_  Archive
```

Do not create unnumbered active AI documents unless a tool requires a fixed filename.

---

## 3. Standard Repository Structure

```text
docs/AI/
├── 00_AI_Development_Master_v4.0.md
├── 01_AI_Package.md
├── 02_Current_Request.md
├── 03_Architecture.md
├── 04_Decisions.md
├── 05_Audit_Log.jsonl
├── 06_Verification_Result.json
├── 07_Security_Governance.md
├── 08_Profiles/
│   ├── AI_Capability_Profile.json
│   ├── Law_Profile.schema.json
│   ├── Form_Profile.schema.json
│   └── Document_Version_Profile.schema.json
├── 09_Human_Summary.md
├── 90_Templates/
└── 99_Archive/
```

Implementation may be phased, but the responsibility boundaries must be preserved.

---

## 4. Documentation Responsibilities

### 00 Master
Stable cross-project rules. Update rarely.

### 01 AI Package
Compact current-state handoff only.

Contains:

- current status;
- current architecture summary;
- current decisions summary;
- references to machine evidence;
- current Git state;
- unresolved issues;
- human review state;
- exactly one next action.

It must not become a full audit log or raw test transcript.

### 02 Request
One task only.

Contains:

- objective;
- scope;
- prohibited scope;
- required Gates;
- expected output;
- stop conditions;
- commit/push authorization.

### 03 Architecture
Update only when responsibility boundaries or system structure change.

### 04 Decisions
Approved architectural or operational decisions only.

### 05 Audit Log
Append-only event record.

Record:

```text
timestamp
actor
AI/provider/model when applicable
action
target
approval
commit/hash
evidence reference
result
```

Resolved events are never deleted.

### 06 Verification Result
Machine-generated structured evidence.

AI must not manually invent or reconstruct this file.

### 07 Security / Governance
Data classification, confidentiality, provider transmission, retention, deletion, access, incident, correction, and reissue policies.

### 08 Profiles
Versioned replaceable schemas and profiles.

### 09 Human Summary
Decision-ready summary only.

---

## 5. AI Package Rules

Required sections:

```markdown
# 01 AI Package

## 0. AI Resume
## 1. Project
## 2. Current Status
## 3. Latest Changes
## 4. Architecture Summary
## 5. Decisions Summary
## 6. Verification Evidence References
## 7. Git Status
## 8. Known Issues
## 9. Human Review
## 10. Next Action
## 11. Required Source Files
## 12. AI Confidence
## 13. Human Summary
```

Constraints:

- current facts only;
- maximum one primary next action;
- no raw personal data;
- no full stdout;
- evidence referenced by path, hash, and timestamp;
- resolved issues removed from the package but retained in Audit Log;
- no stale Git values;
- no placeholders after task completion;
- package freshness must be checked against repository state.

---

## 6. Machine Evidence Standard

AI claims are not evidence.

A successful verification requires machine evidence containing, as applicable:

```text
schema_version
generated_at
repository
branch
head
origin_head
working_tree
command
exit_code
pass_count
fail_count
warning_count
source_hash
output_hash
verifier_results
artifact_paths
stdout_digest
result_hash
```

Preferred flow:

```text
verify script
→ 06_Verification_Result.json
→ schema validation
→ AI judgment
→ 01_AI_Package.md reference
```

A `PASS` without evidence is treated as unverified.

---

## 7. Gate Enforcement

### Gate 1 — Baseline

Machine-check:

- repository identity;
- branch;
- origin synchronization;
- working tree;
- package freshness;
- source/form/law/profile versions;
- unexpected files;
- input hashes.

### Gate 2 — Implementation

Rules:

- minimum safe change;
- approved scope only;
- no unrelated refactoring;
- no silent fallback;
- no partial write;
- no test weakening;
- no hidden architecture change.

### Gate 3 — Automated Verification

Run all applicable:

- unit/integration tests;
- formal verify;
- build;
- changed-file lint;
- full lint when required;
- output verifier;
- structural/serialization verifier;
- negative-path tests;
- compatibility tests;
- schema validation;
- source/output hash checks.

### Gate 4 — Deliverable and Human Review

Verify official application path and separate:

```text
AI verified
Machine verified
Human reviewed
Human approved
```

These statuses must never be conflated.

### Gate 5 — Documentation and Git

Require:

- AI Package update;
- evidence file update;
- audit event append;
- schema validation;
- Git diff audit;
- explicit-path staging;
- cached diff audit;
- authorized commit/push only.

### Automated enforcement

Introduce incrementally:

- local verification script;
- AI Package schema validator;
- pre-commit hook;
- CI / GitHub Actions;
- branch protection;
- required status checks.

A failed required Gate must block progression.

---

## 8. State-Based Baseline

Do not hardcode a commit hash as the default baseline.

Use:

- repository identity;
- branch;
- origin state;
- working tree state;
- expected files;
- evidence freshness;
- tests/verify/build/lint;
- source/form/law/profile versions and hashes.

Fixed hashes remain valid for audit baselines, releases, rollback, and historical comparison.

---

## 9. Concurrency and Conflict Control

Single dynamic-file aggregation creates collision risk.

Rules:

- one active writer per task/package;
- task ID and actor recorded;
- no parallel update of `01_AI_Package.md` without coordination;
- use branches or worktrees for concurrent implementation;
- merge conflicts in AI documents require explicit resolution;
- never auto-resolve audit or decision conflicts;
- CI should reject stale package updates where practical.

Production collaboration must add locking or optimistic concurrency control.

---

## 10. AI Capability Profiles

Do not assume AI models are interchangeable.

Each provider/model profile should define:

```text
provider
model
approved_tasks
prohibited_tasks
tool_capabilities
context_limit
data_policy
retention_policy
jurisdiction
required_gate_strength
human_review_level
fallback_policy
evaluation_version
```

Fallback must not be silent.

A model change requires regression evaluation against fixed acceptance tests.

---

## 11. Governance and Confidentiality

Markdown-first development does not replace data governance.

Before real client data or production use, define:

- data classification;
- professional confidentiality;
- permitted AI providers;
- permitted transmitted fields;
- anonymization/pseudonymization;
- domestic/foreign data transfer;
- processor/subprocessor control;
- retention and deletion;
- access control;
- audit access;
- incident handling;
- disclosure/correction/suspension requests;
- backup and recovery.

AI receives minimum necessary data and minimum necessary privileges.

Real client information must not be placed in development Markdown, logs, prompts, or evidence files unless explicitly approved and protected.

---

## 12. Access and Approval Model

At minimum separate:

```text
view
edit
execute
review
approve
release
administer
```

AI may execute within granted scope but cannot self-grant approval.

Professional deliverables require identifiable human final approval.

Commit/push authority and production release authority must be explicitly defined.

---

## 13. Versioning and Change Management

Version independently:

- Master;
- AI Package schema;
- Law Profile;
- Form Profile;
- Mapping;
- Verification rules;
- AI Capability Profile;
- Document output;
- Application release.

Each profile must support:

```text
schema_version
version
effective_from
effective_to
transition_rule
supersedes
source_reference
hash
```

Old versions must remain reproducible for historical cases.

---

## 14. Correction and Reissue

A delivered document is never silently overwritten.

Correction/reissue must record:

- original document version;
- corrected version;
- reason;
- changed fields;
- applicable law/form/profile versions;
- approval;
- invalidated/superseded status;
- output hash;
- delivery timestamp.

---

## 15. Human Communication

Default report:

```text
■ 結論
■ 実施
■ 結果
■ リスク・要確認
■ 判断事項
■ 次工程
```

Details remain in numbered project assets.

Provide longer explanation only when the human requests it.

---

## 16. Stop Conditions

Stop before destructive action, commit, push, release, or delivery when:

- repository or task identity is unclear;
- package is stale;
- unrelated changes are mixed in;
- source/profile integrity is uncertain;
- required evidence is missing;
- tests/verify/build/schema validation fail;
- current-change lint errors/warnings remain;
- privacy or confidentiality scope is unclear;
- access or approval is absent;
- partial output cannot be prevented;
- AI Package conflicts with machine evidence;
- human confirmation is required but absent.

---

## 17. Master Size Control

Master must remain stable and readable.

Rules:

- temporary project facts never enter Master;
- repeated detailed procedures move to templates or schemas;
- role-specific operational details may be split when the Master becomes unwieldy;
- every Master revision requires a change summary;
- major structural changes increment the major version.

---

# Practice Assistant V2 Product Standard

## 18. Product Definition

Practice Assistant V2 is developed as:

```text
AI協働型士業業務OS
```

It must tolerate changes in:

- laws;
- administrative forms;
- professional workflows;
- AI providers and models;
- storage and infrastructure;
- governance requirements.

AI supports.  
Qualified professionals make final judgments.

---

## 19. Product Responsibility Flow

```text
Case
→ Information Intake
→ AI Extraction
→ Human Verification
→ Law / Regulation Selection
→ Professional Design
→ Form / Mapping Selection
→ Word Document Engine
→ Output / Structural Verification
→ manualCheck / humanReview
→ Human Approval
→ Delivery
→ Correction / Reissue
→ Audit Retention
```

---

## 20. Product Layers

```text
Layer 1: Case and workflow management
Layer 2: AI extraction and human verification
Layer 3: Law, regulation, and professional design
Layer 4: Document generation and verification — FORMALLY COMPLETED
Layer 5: AI collaboration and evidence automation
Layer 6: OCR / RAG / external integrations
Layer 7: Production security, governance, persistence, and auditability
```

Layer 4 is formally complete.

Layer 7 is an acknowledged, not-yet-completed production prerequisite.

---

## 21. Immediate Program Direction

1. Adopt Master v4.0.
2. Preserve Level 4 as formally completed.
3. Establish numbered AI assets.
4. Implement verification-result generation and package schema validation.
5. Establish append-only audit records.
6. Define versioned Law, Form, Mapping, Document, and AI Capability profiles.
7. Design governance, access, retention, correction, and reissue before production.
8. Add OCR/RAG only after governance boundaries are approved.
