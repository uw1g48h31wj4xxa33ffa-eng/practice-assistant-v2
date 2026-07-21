# Gemini指示書：Milestone 5-B Phase 2-C 既存Lintベースライン扱いでCommit・Push

## 目的

Phase 2-Cの変更対象ファイルに対する個別Lint、テスト、legacy検証、新規Profile-driven検証、build、ai:verify、diff checkがすべて成功していることを確認したうえで、既存コード由来の全体Lintエラーを既知のベースラインとして明記し、対象ファイルのみをcommit・pushしてください。

## 最重要ルール

身勝手な推測や独断は絶対にしないでください。指示書を忠実に守ってください。

- 今回の変更範囲外にある既存Lintエラー79件は修正しないでください。
- 今回の変更対象ファイルに新しいLintエラーがないことを必須条件とします。
- 機能仕様、テスト内容、設計、処理ロジックは変更しないでください。
- エラーを握りつぶさないでください。
- `npm run lint || true` のような無効化は行わないでください。
- `npm run lint` は既存ベースライン確認として実行し、既存79件だけであることを記録してください。
- 対象外ファイルをstage・commitしないでください。
- `git add -A`、`git add .` は使用しないでください。
- 対象ファイルの個別Lint、テスト、build、ai:verify、diff checkのいずれかが失敗した場合は、commit・pushせず停止してください。

## 対象ブランチ

```text
feature/milestone-5b-phase2c-career-up-integration
```

異なるブランチの場合は、何も変更せず停止してください。

## Commit対象ファイル

次の8ファイルだけをcommit対象としてください。

```text
docs/AI/06_Verification_Result.json
docs/AI/39_Gemini_Milestone5B_Phase2C_PreImplementation_Investigation.md
docs/AI/40_Milestone5B_Phase2C_Design_Decision.md
docs/AI/41_Gemini_Milestone5B_Phase2C_Implementation_Instruction.md
docs/AI/42_Gemini_Milestone5B_Phase2C_Commit_Push_Instruction.md
docs/AI/43_Gemini_Milestone5B_Phase2C_Whitespace_Fix_Commit_Push_Instruction.md
scripts/document-verification/verify-career-up-profile-driven.mjs
src/profiles/tests/profile-driven-career-up-integration.test.ts
```

## 手順

### 1. 状態確認

```bash
git branch --show-current
git status -sb
git diff --check
git diff --name-only
```

確認事項：

- 指定ブランチである
- 変更ファイルが上記8ファイルだけである
- `git diff --check` が成功する

対象外ファイルがある場合は停止してください。

### 2. 必須検証

以下を順番に実行してください。

```bash
npx tsx --test src/profiles/tests/*.test.ts
node scripts/document-verification/verify-career-up-form1.mjs
npx tsx scripts/document-verification/verify-career-up-profile-driven.mjs
npx eslint src/profiles/tests/profile-driven-career-up-integration.test.ts scripts/document-verification/verify-career-up-profile-driven.mjs
npm run build
npm run ai:verify
git diff --check
```

1つでも失敗した場合は停止してください。

### 3. 全体Lintのベースライン確認

次を通常実行してください。

```bash
npm run lint
```

このコマンドは既存コード由来のベースライン確認です。

許容条件は以下のすべてを満たす場合だけです。

- 前回と同じ合計79件
- Error 56件
- Warning 23件
- 今回の変更対象である次の2ファイルにエラーがない
  - `scripts/document-verification/verify-career-up-profile-driven.mjs`
  - `src/profiles/tests/profile-driven-career-up-integration.test.ts`
- 新しいLintエラーが増えていない

件数が異なる、対象ファイルにエラーがある、または新規エラーが疑われる場合は停止してください。

`npm run lint` の失敗を成功扱いへ改変せず、既存ベースラインとして完了報告へ明記してください。

### 4. 対象ファイル限定stage

```bash
git add   docs/AI/06_Verification_Result.json   docs/AI/39_Gemini_Milestone5B_Phase2C_PreImplementation_Investigation.md   docs/AI/40_Milestone5B_Phase2C_Design_Decision.md   docs/AI/41_Gemini_Milestone5B_Phase2C_Implementation_Instruction.md   docs/AI/42_Gemini_Milestone5B_Phase2C_Commit_Push_Instruction.md   docs/AI/43_Gemini_Milestone5B_Phase2C_Whitespace_Fix_Commit_Push_Instruction.md   scripts/document-verification/verify-career-up-profile-driven.mjs   src/profiles/tests/profile-driven-career-up-integration.test.ts
```

### 5. staged差分監査

```bash
git diff --cached --check
git diff --cached --name-only
git diff --cached --stat
git status -sb
```

確認事項：

- stagedファイルが上記8ファイルだけ
- `git diff --cached --check` が成功
- 対象外ファイルなし
- 意図しないロジック変更なし

問題があればcommitせず停止してください。

### 6. Commit

すべての必須条件を満たす場合のみ実行してください。

```bash
git commit -m "feat: add profile-driven career-up verification path"
```

### 7. Push

commit成功後に実行してください。

```bash
git push -u origin feature/milestone-5b-phase2c-career-up-integration
```

### 8. 最終確認

```bash
git status -sb
git log -1 --oneline
git rev-parse HEAD
```

## 完了報告

次を簡潔に報告してください。

1. 必須検証コマンドごとの結果
2. 対象ファイル個別Lintの結果
3. 全体Lintの既存ベースライン
   - 79件
   - Error 56件
   - Warning 23件
   - 今回対象ファイルに新規エラーなし
4. stagedファイル一覧
5. commit hash
6. commit message
7. push先ブランチ
8. 最終 `git status -sb`
9. 未解決事項として、既存Lintベースラインが残っていること

必須検証失敗時は、commit・pushを行っていないことを明記してください。
