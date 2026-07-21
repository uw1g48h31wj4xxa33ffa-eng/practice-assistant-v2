# Gemini作業指示書

## 対象
Milestone 5-B / Phase 2-C

## 目的
承認済みのPhase 2-C変更のみを、最終確認後にコミットし、現在の作業ブランチへpushする。

## 前提
- 対象ブランチ：`feature/milestone-5b-phase2c-career-up-integration`
- 実装内容と検証結果は承認済み。
- 自動fallbackは追加しない。
- legacy経路、UI、API、Template Registry、既存Word生成仕様は変更しない。
- 身勝手な推測や独断は絶対にしないでください。指示書を忠実に守ってください。

## 作業手順

### 1. 状態確認
以下を実行する。

```bash
git branch --show-current
git status -sb
git diff --check
```

次の場合は停止して報告する。

- ブランチが指定ブランチと異なる
- 想定外の変更ファイルが存在する
- `git diff --check` が失敗する
- コンフリクト、未完了merge、rebase、cherry-pickが存在する

### 2. 最終検証
以下を実行する。

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

1つでも失敗した場合は、修正・stage・commit・pushを行わず停止して報告する。

### 3. コミット対象
以下のみを対象とする。

```text
docs/AI/06_Verification_Result.json
docs/AI/39_Gemini_Milestone5B_Phase2C_PreImplementation_Investigation.md
docs/AI/40_Milestone5B_Phase2C_Design_Decision.md
docs/AI/41_Gemini_Milestone5B_Phase2C_Implementation_Instruction.md
scripts/document-verification/verify-career-up-profile-driven.mjs
src/profiles/tests/profile-driven-career-up-integration.test.ts
```

想定外ファイルはstageしない。

### 4. stage前監査
以下を実行し、対象が上記と一致することを確認する。

```bash
git status --short
git diff --name-only
```

未追跡ファイルについては内容を再確認する。

### 5. 対象限定stage

```bash
git add \
  docs/AI/06_Verification_Result.json \
  docs/AI/39_Gemini_Milestone5B_Phase2C_PreImplementation_Investigation.md \
  docs/AI/40_Milestone5B_Phase2C_Design_Decision.md \
  docs/AI/41_Gemini_Milestone5B_Phase2C_Implementation_Instruction.md \
  scripts/document-verification/verify-career-up-profile-driven.mjs \
  src/profiles/tests/profile-driven-career-up-integration.test.ts
```

### 6. staged差分確認

```bash
git diff --cached --check
git diff --cached --name-only
git diff --cached --stat
```

対象外ファイルが含まれる場合はcommitせず停止する。

### 7. コミット

```bash
git commit -m "feat: add profile-driven career-up verification path"
```

### 8. push

```bash
git push -u origin feature/milestone-5b-phase2c-career-up-integration
```

### 9. 完了確認

```bash
git status -sb
git log -1 --oneline --decorate
```

## 完了報告
以下を簡潔に報告する。

1. 実行した検証コマンドと結果
2. テスト件数
3. commit hash
4. commit message
5. push先ブランチ
6. 最終`git status -sb`
7. 警告または未解決事項

## 禁止事項
- 対象外ファイルの変更・stage・commit
- テスト期待値の都合のよい変更
- エラーやWarningの握りつぶし
- `--no-verify`の使用
- force push
- mainへの直接push
- 承認されていない追加実装
