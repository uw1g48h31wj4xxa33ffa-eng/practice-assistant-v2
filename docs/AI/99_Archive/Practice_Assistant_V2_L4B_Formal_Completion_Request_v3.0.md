# Practice Assistant V2 — Word Document Engine Level 4-B Formal Completion Request v3.0

## 0. Required Reading Order

Read the following in this order before starting:

1. `AI_Development_Master_Instruction_v3.0.md`
2. `docs/AI/AI_Package.md`
3. This file

Read `Architecture.md` or `Decisions.md` only when `AI_Package.md` indicates that deeper confirmation is required.

Treat the repository and Markdown assets as the source of truth.  
Do not rely on prior chat history.

身勝手な推測や独断は絶対にしないでください。  
指示書を忠実に守ってください。

---

## 1. Objective

Formally complete Word Document Engine Level 4 for Practice Assistant V2.

This task is limited to:

- state-based baseline verification;
- final automated verification;
- final Git audit;
- `AI_Package.md` update;
- explicit-path staging;
- commit;
- push;
- final clean-state confirmation.

Do not add new features, redesign architecture, or perform unrelated refactoring.

---

## 2. Confirmed Product Position

Practice Assistant V2 is maintained as:

```text
AI協働型士業業務OS
```

Current official flow:

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

Preserve this responsibility direction.

---

## 3. Gate 1 — State-Based Baseline

Run:

```bash
cd /Users/to/practice-assistant-v2/dev/practice-assistant-v2

pwd
git branch --show-current
git status --short
git diff --stat
git diff --name-only
git rev-parse HEAD
git rev-parse origin/main
find . -type f -name "*.docx" -not -path "./node_modules/*"
shasum -a 256 /Users/to/Documents/practice-assistant-input/001687895.docx
```

Confirm:

- repository path is correct;
- branch is `main`;
- current Level 4 changes are present;
- no unrelated changes are mixed in;
- repository contains no `.docx`;
- source SHA-256 is:
  `b87253adeb29b593913c97fe972a4bb3afb8c36bac6dbb66bd70d08146963da8`;
- working state is consistent with `AI_Package.md`.

Do not stop solely because HEAD differs from an older request.  
Stop only when the actual repository state is materially inconsistent or unsafe.

---

## 4. Gate 2 — Final Verification

Run:

```bash
node --test scripts/document-verification/tests/*.test.mjs
node scripts/document-verification/verify-career-up-form1.mjs
node scripts/document-verification/verify-hatarakikata-r8-form1.mjs
npm run build
npm run lint
find . -type f -name "*.docx" -not -path "./node_modules/*"
shasum -a 256 /Users/to/Documents/practice-assistant-input/001687895.docx
```

Required:

- all tests pass;
- existing form verify passes;
- second form verify passes;
- build passes;
- current-change lint errors and warnings are zero;
- OutputVerifier passes through the official generation path;
- DomSerializationVerifier passes through the official generation path;
- source SHA remains unchanged;
- repository DOCX remains absent.

Separate pre-existing lint issues from current-change issues.

Record actual commands, exit codes, counts, and results in `docs/AI/AI_Package.md`.

---

## 5. Confirmed Human Review

Record the following as human-confirmed facts:

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

Do not convert these into AI-only verification.

---

## 6. Gate 3 — AI_Package.md Update

Update only:

```text
docs/AI/AI_Package.md
```

Update `Architecture.md` only if architecture actually changed.  
Update `Decisions.md` only if an approved decision actually changed.

The package must follow Master v3.0 and include:

```text
0. AI Resume
1. Project
2. Current Status
3. Latest Changes
4. Architecture Summary
5. Decisions Summary
6. Verification Evidence
7. Git Status
8. Known Issues
9. Human Review
10. Next Action
11. Required Source Files
12. AI Confidence
13. Human Summary
```

Requirements:

- current facts only;
- no duplicated progress log;
- resolved issues removed;
- exactly one next action;
- concise Human Summary;
- no estimated evidence;
- no stale Git values;
- no contradiction with repository facts.

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
- no real customer data;
- no debug artifacts;
- no repository DOCX;
- no weakened tests;
- no unjustified removal of `manualCheck` or `humanReview`;
- no hidden fallback;
- no discrepancy between code, verification, and `AI_Package.md`.

Stop before commit if any issue remains.

---

## 8. Gate 5 — Stage, Commit, Push

Proceed only if Gates 1–4 pass.

### Stage

Forbidden:

```text
git add .
git add -A
```

Stage only the reviewed Level 4 implementation files and approved Markdown files by explicit path.

### Cached Diff Audit

Run:

```bash
git diff --cached --stat
git diff --cached --name-only
git diff --cached
```

Stop if any unrelated file is staged.

### Commit

Use:

```text
feat: integrate Word Document Engine with case delivery flow
```

### Push

Run:

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

- repository identity is unclear;
- unrelated changes are mixed in;
- source SHA differs;
- tests fail;
- either verify script fails;
- build fails;
- current-change lint errors or warnings remain;
- OutputVerifier fails;
- DomSerializationVerifier fails;
- repository DOCX exists;
- human review facts conflict with the output;
- `AI_Package.md` conflicts with repository facts;
- unrelated files are staged;
- push fails.

If stopped, update `AI_Package.md` with:

```text
Facts
Evidence
Impact
Work completed
Work not completed
Recommended minimum response
Git state
Next action
```

---

## 10. Human-Facing Report

Do not paste a long technical report into chat.

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

The file normally shared with ChatGPT is only:

```text
docs/AI/AI_Package.md
```

---

## 11. Completion Checklist

```text
[ ] Master v3.0 read
[ ] AI_Package.md read
[ ] Request read
[ ] State-based baseline verified
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
[ ] AI_Package.md updated
[ ] AI_Package.md matches repository facts
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
