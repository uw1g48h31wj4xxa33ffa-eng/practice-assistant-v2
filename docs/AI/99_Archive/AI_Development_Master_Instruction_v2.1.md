# AI Development Master Instruction v2.1

## 0. Scope and Authority

This document is the permanent execution standard for AI-assisted development projects.

It applies to Gemini, Claude, ChatGPT, Codex, and other implementation or audit AIs unless a role-specific instruction explicitly narrows the scope.

Every AI must read this Master first, then:

1. `docs/AI/AI_Package.md`
2. the current task-specific Request Markdown
3. only the additional source Markdown required by `AI_Package.md`

Chat history is not the source of truth.  
The repository and structured Markdown assets are the source of truth.

身勝手な推測や独断は絶対にしないでください。  
指示書を忠実に守ってください。

---

## 1. Primary Objectives

Priority order:

1. Prevent defects, data loss, unintended changes, and false success.
2. Preserve verified existing behavior and compatibility.
3. Minimize unnecessary human–AI and AI–AI back-and-forth.
4. Reduce AI recognition load through structured Markdown.
5. Complete all safely executable work in one pass.
6. Leave the project resumable by another AI without chat history.

Speed never overrides data integrity, verification, or professional review.

---

## 2. Markdown-First Development

All long-term project state must be maintained in Markdown.

Required model:

```text
Repository
→ Authoritative Markdown
→ AI execution
→ Markdown update
→ AI_Package.md regeneration
→ next AI / human decision
```

Chat is used only for:

- initiating tasks;
- requesting clarification;
- approving decisions;
- receiving concise summaries;
- asking for detailed explanation when the human explicitly requests it.

AI agents must not rely on prior chat context when the same facts should exist in project Markdown.

---

## 3. Standard Documentation Structure

```text
docs/AI/
├── 00_Master/
│   ├── AI_Development_Master_Instruction_v2.1.md
│   └── role-specific master files when required
├── 01_Project/
│   ├── Current_Status.md
│   ├── Architecture.md
│   ├── Decisions.md
│   ├── Progress_Log.md
│   └── Known_Issues.md
├── 02_Request/
│   └── current task Request Markdown
├── 03_Report/
│   ├── implementation/audit reports
│   └── Human_Summary.md
├── AI_Package.md
└── 99_Archive/
```

Do not duplicate the same responsibility across multiple documents.

---

## 4. AI_Package.md v2.0 Standard

`docs/AI/AI_Package.md` is the standard AI-to-AI and AI-to-ChatGPT handoff package.

The authoritative record remains the role-specific Markdown files.  
`AI_Package.md` is a compact, validated projection of their latest state.

### Required sections

```markdown
# AI Package

## 0. AI Resume
## 1. Project
## 2. Current Status
## 3. Latest Changes
## 4. Architecture
## 5. Decisions
## 6. Verification Evidence
## 7. Git Status
## 8. Known Issues
## 9. Human Review
## 10. Next Action
## 11. Required Source Files
## 12. AI Confidence
## 13. Human Summary
```

### AI Resume

Maximum 10 lines:

```text
Project:
Phase:
Status:
Current HEAD:
Working Tree:
Blocking Issues:
Next Action:
Primary Request:
Last Updated:
Updated By:
```

### Verification evidence

Each check must include:

```text
Command:
Exit Code:
Counts:
Result:
Evidence Date:
```

“Passed” without measurable evidence is insufficient.

### Human Summary

Maximum 15 lines:

```text
■ 実施
■ 結果
■ 要確認
■ 判断事項
■ 次工程
```

### Package rules

- Update authoritative Markdown first.
- Validate Markdown consistency.
- Regenerate `AI_Package.md`.
- Validate package values against repository facts.
- Never record estimated values as measured facts.
- Never record AI verification as human confirmation.
- Keep exactly one primary next action.
- Remove resolved issues from active `Known Issues`.
- Share only `AI_Package.md` with the human or ChatGPT by default.
- Additional source files are shared only when an audit, conflict, or major design decision requires them.

---

## 5. AI-to-AI Collaboration

The outgoing AI must:

1. update authoritative Markdown;
2. record what it executed;
3. record what it did not execute;
4. record evidence and unresolved risks;
5. regenerate `AI_Package.md`;
6. give exactly one next action;
7. provide the human only a concise summary.

The incoming AI must:

1. read the latest Master;
2. read `AI_Package.md`;
3. verify repository facts before acting;
4. open additional Markdown only as required;
5. distrust unsupported success claims;
6. continue without requiring previous chat history.

---

## 6. Gate Execution Model

### Gate 1 — Structure and Baseline

Verify:

- repository path;
- branch;
- HEAD and origin;
- working tree;
- architecture;
- assumptions;
- input/source hashes where applicable;
- scope and prohibited scope.

Do not implement until the baseline is verified.

### Gate 2 — Implementation

Rules:

- smallest safe change;
- approved scope only;
- no unrelated refactoring;
- no hidden architecture changes;
- no business/form-specific logic in shared Core;
- no silent fallback;
- no partial write;
- no test weakening.

### Gate 3 — Automated Verification

Run all applicable:

- unit/integration tests;
- formal verify scripts;
- build;
- changed-file lint;
- broader lint where required;
- OutputVerifier;
- serialization/structural verifier;
- hash checks;
- negative-path tests;
- compatibility tests.

### Gate 4 — Deliverable and Human Review

Verify through the official application path.

Prepare or perform:

- generated output;
- UI flow;
- result DTO;
- download/output path;
- error and partial-failure behavior;
- manualCheck/humanReview display;
- real application review where required.

### Gate 5 — Documentation and Git Audit

Before commit:

- update authoritative Markdown;
- regenerate `AI_Package.md`;
- audit Markdown consistency;
- run `git status`, `git diff --stat`, `git diff --name-only`, `git diff`;
- verify repository artifacts;
- stage only named files;
- audit cached diff.

Commit/push only when explicitly authorized and all gates pass.

---

## 7. Evidence and Completion Rules

For every required command, record:

- exact command;
- exit code;
- pass/fail/warning counts;
- result;
- date/time where material.

The executing AI must not declare completion based on partial execution.

If one mandatory item is unexecuted:

```text
Status: Incomplete
```

The final quality judgment belongs to ChatGPT, the assigned auditor, or the human.

---

## 8. Fixed Quality Rules

Prohibited:

- changing test expectations to match incorrect implementation;
- deleting, skipping, or weakening tests without approval;
- removing `manualCheck` or `humanReview` before release criteria are met;
- treating implementation existence as verification;
- treating one successful path as total success;
- hiding lint/test/verify failures;
- exposing incomplete output;
- committing repository DOCX artifacts unless explicitly approved;
- `git add .`;
- `git add -A`;
- unauthorized commit or push.

Required:

- negative-path verification;
- verifier execution through the official application path;
- input validation before mutation;
- atomic or rollback-safe generation where applicable;
- target-only mutation;
- unchanged source/original hash where required;
- changed-file lint error/warning zero;
- exact separation of current-task issues and pre-existing issues.

---

## 9. Stop Conditions

Stop before destructive changes, commit, or push if:

- repository baseline differs materially;
- source hash differs;
- architecture differs materially from documentation;
- responsibility boundaries require redesign;
- data integrity cannot be guaranteed;
- target cannot be uniquely identified;
- partial generation cannot be prevented;
- verifier cannot run;
- mandatory test/verify/build fails;
- current-change lint errors/warnings remain;
- unrelated changes are present;
- documentation and repository facts conflict;
- human confirmation is required but absent.

On stop, report only:

```text
Facts
Evidence
Impact
Work completed
Work not completed
Recommended minimum response
Git state
```

---

## 10. Human Communication

Default human communication is concise.

Report only:

```text
■ 結論
■ 実施
■ 結果
■ リスク・要確認
■ 判断事項
■ 次工程
```

Detailed explanations are provided only when the human asks.

---

# Practice Assistant V2 — Product Master Direction

## 11. Product Definition

Practice Assistant V2 is developed as:

```text
AI協働型士業業務OS
```

It is not merely a case management tool or document generator.

It connects:

```text
案件管理
→ ヒアリング・情報整理
→ AI抽出
→ 人間確認
→ 規程・申請設計
→ Word Document Engine
→ OutputVerifier / structural verifier
→ manualCheck / humanReview
→ 納品
→ future OCR / RAG / external integrations
```

---

## 12. Product Principles

- AI assists; licensed professionals make final judgments.
- Only verified or explicitly human-modified information proceeds to formal outputs.
- Unverified, rejected, ambiguous, or AI-only assumptions do not proceed.
- Every AI action and material decision must be traceable.
- Human review remains explicit in UI and documentation.
- Word/document generation remains configuration-driven.
- Form-specific Engine or Generator duplication is prohibited.
- Application, Adapter, Application Service, Engine, Verifier, and UI responsibilities remain separated.
- Legal and professional outputs are never represented as autonomous final decisions.
- Markdown assets preserve continuity when AI tools change.

---

## 13. Practice Assistant V2 Layer Model

```text
Layer 1: Case and workflow management
Layer 2: AI extraction and human verification
Layer 3: Regulation/document design
Layer 4: Word generation and verification
Layer 5: AI collaboration through Markdown assets
Layer 6: OCR / RAG / external integrations
Layer 7: Production persistence, security, governance, and auditability
```

Each layer must stabilize before broad expansion into the next layer.

---

## 14. Immediate Program Direction

1. Formally close Word Document Engine Level 4.
2. Stabilize Markdown-first AI collaboration and `AI_Package.md v2.0`.
3. Define the next product milestone based on actual professional workflow value.
4. Prioritize practical case, verification, review, document, and delivery workflows.
5. Introduce OCR/RAG only after evidence, data governance, access control, and responsibility boundaries are defined.
6. Preserve current Next.js/TypeScript architecture unless a later approved phase explicitly changes it.
7. Keep human final review mandatory for professional deliverables.

---

## 15. Master Maintenance

This Master is a living, versioned standard.

Update it when:

- the same AI failure recurs;
- a new quality gate is required;
- a more efficient workflow is proven;
- AI characteristics materially change;
- cross-project reuse requires a backward-compatible rule.

Do not add project-specific temporary facts to the Master.

Version rules:

- Patch: wording or clarification
- Minor: backward-compatible operational rule
- Major: structural or compatibility-breaking change

Every future AI instruction must reference the latest approved Master version.
