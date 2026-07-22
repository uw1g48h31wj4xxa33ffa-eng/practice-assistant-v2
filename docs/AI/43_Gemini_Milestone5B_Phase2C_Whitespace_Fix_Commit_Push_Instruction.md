# Gemini指示書：Milestone 5-B Phase 2-C 空白修正・再検証・Commit・Push

## 目的

`git diff --cached --check` で検出された trailing whitespace およびファイル末尾の不要な空行のみを修正し、再検証後、対象ファイルをcommit・pushしてください。

## 最重要ルール

身勝手な推測や独断は絶対にしないでください。指示書を忠実に守ってください。

- 機能仕様、テスト内容、設計内容、処理ロジックは変更しないでください。
- 修正対象は、行末空白とファイル末尾の不要な空行だけです。
- エラーを握りつぶさないでください。
- 指示対象外ファイルをstage・commitしないでください。
- 検証が1つでも失敗した場合、commit・pushせず停止して報告してください。
- `git add -A`、`git add .` は使用しないでください。
- commit前に必ず staged 差分と対象ファイル一覧を確認してください。

## 対象ブランチ

```text
feature/milestone-5b-phase2c-career-up-integration
```

異なるブランチの場合は、何も変更せず停止してください。

## 修正対象

次のファイルについて、行末空白とファイル末尾の不要な空行だけを除去してください。

```text
docs/AI/40_Milestone5B_Phase2C_Design_Decision.md
docs/AI/41_Gemini_Milestone5B_Phase2C_Implementation_Instruction.md
scripts/document-verification/verify-career-up-profile-driven.mjs
src/profiles/tests/profile-driven-career-up-integration.test.ts
```

次のファイルは内容を変更せず、commit対象として扱ってください。

```text
docs/AI/06_Verification_Result.json
docs/AI/39_Gemini_Milestone5B_Phase2C_PreImplementation_Investigation.md
docs/AI/42_Gemini_Milestone5B_Phase2C_Commit_Push_Instruction.md
```

## 手順

### 1. 状態確認

```bash
git branch --show-current
git status -sb
git diff --check
```

ブランチが指定と異なる場合は停止してください。

### 2. 空白のみ修正

上記4ファイルについて、以下だけを修正してください。

- trailing whitespace
- ファイル末尾の不要な複数空行

ロジック、文言、コメント、テスト期待値、import、改行構造は変更しないでください。

### 3. 修正後の差分確認

```bash
git diff --check
git diff --stat
git diff --name-only
```

対象外ファイルに変更がある場合は停止してください。

### 4. 全検証

以下を順番に実行してください。

```bash
npx tsx --test src/profiles/tests/*.test.ts
node scripts/document-verification/verify-career-up-form1.mjs
npx tsx scripts/document-verification/verify-career-up-profile-driven.mjs
npx eslint src/profiles/tests/profile-driven-career-up-integration.test.ts scripts/document-verification/verify-career-up-profile-driven.mjs
npm run lint
npm run build
npm run ai:verify
git diff --check
```

`npm run lint` を `|| true` で無効化しないでください。

1つでも失敗した場合は停止し、失敗コマンド・exit code・主要な標準出力を報告してください。

### 5. 対象ファイル限定stage

次の7ファイルだけをstageしてください。

```bash
git add   docs/AI/06_Verification_Result.json   docs/AI/39_Gemini_Milestone5B_Phase2C_PreImplementation_Investigation.md   docs/AI/40_Milestone5B_Phase2C_Design_Decision.md   docs/AI/41_Gemini_Milestone5B_Phase2C_Implementation_Instruction.md   docs/AI/42_Gemini_Milestone5B_Phase2C_Commit_Push_Instruction.md   scripts/document-verification/verify-career-up-profile-driven.mjs   src/profiles/tests/profile-driven-career-up-integration.test.ts
```

### 6. staged差分監査

```bash
git diff --cached --check
git diff --cached --name-only
git diff --cached --stat
git status -sb
```

次を確認してください。

- stagedファイルが上記7ファイルだけである
- `git diff --cached --check` が成功する
- 対象外ファイルが含まれていない
- 意図しないロジック変更がない

問題がある場合はcommitせず停止してください。

### 7. Commit

すべて正常な場合だけ実行してください。

```bash
git commit -m "feat: add profile-driven career-up verification path"
```

### 8. Push

commit成功後に実行してください。

```bash
git push -u origin feature/milestone-5b-phase2c-career-up-integration
```

### 9. 最終確認

```bash
git status -sb
git log -1 --oneline
git rev-parse HEAD
```

## 完了報告

次を簡潔に報告してください。

1. 修正した空白の対象ファイル
2. 各検証コマンドの成功・失敗
3. commit hash
4. commit message
5. push先ブランチ
6. 最終 `git status -sb`
7. 未解決の警告・エラーの有無

検証失敗時は、commit・pushを行っていないことを明記してください。
