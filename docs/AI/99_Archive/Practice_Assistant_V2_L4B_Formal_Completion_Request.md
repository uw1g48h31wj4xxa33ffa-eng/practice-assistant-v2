# Gemini Execution Request — Practice Assistant V2 Level 4-B Formal Completion

## 0. Required Reading Order

Before any action, read the following files in this exact order:

1. `AI_Development_Master_Instruction_v2.1.md`
2. `docs/AI/AI_Package.md`
3. This file: `Practice_Assistant_V2_L4B_Formal_Completion_Request.md`
4. Only the additional source Markdown listed in `AI_Package.md` when deeper verification is necessary

Treat the repository and Markdown assets as the source of truth.  
Do not rely on prior chat history.

身勝手な推測や独断は絶対にしないでください。  
指示書を忠実に守ってください。

---

## 1. Objective

Formally complete Practice Assistant V2 / Word Document Engine Level 4-B.

This task is limited to:

- validating the current Level 4 implementation;
- updating authoritative Markdown assets;
- regenerating `docs/AI/AI_Package.md` under the v2.0 schema;
- performing final Git audit;
- staging only approved files;
- committing and pushing only if every required Gate passes.

Do not add new product features.

---

## 2. Product Position

Practice Assistant V2 must be maintained as:

```text
AI協働型士業業務OS
```

Current responsibility flow:

```text
案件
→ 確認済みデータ抽出
→ Document Input Adapter
→ Word Generation Application Service
→ Word Document Engine
→ OutputVerifier
→ DomSerializationVerifier
→ Generation Result DTO
→ Word取得
→ manualCheck / humanReview
→ 人間最終確認
```

Preserve this dependency direction.

---

## 3. Gate 1 — Baseline Verification

Run:

```bash
cd /Users/to/practice-assistant-v2/dev/practice-assistant-v2

pwd
git branch --show-current
git rev-parse HEAD
git rev-parse origin/main
git status --short
git diff --stat
git diff --name-only
find . -type f -name "*.docx" -not -path "./node_modules/*"
shasum -a 256 /Users/to/Documents/practice-assistant-input/001687895.docx
```

Expected baseline:

```text
branch: main
HEAD: 3c3acfb5f5a62de09b4631abce28640d56f8b787
origin/main: 3c3acfb5f5a62de09b4631abce28640d56f8b787
Level 4 changes: present and uncommitted
repository DOCX: none
source SHA-256:
b87253adeb29b593913c97fe972a4bb3afb8c36bac6dbb66bd70d08146963da8
```

Stop if the baseline differs materially or unrelated changes are mixed in.

---

## 4. Gate 2 — Final Verification

Run all applicable commands:

```bash
node --test scripts/document-verification/tests/*.test.mjs
node scripts/document-verification/verify-career-up-form1.mjs
node scripts/document-verification/verify-hatarakikata-r8-form1.mjs
npm run build
npm run lint
find . -type f -name "*.docx" -not -path "./node_modules/*"
shasum -a 256 /Users/to/Documents/practice-assistant-input/001687895.docx
```

For every command, record in the formal report:

```text
Command:
Exit Code:
Counts:
Result:
Evidence Date:
```

Requirements:

- all tests pass;
- both formal verify scripts pass;
- build passes;
- current-change lint errors and warnings are zero;
- OutputVerifier passes through the official generation path;
- DomSerializationVerifier passes through the official generation path;
- source SHA remains unchanged;
- no repository DOCX exists.

Pre-existing lint issues must be separated from current-change issues.

---

## 5. Human Review Facts

The following are already human-confirmed and must be recorded accurately:

```text
Microsoft Word repair warning: none
Major layout break: none
Designated workplaces:
- Row 1: 東京本社
- Row 2: 大阪支社
- stale placeholders: none

Wage increase workers:
- 山田太郎
- 佐藤花子
- visible table break: none
```

Do not reinterpret these as AI-only verification.

---

## 6. Gate 3 — Markdown Update

Update authoritative Markdown first:

```text
docs/AI/01_Project/Current_Status.md
docs/AI/01_Project/Architecture.md
docs/AI/01_Project/Decisions.md
docs/AI/01_Project/Progress_Log.md
docs/AI/01_Project/Known_Issues.md
docs/AI/03_Report/Gemini_Report.md
docs/AI/03_Report/Human_Summary.md
```

Rules:

- update only facts supported by evidence;
- do not overwrite unrelated history;
- remove resolved issues from active Known Issues;
- separate facts, decisions, proposals, and unresolved items;
- keep Human Summary concise.

Then regenerate:

```text
docs/AI/AI_Package.md
```

Use the `AI_Package.md v2.0` schema embedded in Master v2.1.

Required package sections:

```text
0. AI Resume
1. Project
2. Current Status
3. Latest Changes
4. Architecture
5. Decisions
6. Verification Evidence
7. Git Status
8. Known Issues
9. Human Review
10. Next Action
11. Required Source Files
12. AI Confidence
13. Human Summary
```

Exactly one primary next action must be recorded.

---

## 7. Gate 4 — Git Audit

Run:

```bash
git status --short
git diff --stat
git diff --name-only
git diff
```

Confirm:

- no unrelated changes;
- no temporary files;
- no repository DOCX;
- no real customer information;
- no debug artifacts;
- no weakened tests;
- no unjustified removal of `manualCheck` or `humanReview`;
- no mismatch between Markdown and repository facts.

Stop if any inconsistency exists.

---

## 8. Gate 5 — Stage, Commit, Push

Proceed only when Gates 1–4 pass.

### Stage

Forbidden:

```text
git add .
git add -A
```

Stage only the reviewed Level 4 implementation files and approved Markdown assets by explicit path.

### Cached Diff Audit

Run:

```bash
git diff --cached --stat
git diff --cached --name-only
git diff --cached
```

Stop if an unrelated file is staged.

### Commit

Use:

```text
feat: integrate Word Document Engine with case delivery flow
```

### Push

```bash
git push origin main
```

Then verify:

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

---

## 9. Stop Conditions

Do not commit or push if any of the following occurs:

- baseline mismatch;
- unrelated changes;
- test failure;
- verify failure;
- build failure;
- current-change lint error or warning;
- OutputVerifier failure;
- DomSerializationVerifier failure;
- source SHA mismatch;
- repository DOCX found;
- Markdown inconsistency;
- staged unrelated files;
- push failure.

On stop, update the relevant Markdown and `AI_Package.md` with:

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

## 10. Human-Facing Report

After execution, do not paste a long technical report into chat.

Report only:

```text
■ 結論
■ commit hash
■ push結果
■ tests / verify / build / lint
■ Word人間確認
■ Git最終状態
■ AI_Package.md更新
■ 未解決事項
```

Detailed evidence must remain in:

```text
docs/AI/03_Report/Gemini_Report.md
docs/AI/AI_Package.md
```

The file normally shared with ChatGPT is only:

```text
docs/AI/AI_Package.md
```

---

## 11. Completion Checklist

```text
[ ] Master v2.1 read
[ ] AI_Package.md read
[ ] Request read
[ ] Baseline verified
[ ] All tests passed
[ ] Existing form verify passed
[ ] Second form verify passed
[ ] Build passed
[ ] Current-change lint 0
[ ] OutputVerifier passed
[ ] DomSerializationVerifier passed
[ ] Source SHA matched
[ ] Repository DOCX absent
[ ] Human review facts recorded
[ ] Authoritative Markdown updated
[ ] AI_Package.md v2.0 regenerated
[ ] Markdown consistency checked
[ ] Git diff audited
[ ] Only approved files staged
[ ] Cached diff audited
[ ] Commit succeeded
[ ] Push succeeded
[ ] HEAD equals origin/main
[ ] Working tree clean
[ ] Human report kept concise
```

If any mandatory item remains unchecked, record the task as incomplete.
