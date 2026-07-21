# Gemini修正指示書：Milestone 5-B / Phase 2-E 監査指摘F1〜F6フォローアップ

## 目的

Claude監査報告書

```text
docs/AI/55_Claude_Milestone5B_Phase2E_Implementation_Audit.md
```

で条件付き承認となったPhase 2-E実装について、F1〜F6の指摘を必要最小限の差分で一括修正し、Phase 2-Eを完了可能な状態にしてください。

本作業では、新機能追加、設計変更、Phase 2-F実装、AI_Package更新は行いません。

---

## 最重要ルール

身勝手な推測や独断は絶対にしないでください。指示書を忠実に守ってください。

- Claude監査報告書のF1〜F6だけを修正してください。
- 指示範囲を勝手に拡張しないでください。
- legacy runner、legacy mapping、field JSONを変更しないでください。
- Verifier仕様を変更しないでください。
- `inputsToFill`伝播仕様を変更しないでください。
- manualCheck / humanReview契約を変更しないでください。
- 自動legacy fallbackを追加しないでください。
- 既存テストを削除、skip、only化しないでください。
- 既存期待値を実装都合で弱めないでください。
- 無関係なリファクタリングをしないでください。
- `git add .`、`git add -A`は禁止です。
- 予期しない差分または検証失敗がある場合はcommit・pushせず停止してください。

---

## 対象ブランチ

```text
feature/milestone-5b-phase2c-career-up-integration
```

## 期待HEAD

```text
ceb74c01c4d636c080cc92fc6edee849f2e5efc7
```

commit message:

```text
docs: audit phase 2e common runner implementation
```

---

## 事前確認

```bash
git branch --show-current
git status -sb
git log -5 --oneline
git rev-parse HEAD
```

以下を確認してください。

- 対象ブランチである
- working treeがclean
- HEADが`ceb74c01c4d636c080cc92fc6edee849f2e5efc7`

一致しない場合は停止してください。

---

## 必読資料

```text
docs/AI/54_Gemini_Milestone5B_Phase2E_Common_Runner_Implementation_Instruction.md
docs/AI/55_Claude_Milestone5B_Phase2E_Implementation_Audit.md
```

## 対象コード

```text
src/profiles/runner/profile-verification-runner.ts
src/profiles/tests/profile-verification-runner.test.ts
scripts/document-verification/verify-career-up-profile-driven.mjs
```

---

# 修正内容

## F1・F4：FormProfile未登録テストとMappingProfile未登録テストの分離

対象：

```text
src/profiles/tests/profile-verification-runner.test.ts
```

現在、P0-2とP0-3が実質的に同じMappingProfile未登録シナリオになっています。

### P0-2

FormProfile未登録を正確にテストしてください。

```ts
formProfileId: "missing-form"
mappingProfileId: "test-map"
```

確認事項：

- FormProfile未登録として失敗する
- Word生成0回
- Verifier0回
- 実際のRunner契約に対応するエラーコードを確認する
- MappingProfile未登録テストと重複しない

### P0-3

MappingProfile未登録を正確にテストしてください。

```ts
formProfileId: "test-form"
mappingProfileId: "missing-map"
```

確認事項：

- MappingProfile未登録として失敗する
- Word生成0回
- Verifier0回
- P0-2とは別の失敗経路を確認する

テスト名と実入力を一致させてください。

---

## F2：templateHash未定義とhash不一致のエラー意味を分離

対象：

```text
src/profiles/runner/profile-verification-runner.ts
src/profiles/tests/profile-verification-runner.test.ts
```

現在、`formProfile.templateHash`が未定義の場合にも

```text
TEMPLATE_HASH_MISMATCH
```

を返しています。

これは「期待hashが存在しない」と「実ファイルhashが期待値と一致しない」を混同しています。

### 必須修正

1. `templateHash`未定義時は、Profile定義不正を表す明確なエラーコードへ変更してください。
2. 実際のhash値不一致時だけ`TEMPLATE_HASH_MISMATCH`を使用してください。
3. 既存エラー体系に適切なコードが存在する場合は再利用してください。
4. 存在しない場合のみ、最小限の新コードを追加してください。

推奨候補：

```text
FORM_PROFILE_INVALID
```

ただし、既存コードとの整合性を確認したうえで決定してください。

### テスト

最低限、以下を区別してください。

- `templateHash`未定義
- 実際のtemplate hash不一致

両者が同じエラーコードにならないことを確認してください。

既存`VersionGuard.verifyHash`等のhash検証経路を独断で再実装しないでください。

---

## F3：trailing whitespace除去

以下の監査指摘箇所を修正してください。

```text
scripts/document-verification/verify-career-up-profile-driven.mjs
src/profiles/tests/profile-verification-runner.test.ts
```

監査時の該当箇所：

```text
verify-career-up-profile-driven.mjs:237
profile-verification-runner.test.ts:51
profile-verification-runner.test.ts:104
```

行番号は差分で変化する可能性があります。

以下で最終確認してください。

```bash
git diff --check
```

exit code 0を必須とします。

---

## F5：manualCheck=false / humanReview=false明示テスト追加

対象：

```text
src/profiles/tests/profile-verification-runner.test.ts
```

以下のテストを追加してください。

### 条件

`inputsToFill`が次のいずれかであるケースを使用してください。

- 空
- 全fieldの`manualCheck`がfalse
- 全fieldの`humanReview`がfalse

### 確認

```text
result.manualCheck === false
result.humanReview === false
```

併せて以下も維持してください。

- Word生成1回
- Verifier1回
- success result
- false値が欠落、undefined、trueへ変換されない

既存のtrue伝播テストは残してください。

---

## F6：共通Runner内コメントの汎用化

対象：

```text
src/profiles/runner/profile-verification-runner.ts
```

以下のようなCareer-up / legacy固有に見えるコメントを削除または汎用化してください。

```text
We assume fieldDefinitions contains 'fields' array as per current legacy/career-up format
```

例：

```text
fieldDefinitions.fields が配列であることを前提とする
```

または、コードから自明でコメント不要なら削除してください。

機能コードは変更しないでください。

---

# 変更許可ファイル

```text
src/profiles/runner/profile-verification-runner.ts
src/profiles/tests/profile-verification-runner.test.ts
scripts/document-verification/verify-career-up-profile-driven.mjs
docs/AI/56_Gemini_Milestone5B_Phase2E_Audit_Followup_Instruction.md
```

エラーコードのexportに必要な場合のみ、既存のRunner exportファイルを最小変更可能とします。

それ以外のファイル変更が必要になった場合は停止してください。

---

# 変更禁止

```text
scripts/document-verification/verify-career-up-form1.mjs
scripts/document-verification/config/career-up-r8-form1.mapping.mjs
scripts/document-verification/config/career-up-r8-form1-fields.json
src/profiles/registry/**
src/profiles/resolution/**
既存Verifier Core
既存Word生成Core
template
UI
API
Practice Assistant V2画面
docs/AI/01_AI_Package.md
docs/AI/55_Claude_Milestone5B_Phase2E_Implementation_Audit.md
```

監査報告書は履歴証拠なので書き換えないでください。

---

# 必須検証

## 対象テスト

```bash
npx tsx --test src/profiles/tests/profile-verification-runner.test.ts
npx tsx --test src/profiles/tests/profile-driven-career-up-integration.test.ts
npx tsx --test src/profiles/tests/*.test.ts
```

## legacy verification

`package.json`を確認し、既存の正しいcommandを使用してください。

想定：

```bash
npm run verify:career-up
```

## Profile-driven verification

想定：

```bash
npm run verify:career-up:profile-driven
```

script名が異なる場合は実在するcommandを使用してください。

## 全体検証

```bash
npm run ai:verify
npm run build
```

## 対象限定lint

```bash
npx eslint \
  src/profiles/runner/profile-verification-runner.ts \
  src/profiles/tests/profile-verification-runner.test.ts \
  scripts/document-verification/verify-career-up-profile-driven.mjs
```

対象限定lintは0 errors / 0 warningsを必須とします。

## 全体lint

```bash
npm run lint
```

既存baseline：

```text
56 errors
23 warnings
```

今回差分で悪化させないでください。

## 差分検証

```bash
git diff --check
git status -sb
git diff --stat
git diff --name-only
git diff
```

---

# 完了条件

以下をすべて満たした場合のみ完了です。

- P0-2がFormProfile未登録を正確に検証
- P0-3がMappingProfile未登録を正確に検証
- P0-2とP0-3の重複解消
- templateHash未定義とhash不一致のエラー意味を分離
- 実hash不一致時のみ`TEMPLATE_HASH_MISMATCH`
- manualCheck=falseテスト追加
- humanReview=falseテスト追加
- true伝播テスト維持
- Career-up / legacy固有コメントを汎用化または削除
- trailing whitespace 0件
- `git diff --check` PASS
- Runner単体テストPASS
- Career-up統合テストPASS
- Profile全テストPASS
- legacy verification PASS
- profile-driven verification PASS
- ai:verify PASS
- build PASS
- 対象限定lint 0 errors / 0 warnings
- 全体lint baseline非悪化
- legacy fallback 0回維持
- Verifier必須性維持
- `inputsToFill`伝播維持
- 変更禁止ファイル差分0件
- 対象限定stage
- commit成功
- push成功
- working tree clean

---

# 停止条件

以下の場合はcommit・pushせず停止してください。

1. working treeがcleanではない
2. HEADが期待commitと一致しない
3. 対象ブランチではない
4. Claude監査報告書を確認できない
5. F1〜F6以外の修正が必要になる
6. 変更禁止ファイルの修正が必要になる
7. エラーコード修正に大規模な設計変更が必要になる
8. 既存期待値を弱める必要がある
9. Verifier契約変更が必要になる
10. legacy fallback追加が必要になる
11. 対象テストが失敗する
12. Profile全テストが失敗する
13. legacy verificationが失敗する
14. profile-driven verificationが失敗する
15. ai:verifyが失敗する
16. buildが失敗する
17. 対象限定lintに問題がある
18. 全体lint baselineが悪化する
19. `git diff --check`が失敗する
20. 予期しない差分が発生する

---

# Git操作

全検証通過後のみ実施してください。

## stage

```bash
git add \
  src/profiles/runner/profile-verification-runner.ts \
  src/profiles/tests/profile-verification-runner.test.ts \
  scripts/document-verification/verify-career-up-profile-driven.mjs \
  docs/AI/56_Gemini_Milestone5B_Phase2E_Audit_Followup_Instruction.md
```

指示書がrepository内に存在しない場合はstage対象から除外してください。

必要かつ許可されたexportファイルを変更した場合のみ、そのファイルを明示追加してください。

`git add .`は禁止です。

## staged差分監査

```bash
git diff --cached --check
git diff --cached --stat
git diff --cached --name-only
git diff --cached
```

## commit

```bash
git commit -m "fix: resolve phase 2e audit findings"
```

## push

```bash
git push origin feature/milestone-5b-phase2c-career-up-integration
```

## 最終確認

```bash
git status -sb
git log -2 --oneline
git rev-parse HEAD
```

---

# 完了報告

以下を簡潔に報告してください。

1. 変更ファイル
2. F1修正内容
3. F2修正内容と採用エラーコード
4. F3修正箇所
5. F4重複解消結果
6. F5 falseテスト結果
7. F6コメント修正内容
8. Runner単体テスト件数・結果
9. 統合テスト件数・結果
10. Profile全テスト件数・結果
11. legacy verification結果
12. profile-driven verification結果
13. ai:verify結果
14. build結果
15. 対象限定lint結果
16. 全体lintとbaseline比較
17. git diff --check結果
18. legacy fallback 0回確認
19. Verifier必須性維持確認
20. inputsToFill伝播維持確認
21. commit hash
22. push結果
23. 最終git status
24. Phase 2-E完了可否
