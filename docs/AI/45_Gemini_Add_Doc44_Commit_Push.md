# Gemini指示書：44番指示書のみ追加Commit・Push

## 目的
未追跡の `docs/AI/44_Gemini_Milestone5B_Phase2C_Baseline_Lint_Commit_Push_Instruction.md` のみを追加し、commit・pushしてください。

## 最重要ルール

身勝手な推測や独断は絶対にしないでください。指示書を忠実に守ってください。

- 44番以外のファイルは変更・stage・commitしないこと
- ブランチが異なる場合は停止すること
- 問題があればcommit・pushせず停止すること

## 手順

### 1. 状態確認

```bash
git branch --show-current
git status -sb
git diff --check
```

確認事項

- ブランチ:
  `feature/milestone-5b-phase2c-career-up-integration`
- 未追跡ファイルが
  `docs/AI/44_Gemini_Milestone5B_Phase2C_Baseline_Lint_Commit_Push_Instruction.md`
  のみであること

### 2. stage

```bash
git add docs/AI/44_Gemini_Milestone5B_Phase2C_Baseline_Lint_Commit_Push_Instruction.md
```

### 3. staged確認

```bash
git diff --cached --check
git diff --cached --name-only
git status -sb
```

44番のみがstageされていることを確認してください。

### 4. Commit

```bash
git commit -m "docs: add Phase 2-C baseline lint commit instruction"
```

### 5. Push

```bash
git push
```

### 6. 最終確認

```bash
git status -sb
git log -1 --oneline
```

## 完了報告

- commit hash
- commit message
- push結果
- 最終 `git status -sb`
