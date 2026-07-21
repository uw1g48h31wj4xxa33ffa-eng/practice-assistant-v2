# Claude実装監査指示書：Milestone 5-B / Phase 2-E 共通Profile Verification Runner実装監査

## 目的

Geminiが実装したMilestone 5-B / Phase 2-Eの共通`ProfileVerificationRunner`について、実コード・Git差分・テスト証跡を根拠に厳密な実装監査を実施してください。

本監査の目的は、Geminiの完了報告を追認することではありません。次を独立に検証し、Phase 2-E実装を承認できるか判断することです。

- 共通Runnerの責務と依存境界
- Verifier必須性
- `inputsToFill`の伝播
- `manualCheck` / `humanReview`の扱い
- legacy fallback不在
- Career-up固有依存の混入有無
- 既存テスト・期待値・互換性
- 変更範囲
- 実行証跡
- commit / push / working tree状態

---

## 最重要ルール

身勝手な推測や独断は絶対にしないでください。指示書を忠実に守ってください。

- 実装しないでください。
- コードを修正しないでください。
- Geminiの自己申告を証拠として扱わないでください。
- 実コード・Git差分・テスト結果を根拠に判断してください。
- 不明点を推測で補完しないでください。
- 指示範囲外の変更を承認しないでください。
- legacy fallbackを容認しないでください。
- Verifier省略経路を容認しないでください。
- `manualCheck` / `humanReview`の意味を弱めないでください。
- 既存期待値変更によるテスト通過を承認しないでください。
- 重大不備がある場合は「差戻し」としてください。
- 軽微な修正で安全性が確保できる場合のみ「条件付き承認」としてください。

---

## 対象ブランチ

```text
feature/milestone-5b-phase2c-career-up-integration
```

## 期待状態

Gemini実装commitがHEADであり、working treeがcleanであること。

commit messageは以下の報告です。

```text
feat(ai-package): implement ProfileVerificationRunner Core for Milestone 5B Phase 2-E
```

完全hashは実際の`git log`で確認してください。

---

## 事前確認

最初に以下を実行してください。

```bash
git branch --show-current
git status -sb
git log -8 --oneline
git rev-parse HEAD
```

以下の場合は監査を停止してください。

- 対象ブランチではない
- working treeがcleanではない
- Gemini実装commitを特定できない
- Claude設計監査commit `0d30ffe` 以降の実装差分を特定できない

---

## 比較基点

実装差分は原則として以下を基点に確認してください。

```text
0d30ffe
```

実行例：

```bash
git diff --stat 0d30ffe..HEAD
git diff --name-only 0d30ffe..HEAD
git diff 0d30ffe..HEAD
```

Gemini実装が複数commitに分かれている場合は、`0d30ffe..HEAD`全体を監査してください。

---

## 必読資料

```text
docs/AI/01_AI_Package.md
docs/AI/52_Gemini_Milestone5B_Phase2E_Architecture_Design.md
docs/AI/53_Claude_Milestone5B_Phase2E_Architecture_Audit.md
docs/AI/54_Gemini_Milestone5B_Phase2E_Common_Runner_Implementation_Instruction.md
```

---

## 必読コード

```text
src/profiles/runner/profile-verification-runner.ts
src/profiles/tests/profile-verification-runner.test.ts
src/profiles/tests/profile-driven-career-up-integration.test.ts

scripts/document-verification/verify-career-up-profile-driven.mjs
scripts/document-verification/verify-career-up-form1.mjs
scripts/document-verification/config/career-up-r8-form1.mapping.mjs
scripts/document-verification/config/career-up-r8-form1-fields.json

src/profiles/types/form-profile.ts
src/profiles/types/mapping-profile.ts
src/profiles/types/execution-context.ts
src/profiles/registry/profile-registry.ts
src/profiles/resolution/profile-resolver.ts
src/profiles/resolution/adapter.ts
src/profiles/resolution/execution-context-builder.ts

scripts/document-verification/core/dom-serialization-verifier.mjs
```

存在する場合は以下も確認してください。

```text
OutputVerifier
GenerationResultDTO
Template Registry
Word generation entrypoint
src/profiles/index.ts
```

---

# 監査観点

## 1. 変更範囲監査

`0d30ffe..HEAD`の変更ファイルを列挙し、以下を確認してください。

### 許可想定

```text
src/profiles/runner/profile-verification-runner.ts
src/profiles/tests/profile-verification-runner.test.ts
src/profiles/tests/profile-driven-career-up-integration.test.ts
scripts/document-verification/verify-career-up-profile-driven.mjs
docs/AI/54_Gemini_Milestone5B_Phase2E_Common_Runner_Implementation_Instruction.md
src/profiles/index.ts
```

`src/profiles/index.ts`は必要最小限の場合のみ許容します。

### 変更禁止

```text
scripts/document-verification/verify-career-up-form1.mjs
scripts/document-verification/config/career-up-r8-form1.mapping.mjs
scripts/document-verification/config/career-up-r8-form1-fields.json
src/profiles/registry/profile-registry.ts
src/profiles/resolution/profile-resolver.ts
src/profiles/resolution/adapter.ts
src/profiles/resolution/execution-context-builder.ts
既存Verifier Core
既存Word生成Core
template
UI
API
Practice Assistant V2画面
```

予期しない変更がある場合は、重要度と影響を明記してください。

---

## 2. 共通Runner責務監査

`ProfileVerificationRunner`が以下を適切に担っているか確認してください。

```text
Config検証
FormProfile解決
MappingProfile解決
Profile整合性検証
Adapter解決
Adapter実行
ExecutionContext構築
template解決
template存在確認
template hash検証
Word生成呼出し
inputsToFill取得
必須Verifier実行
Result集約
```

確認事項：

- Career-up固有ロジックが混入していない
- CLI表示やprocess exit codeをCoreが担当していない
- 状態をインスタンスへ不用意に保持していない
- 並列実行時に状態混線しない
- Runnerが過剰な責務を持っていない
- wrapperが十分に薄くなっている

---

## 3. Career-up固有依存監査

共通Runnerから以下がimportされていないことを確認してください。

```text
verify-career-up-form1.mjs
career-up-r8-form1.mapping.mjs
career-up-r8-form1-fields.json
career-up
```

実行例：

```bash
grep -nE "career-up|verify-career-up-form1|career-up-r8-form1" \
  src/profiles/runner/profile-verification-runner.ts
```

共通RunnerにCareer-up固有文字列・ID・path・mappingが埋め込まれていないことも確認してください。

---

## 4. Dependencies / Config分離監査

以下が分離されているか確認してください。

### Dependencies

```text
registry
startWordGeneration
runVerifier
```

### Execution Config

```text
formProfileId
mappingProfileId
effectiveDate
inputData
outputPath
```

確認事項：

- `registry`がConfigに混在していない
- `startWordGeneration`がConfigに混在していない
- `runVerifier`がConfigに混在していない
- `templatePath`を呼び出し側が重複指定していない
- adapterを呼び出し側から直接指定していない
- dependency objectがconstructorで固定されている
- configが1回の実行入力に限定されている

---

## 5. Verifier必須性監査

重点監査対象です。

以下を確認してください。

- `runVerifier`がoptionalではない
- `runVerifier?:`が存在しない
- Verifier未指定でsuccessを返せない
- Word生成成功後、Verifierが必ず呼ばれる
- Verifier失敗時、successを返さない
- OutputVerifierへ必要な情報が渡る
- DomSerializationVerifierの既存責務が失われていない
- テストでVerifier実行回数がspy確認されている

実行例：

```bash
grep -R "runVerifier?:" src/profiles scripts/document-verification
grep -R "runVerifier" src/profiles/runner src/profiles/tests scripts/document-verification/verify-career-up-profile-driven.mjs
```

---

## 6. `inputsToFill`伝播監査

以下を確認してください。

- `startWordGeneration`が`Promise<void>`ではない
- Word生成結果から`inputsToFill`相当を取得する
- `inputsToFill`がVerifierへそのまま伝播する
- wrapper側で欠落・再構築・固定値化されていない
- OutputVerifierが期待するmapping/input形式と整合する
- 空値やundefined時の挙動が明確
- テストで同一参照または同値伝播を検証している

実装上の型を報告書にそのまま記載してください。

---

## 7. manualCheck / humanReview監査

Gemini報告には「Word生成時にのみフラグを抽出」とあります。ここは重点監査してください。

以下を確認してください。

- フラグの情報源が正しい
- Word生成結果だけを見てよい設計か
- Verifier結果側のフラグを無視していないか
- 複数情報源がある場合の集約規則
- `manualCheck` / `humanReview`がthrow条件になっていない
- success-with-reviewとしてResultへ返る
- wrapper / CLIで欠落しない
- テストでtrue/false両方を確認している

設計監査報告との不一致がある場合は、必ず指摘してください。

---

## 8. Error境界監査

以下を確認してください。

- Coreは予期可能な致命的失敗を識別可能なcode付きでthrow
- wrapper境界で必要に応じてcatch
- エラー握りつぶしがない
- original causeが保持される
- error codeの誤変換がない
- Word生成失敗時にVerifierが実行されない
- template hash不一致時にWord生成されない
- Form/Mapping解決失敗時に副作用が始まらない

最低限、以下のcodeの実装有無を確認してください。

```text
FORM_PROFILE_NOT_FOUND
MAPPING_PROFILE_NOT_FOUND
PROFILE_VALIDATION_FAILED
ADAPTER_RESOLUTION_FAILED
ADAPTER_EXECUTION_FAILED
TEMPLATE_NOT_FOUND
TEMPLATE_HASH_MISMATCH
WORD_GENERATION_FAILED
VERIFICATION_FAILED
OUTPUT_INVALID
```

未実装codeがある場合、実際に必要な失敗経路と対応しているか評価してください。

---

## 9. legacy fallback監査

以下を確認してください。

- profile-driven失敗時にlegacy runnerを呼ばない
- catch後にlegacy mappingへ切り替えない
- wrapperからlegacy runnerをimportしない
- 共通Runnerからlegacy runnerをimportしない
- テストがfallback 0回を明示的に証明している
- legacy verification script自体は変更されていない

実行例：

```bash
grep -nE "verify-career-up-form1|legacy|fallback" \
  src/profiles/runner/profile-verification-runner.ts \
  scripts/document-verification/verify-career-up-profile-driven.mjs \
  src/profiles/tests/profile-verification-runner.test.ts
```

---

## 10. 既存期待値変更監査

統合テストの変更を重点確認してください。

Gemini報告には、既存Integration TestのTest 6〜9等を修正したとあります。

以下を確認してください。

- 新API接続に必要なmechanical changeのみか
- expected valueが変更されていないか
- assertion数が減っていないか
- テストケースが削除されていないか
- failure assertionが緩められていないか
- mockが過度に単純化されていないか
- drift検出が維持されているか
- legacy fallback不在検証が維持されているか
- Word出力互換性が維持されているか

実行例：

```bash
git diff 0d30ffe..HEAD -- src/profiles/tests/profile-driven-career-up-integration.test.ts
```

期待値変更が実装都合で行われている場合はHigh以上としてください。

---

## 11. 単体テスト網羅性監査

新規テストが以下を本当に検証しているか確認してください。

### P0

```text
正常系
Word生成1回
Verifier1回
FormProfile未登録
MappingProfile未登録
Profile validation失敗
Adapter解決失敗
Adapter実行失敗
template未存在
template hash不一致
Word生成失敗
Verifier失敗
Verifier必須
legacy fallback 0回
manualCheck
humanReview
```

### P1

```text
effectiveDate不一致
deterministic result
concurrent execution
dependency差替え
outputPath伝播
inputsToFill伝播
```

各項目を以下で分類してください。

```text
実装済み
一部実装
未実装
不要
```

単にテストファイルに記述があるだけでなく、assertionが実際に条件を証明しているか確認してください。

---

## 12. 実行検証

Claude自身で以下を実行してください。

実際のpackage script名は`package.json`で確認し、存在しないcommandを推測しないでください。

### 対象テスト

```bash
npx tsx --test src/profiles/tests/profile-verification-runner.test.ts
npx tsx --test src/profiles/tests/profile-driven-career-up-integration.test.ts
npx tsx --test src/profiles/tests/*.test.ts
```

`node --test`で実行される構成なら、実際の正しいcommandを使用してください。

### legacy verification

```bash
npm run verify:career-up
```

### Profile-driven verification

```bash
npm run verify:career-up:profile-driven
```

### 全体検証

```bash
npm run ai:verify
npm run build
```

### lint

対象限定：

```bash
npx eslint \
  src/profiles/runner/profile-verification-runner.ts \
  src/profiles/tests/profile-verification-runner.test.ts \
  src/profiles/tests/profile-driven-career-up-integration.test.ts \
  scripts/document-verification/verify-career-up-profile-driven.mjs
```

全体：

```bash
npm run lint
```

### Git検証

```bash
git diff --check 0d30ffe..HEAD
git status -sb
```

各commandについて以下を記録してください。

```text
command
exit code
主要stdout
PASS / FAIL
```

---

## 13. commit監査

以下を確認してください。

- commit message
- commit hash
- author / timestamp
- changed files
- 指示書がcommitに含まれているか
- 予期しないファイルが含まれていないか
- push先branch
- remoteとlocalが一致
- working tree clean

実行例：

```bash
git show --stat --oneline HEAD
git show --name-only --format=fuller HEAD
git status -sb
git rev-parse HEAD
git rev-parse origin/feature/milestone-5b-phase2c-career-up-integration
```

---

# 判定基準

## 承認

以下をすべて満たす場合のみ。

- 指示範囲内の差分
- 共通RunnerにCareer-up固有依存なし
- Dependencies / Config分離
- Verifier必須
- `inputsToFill`正しく伝播
- `manualCheck` / `humanReview`正しく伝播
- legacy fallbackなし
- 既存期待値を弱めていない
- 必須P0テスト十分
- 全検証PASS
- commit / push / working tree正常

## 条件付き承認

- 安全性に直結しない軽微な不足のみ
- 修正範囲が限定的
- legacy / Verifier / output互換性に問題なし

## 差戻し

以下のいずれかがある場合。

- Verifier省略経路
- legacy fallback
- `inputsToFill`欠落
- Career-up固有依存が共通Runnerへ混入
- manualCheck / humanReviewの誤処理
- 既存期待値の緩和
- 指示範囲外変更
- 重大テスト不足
- 実行検証FAIL
- エラー握りつぶし
- working tree / remote不整合

---

# 必須成果物

以下を新規作成してください。

```text
docs/AI/55_Claude_Milestone5B_Phase2E_Implementation_Audit.md
```

---

# 監査報告書の必須構成

```text
# Claude監査報告：Milestone 5-B / Phase 2-E Implementation Audit

## 1. Executive Verdict

## 2. Scope and Evidence

## 3. Git Diff Audit

## 4. Common Runner Responsibility Audit

## 5. Dependency Boundary Audit

## 6. Verifier Requirement Audit

## 7. inputsToFill Propagation Audit

## 8. manualCheck / humanReview Audit

## 9. Error Boundary Audit

## 10. Legacy Fallback Audit

## 11. Integration Test Change Audit

## 12. Unit Test Coverage Audit

## 13. Execution Verification

## 14. Findings

## 15. Required Corrections

## 16. Final Recommendation
```

---

## Findings形式

```text
Finding ID
Severity
File
Line / Symbol
Problem
Evidence
Impact
Required Correction
```

Severity：

```text
Critical
High
Medium
Low
```

---

## Executive Verdict

以下のいずれかを明示してください。

```text
承認
条件付き承認
差戻し
```

---

## 実装確定情報

報告書末尾に、以下を明記してください。

```text
Runner形態
Dependencies型
Execution Config型
Result型
Error型
Verifier必須性
inputsToFill伝播
manualCheck / humanReviewの情報源と集約方法
template解決方法
legacy fallback回数
Career-up固有import数
変更ファイル
テスト件数
全検証結果
commit hash
push状態
working tree状態
```

---

# 変更対象

原則として新規作成を許可するのは以下のみです。

```text
docs/AI/55_Claude_Milestone5B_Phase2E_Implementation_Audit.md
```

本指示書がrepositoryに配置されている場合は、以下も許可します。

```text
docs/AI/55_Claude_Milestone5B_Phase2E_Implementation_Audit_Instruction.md
```

上記以外を変更しないでください。

---

# 検証

```bash
git diff --check
git status -sb
git diff --stat
git diff --name-only
git diff -- docs/AI/55_Claude_Milestone5B_Phase2E_Implementation_Audit.md
npm run ai:verify
```

`docs/AI/06_Verification_Result.json`が変更された場合は、内容確認後、今回の成果物でなければstageせず元に戻してください。

---

# Git操作

全検証通過後のみ実施してください。

```bash
git add \
  docs/AI/55_Claude_Milestone5B_Phase2E_Implementation_Audit.md \
  docs/AI/55_Claude_Milestone5B_Phase2E_Implementation_Audit_Instruction.md
```

本指示書がrepository内にない場合は、監査報告書のみstageしてください。

`git add .`は禁止です。

```bash
git diff --cached --check
git diff --cached --stat
git diff --cached --name-only
git diff --cached
```

commit：

```bash
git commit -m "docs: audit phase 2e common runner implementation"
```

push：

```bash
git push origin feature/milestone-5b-phase2c-career-up-integration
```

最終確認：

```bash
git status -sb
git log -2 --oneline
git rev-parse HEAD
```

---

# 完了条件

- 実コードとGit差分を独立監査
- 変更範囲を確認
- 共通Runner責務を確認
- Career-up固有依存0件を確認
- Dependencies / Config分離を確認
- Verifier必須性を確認
- `inputsToFill`伝播を確認
- manualCheck / humanReview処理を確認
- legacy fallback 0回を確認
- 既存期待値変更を監査
- 単体テスト網羅性を評価
- Claude自身で全検証を実行
- commit / push / working treeを確認
- 実装コードを変更していない
- 監査報告書作成
- `git diff --check` PASS
- `ai:verify` PASS
- 対象限定commit
- push成功
- working tree clean

---

# 停止条件

以下の場合はcommit・pushせず停止してください。

1. working treeがcleanではない
2. 対象branchではない
3. 実装commitを特定できない
4. `0d30ffe..HEAD`差分を確認できない
5. 必読コードを確認できない
6. 予期しない差分が発生
7. 監査に必要なtest commandを特定できない
8. 実行検証が途中で失敗し、原因を判定できない
9. `git diff --check`失敗
10. `ai:verify`失敗

---

# 完了報告

以下を簡潔に報告してください。

1. 監査報告書パス
2. Executive Verdict
3. Critical / High指摘
4. 変更ファイル監査結果
5. 共通RunnerのCareer-up固有依存数
6. Verifier必須性
7. `inputsToFill`伝播結果
8. manualCheck / humanReview判定
9. legacy fallback回数
10. 既存期待値変更の有無
11. 単体テスト網羅性
12. 対象テスト結果
13. Profile全テスト結果
14. legacy verification結果
15. profile-driven verification結果
16. ai:verify結果
17. build結果
18. 対象lint結果
19. 全体lint結果
20. git diff --check結果
21. 監査commit hash
22. push結果
23. 最終git status
24. 次工程
