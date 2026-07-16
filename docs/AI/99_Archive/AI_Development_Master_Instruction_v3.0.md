# AI Development Master Instruction v3.0
## Markdown-First Optimized Standard

### Status
Permanent cross-project AI operating standard

### Applies To
ChatGPT, Gemini, Claude, Codex, and other implementation, audit, research, or documentation AIs

---

## 0. Core Operating Model

Every AI task must use this order:

```text
1. Master.md
2. AI_Package.md
3. Request.md
4. Additional static documents only when required
5. Execution
6. Verification
7. AI_Package.md update
8. Concise human report
```

The repository and Markdown assets are the source of truth.

Chat history is not the source of truth.

身勝手な推測や独断は絶対にしないでください。  
指示書を忠実に守ってください。

---

## 1. Primary Objectives

Priority order:

1. Prevent defects, data loss, unintended changes, and false success.
2. Preserve verified behavior and compatibility.
3. Minimize unnecessary AI I/O, tool calls, token use, and human back-and-forth.
4. Keep project state resumable without chat history.
5. Complete all safely executable work in one pass.
6. Leave concise, evidence-based handoff material for the next AI.
7. Optimize for changing AI models, changing laws, changing forms, and changing project conditions.

Speed never overrides integrity, verification, or human professional review.

---

## 2. Minimal Document Model

The standard document model is intentionally small.

```text
docs/AI/
├── Master.md
├── AI_Package.md
├── Request.md
├── Architecture.md
├── Decisions.md
└── Archive/
```

### Dynamic document

Only this file is updated on every material task:

```text
AI_Package.md
```

It contains:

- current status;
- latest changes;
- verification evidence;
- Git state;
- unresolved issues;
- human review state;
- next action;
- concise human summary.

### Static documents

These are updated only when their subject changes:

```text
Architecture.md
Decisions.md
```

Do not duplicate daily status, test results, or progress logs across multiple Markdown files.

---

## 3. AI_Package.md as the Dynamic Source

`AI_Package.md` is the single dynamic handoff file.

It must contain:

```markdown
# AI Package

## 0. AI Resume
## 1. Project
## 2. Current Status
## 3. Latest Changes
## 4. Architecture Summary
## 5. Decisions Summary
## 6. Verification Evidence
## 7. Git Status
## 8. Known Issues
## 9. Human Review
## 10. Next Action
## 11. Required Source Files
## 12. AI Confidence
## 13. Human Summary
```

### Rules

- Keep the file compact.
- Prefer current facts over historical narrative.
- Remove resolved issues.
- Record exactly one primary next action.
- Do not copy full diffs.
- Do not repeat the same evidence in multiple sections.
- Do not record assumptions as facts.
- Do not record AI verification as human confirmation.
- Do not record estimated values as measured results.
- The next AI must be able to resume work by reading this file first.

---

## 4. State-Based Baseline Verification

Do not hardcode a commit hash as the default baseline requirement.

Use state-based validation:

```text
- correct repository
- correct branch
- origin synchronization state
- working tree state
- expected files present
- unexpected files absent
- test/verify/build/lint state
- input/source version or hash where required
```

Use a fixed commit hash only when:

- auditing a known baseline;
- confirming a release point;
- performing a rollback;
- comparing a documented historical state.

Do not stop solely because HEAD differs from a previously written request when repository state and evidence are otherwise valid.

---

## 5. Verification Automation

AI should not manually reconstruct large verification reports when automation can produce them.

Preferred flow:

```text
verification script
→ structured result
→ AI_Package.md
```

Preferred outputs:

```text
verification-result.json
verification-result.md
```

The verification automation should capture:

- commands;
- exit codes;
- pass/fail/warning counts;
- verifier results;
- hashes;
- branch and Git status;
- timestamps.

The AI remains responsible for judging whether the result satisfies the Request.

Automation does not replace reasoning.

---

## 6. Gate Model

### Gate 1 — Baseline

Verify:

- repository;
- branch;
- origin state;
- working tree;
- scope;
- input versions/hashes;
- architecture assumptions.

### Gate 2 — Implementation

Rules:

- smallest safe change;
- approved scope only;
- no unrelated refactoring;
- no silent fallback;
- no partial write;
- no test weakening;
- no hidden architecture change.

### Gate 3 — Automated Verification

Run all applicable:

- tests;
- formal verify scripts;
- build;
- changed-file lint;
- broader lint where required;
- OutputVerifier;
- structural/serialization verifier;
- negative-path tests;
- compatibility tests;
- hash/version checks.

### Gate 4 — Deliverable Review

Verify through the official path:

```text
UI
→ Application boundary
→ Adapter
→ Application Service
→ Core/Engine
→ Verifier
→ Result DTO
→ Download/Output
```

Confirm:

- success path;
- failure path;
- download/output restrictions;
- manualCheck/humanReview;
- real application review where required.

### Gate 5 — Documentation and Git

Before commit:

- update `AI_Package.md`;
- update `Architecture.md` only if architecture changed;
- update `Decisions.md` only if a decision changed;
- audit Markdown against repository facts;
- run Git diff audit;
- stage only explicit files;
- audit cached diff.

Commit/push only when explicitly authorized.

---

## 7. Evidence Rules

When no automated evidence report exists, record:

```text
Command:
Exit Code:
Counts:
Result:
Evidence Date:
```

When automated evidence exists, reference it directly.

Do not manually paraphrase a successful result if the structured result can be reused.

Do not declare completion when any mandatory Gate is unexecuted.

If one mandatory item is unexecuted:

```text
Status: Incomplete
```

Final approval belongs to ChatGPT, the designated auditor, or the human.

---

## 8. Fixed Quality Rules

Prohibited:

- weakening tests;
- changing test expectations to fit an incorrect implementation;
- removing `manualCheck` or `humanReview` before release criteria;
- treating implementation existence as verification;
- treating one successful path as total success;
- hiding errors or warnings;
- exposing incomplete output;
- unauthorized commit or push;
- `git add .`;
- `git add -A`;
- form-specific logic in shared Core without approval;
- repository DOCX artifacts unless explicitly approved.

Required:

- negative-path verification;
- official-path verifier execution;
- input validation before mutation;
- atomic or rollback-safe behavior where applicable;
- target-only mutation;
- source/original integrity checks where applicable;
- changed-file lint error/warning zero;
- separation of current-change issues from pre-existing issues.

---

## 9. Stop Conditions

Stop before destructive actions, commit, or push if:

- repository identity is unclear;
- unrelated changes are mixed in;
- source/input integrity is uncertain;
- architecture differs materially;
- target cannot be uniquely identified;
- data integrity cannot be guaranteed;
- partial generation cannot be prevented;
- mandatory verifier cannot run;
- tests/verify/build fail;
- current-change lint errors/warnings remain;
- Markdown and repository facts conflict;
- human confirmation is required but absent.

On stop, record:

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

Default human report:

```text
■ 結論
■ 実施
■ 結果
■ リスク・要確認
■ 判断事項
■ 次工程
```

Keep it brief.

Provide detailed explanation only when the human asks.

The default shared file is:

```text
AI_Package.md
```

Additional files are shared only for:

- audit;
- conflict;
- architecture change;
- major decision;
- unresolved critical issue.

---

## 11. AI-to-AI Handoff

Outgoing AI must:

1. execute only the approved scope;
2. update `AI_Package.md`;
3. update static documents only when required;
4. state what was executed;
5. state what was not executed;
6. record unresolved risks;
7. define exactly one next action;
8. avoid reliance on chat history.

Incoming AI must:

1. read Master;
2. read `AI_Package.md`;
3. read Request;
4. verify repository facts;
5. open additional static documents only as needed;
6. distrust unsupported success claims;
7. continue without prior chat history.

---

# Practice Assistant V2 Product Direction

## 12. Product Definition

Practice Assistant V2 is:

```text
AI協働型士業業務OS
```

It is designed to remain usable when:

- laws change;
- administrative forms change;
- professional workflows change;
- AI providers change;
- AI model capabilities change;
- storage and infrastructure change.

---

## 13. Product Flow

```text
案件
→ ヒアリング
→ 情報抽出
→ 人間確認
→ 規程・申請設計
→ Word Document Engine
→ OutputVerifier
→ structural verifier
→ manualCheck / humanReview
→ 納品
→ future OCR / RAG / external integrations
```

AI supports.  
Licensed professionals make final judgments.

---

## 14. Change-Resistant Architecture

Use replaceable profiles and registries:

```text
Case Data
+
Verification State
+
Law / Regulation Profile
+
Form Template
+
Mapping
+
Verification Rules
+
AI Capability / Provider Profile
```

### Law changes

Prefer updating:

- law profile;
- effective date;
- transition rules;
- evidence source;
- required interview items;
- validation rules.

### Form changes

Prefer updating:

- template;
- mapping;
- verifier configuration;
- form version metadata.

Do not create a new Engine or Generator for every form.

### AI changes

Prefer updating:

- provider profile;
- capability profile;
- prompt/input adapter;
- output adapter;
- fallback policy.

Do not bind the product workflow to one AI provider.

---

## 15. Responsibility Boundaries

Keep these responsibilities separate:

```text
UI
Application Boundary
Document Input Adapter
Application Service
Word Document Engine
OutputVerifier
Structural Verifier
Result DTO
Download/Output
```

Prohibited:

- browser-side direct Word XML mutation;
- form-specific UI duplication;
- form-specific Engine duplication;
- form-specific Generator duplication;
- hidden fallback;
- AI-only final professional judgment.

---

## 16. Product Layers

```text
Layer 1: Case and workflow management
Layer 2: AI extraction and human verification
Layer 3: Regulation and document design
Layer 4: Word generation and verification
Layer 5: AI collaboration through Markdown assets
Layer 6: OCR / RAG / external integrations
Layer 7: Production persistence, security, governance, and auditability
```

Stabilize each layer before broad expansion.

---

## 17. Immediate Program Direction

1. Formally close Word Document Engine Level 4.
2. Adopt this Master v3.0.
3. Stabilize `AI_Package.md` as the single dynamic handoff file.
4. Introduce verification automation incrementally.
5. Define the next Practice Assistant V2 milestone from real professional workflow value.
6. Add OCR/RAG only after data governance and responsibility boundaries are approved.
7. Keep human final review mandatory.

---

## 18. Master Maintenance

This Master is a living standard.

Update it only when:

- a recurring AI failure is observed;
- a proven efficiency improvement exists;
- a new quality Gate is required;
- AI characteristics materially change;
- cross-project compatibility requires an update.

Do not add temporary project facts.

Version rules:

- Patch: wording or clarification
- Minor: backward-compatible operational change
- Major: structural or compatibility-breaking change

Every future AI instruction must reference the latest approved Master version.
