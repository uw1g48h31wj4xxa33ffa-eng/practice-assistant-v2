# Milestone 5-B Phase 1
# Human Approval, Merge, and Final Verification Instruction

**Status:** Approved for merge  
**Pull Request:** #1  
**Branch:** `feature/milestone-5b-profiles`  
**Human Decision:** Approved  
**Approval Scope:** Milestone 5-B Phase 1 only  

---

## 1. Approval

The human reviewer has reviewed the summarized implementation and Copilot re-review evidence and explicitly approves Pull Request #1 for merge.

This approval applies only to the current Milestone 5-B Phase 1 scope.

Do not extend the implementation scope.

---

## 2. Required pre-merge checks

Before merge, confirm:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git rev-parse origin/feature/milestone-5b-profiles
```

Required conditions:

- current branch is `feature/milestone-5b-profiles`;
- local HEAD equals the remote feature branch;
- working tree is clean;
- Pull Request #1 remains mergeable;
- all required checks are passing;
- no new commits or review findings appeared after the approved evidence.

If any condition is not met, stop and report the discrepancy in Markdown. Do not merge.

---

## 3. Human approval audit record

Append a human approval entry to:

```text
docs/AI/05_Audit_Log.jsonl
```

The entry must record, at minimum:

- milestone: `Milestone 5-B Phase 1`;
- pull request: `#1`;
- decision: `approved`;
- actor type: `human`;
- approval scope;
- approval timestamp;
- implementation report reference:
  `docs/AI/09_Milestone5B_Implementation_Report.md`;
- Copilot re-review reference:
  `docs/AI/10_Milestone5B_Copilot_Rereview.md`;
- statement that Copilot approval was advisory only;
- statement that explicit human approval authorized merge.

Preserve valid JSONL format.

Do not rewrite prior audit entries.

---

## 4. Commit the approval record

After updating the audit log:

```bash
git status --short
git diff -- docs/AI/05_Audit_Log.jsonl
```

Stage only the audit log:

```bash
git add docs/AI/05_Audit_Log.jsonl
```

Audit the staged change:

```bash
git diff --cached --stat
git diff --cached --name-only
git diff --cached
```

Commit:

```bash
git commit -m "docs(ai): record Milestone 5-B human approval"
```

Push:

```bash
git push origin feature/milestone-5b-profiles
```

Confirm the Pull Request includes the approval commit and all required checks pass again.

---

## 5. Merge Pull Request #1

Merge Pull Request #1 only after the approval commit is present and checks are green.

Use the repository's approved merge method.

Do not force merge.

Do not bypass branch protection.

Do not delete evidence files.

Record:

- merge method;
- merge commit SHA;
- approval commit SHA;
- merged timestamp.

---

## 6. Post-merge synchronization

After merge:

```bash
git checkout main
git pull --ff-only origin main
git fetch origin
```

Confirm:

```bash
git status --short
git rev-parse HEAD
git rev-parse origin/main
```

Required result:

- `HEAD == origin/main`;
- working tree is clean.

---

## 7. Final verification on main

Run final verification from the merged `main` state:

```bash
npx tsx --test src/profiles/tests/profile-registry.test.ts
npm run lint
npm run build
npm run ai:verify
```

Also run all repository-required Word Engine and Document Engine regression verification.

Do not rely only on pre-merge results.

The final verification evidence must correspond to the merged `main` commit.

---

## 8. Final evidence update

Update the governed verification evidence as required by the Master instruction.

Record:

- merge commit SHA;
- `main` SHA;
- `origin/main` SHA;
- Profile Registry test result;
- lint result;
- build result;
- `ai:verify` result;
- Word Engine regression result;
- Document Engine regression result;
- final working-tree status.

If updating a tracked evidence file changes the repository after merge, commit and push that evidence update separately using explicit-path staging.

Do not claim a clean repository before all required evidence commits are pushed.

---

## 9. Final report

Update or create the final governed Markdown report with:

- implementation commit;
- correction commit;
- human approval commit;
- merge commit;
- final evidence commit, if applicable;
- all verification results;
- `HEAD == origin/main`;
- clean working tree;
- unresolved items;
- deferred items;
- Milestone 5-B Phase 1 completion status.

Detailed results must be written to Markdown.

The user-facing response must contain only:

- merge result;
- final verification result;
- final commit state;
- unresolved blocking issues, if any.

Do not paste long command logs into chat.

---

## 10. Stop conditions

Stop immediately without merging if:

- working tree is not clean;
- local and remote feature branches differ unexpectedly;
- required checks are not green;
- PR is no longer mergeable;
- new blocking review findings exist;
- audit log cannot be written safely;
- final verification fails;
- `HEAD != origin/main` after synchronization.

Record the failure and evidence in Markdown.

Do not hide or reinterpret failures.

---

## 11. Mandatory instruction

身勝手な推測や独断は絶対にしないでください。  
指示書を忠実に守ってください。
